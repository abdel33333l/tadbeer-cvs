import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const normalizePassport = (raw) => {
  if (!raw) return '';
  const cleaned = raw.replace(/\s+/g, '').toUpperCase();
  // Handle reversed format: "00202271B" → "B00202271"
  const match = cleaned.match(/^(\d+)([A-Z]+)$/);
  if (match) return match[2] + match[1];
  return cleaned;
};

export const extractExperienceFromText = (text) => {
  const expMatch = text.match(/Work Experience(.*?)(?:Skills SubForm|Knowledge Of Language|Passport|Declaration)/i);
  if (!expMatch) return [];

  const expText = expMatch[1];
  const results = [];
  
  const periodRegex = /(\d+\s*(?:YRS?|YEARS?|MOS)(?:\s*AND\s*\d+\s*MOS?)?)/gi;
  let match;
  let lastIndex = 0;

  // List of known GCC/common countries to help clean up extraction
  const knownCountries = [
    'SAUDI ARABIA', 'KSA', 'UAE', 'UNITED ARAB EMIRATES', 'DUBAI', 'ABU DHABI',
    'KUWAIT', 'QATAR', 'BAHRAIN', 'OMAN', 'JORDAN', 'LEBANON', 'EGYPT', 'SYRIA',
    'MALAYSIA', 'SINGAPORE', 'HONG KONG', 'TAIWAN', 'CYPRUS', 'TURKEY'
  ];

  while ((match = periodRegex.exec(expText)) !== null) {
    const period = match[1].trim().toUpperCase();
    const beforeText = expText.substring(lastIndex, match.index).trim().toUpperCase();
    
    let country = '';
    
    // 1. Try to find a known country in the text before the period
    const foundKnown = knownCountries.find(kc => beforeText.includes(kc));
    
    if (foundKnown) {
      country = foundKnown;
    } else {
      // 2. Fallback: Grab the last 1-2 words immediately before the period
      const words = beforeText.split(/\s+/).filter(w => /^[A-Z]+$/.test(w));
      
      // Filter out common noise words
      const noiseWords = ['IN', 'AT', 'TO', 'FOR', 'WORKED', 'AS', 'MAID', 'HOUSEMAID', 'CLEANER', 'NANNY', 'YEARS', 'YRS', 'AND', 'COUNTRY', 'PERIOD', 'EXPERIENCE'];
      const cleanWords = words.filter(w => !noiseWords.includes(w));
      
      country = cleanWords.slice(-2).join(' '); // Most country names are max 2 words
    }

    // Force strip just in case
    country = country.replace(/COUNTRY|PERIOD/gi, '').trim();

    if (country && period) {
      // Filter out table headers that might have been accidentally captured
      if (country.toUpperCase() !== 'COUNTRY' && period.toUpperCase() !== 'PERIOD') {
        results.push({ country, period });
      }
    }
    
    lastIndex = periodRegex.lastIndex;
  }
  
  return results;
};

/**
 * Attempts to find and extract the largest bitmap image on a PDF page (usually the worker photo).
 * Now returns an object with { profilePhoto, fullBodyPhoto } if multiple images exist.
 */
const extractImagesFromPage = async (page) => {
  const ops = await page.getOperatorList();
  const images = [];

  // Track transform to get positions
  let currentTransform = [1, 0, 0, 1, 0, 0];
  const transformStack = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];

    if (fn === pdfjsLib.OPS.save) {
      transformStack.push([...currentTransform]);
    } else if (fn === pdfjsLib.OPS.restore) {
      if (transformStack.length > 0) {
        currentTransform = transformStack.pop();
      }
    } else if (fn === pdfjsLib.OPS.transform) {
      const [a1, b1, c1, d1, e1, f1] = currentTransform;
      const [a2, b2, c2, d2, e2, f2] = args;
      currentTransform = [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1
      ];
    } else if (
      fn === pdfjsLib.OPS.paintJpegXObject || 
      fn === pdfjsLib.OPS.paintImageXObject
    ) {
      const name = args[0];
      const y = currentTransform[5]; // f is the y-coordinate in PDF space (0,0 is bottom-left)

      try {
        const img = await new Promise((resolve) => {
          try {
            if (page.objs.has(name)) {
              page.objs.get(name, (obj) => resolve(obj));
            } else if (page.commonObjs.has(name)) {
              page.commonObjs.get(name, (obj) => resolve(obj));
            } else {
              resolve(null);
            }
          } catch (e) { resolve(null); }
        });

        if (img && img.width > 100 && img.height > 100) {
          images.push({ obj: img, y });
        }
      } catch (e) {
        console.warn('Failed to load image object', e);
      }
    }
  }

  if (images.length === 0) return { profilePhoto: null, fullBodyPhoto: null };

  // Sort images by vertical position (descending in PDF space = top-to-bottom)
  images.sort((a, b) => b.y - a.y);

  const result = {
    profilePhoto: null,
    fullBodyPhoto: null
  };

  if (images.length === 1) {
    // If only one image, use it for both
    const imgData = convertPdfImageToDataUrl(images[0].obj);
    result.profilePhoto = imgData;
    result.fullBodyPhoto = imgData;
  } else {
    // Top image is portrait, second is full body
    result.profilePhoto = convertPdfImageToDataUrl(images[0].obj);
    result.fullBodyPhoto = convertPdfImageToDataUrl(images[1].obj);
  }

  return result;
};


const convertPdfImageToDataUrl = (img) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (img.bitmap) {
       ctx.drawImage(img.bitmap, 0, 0);
       return canvas.toDataURL('image/jpeg', 0.9);
    }
    
    if (!img.data) return null;

    const imageData = ctx.createImageData(img.width, img.height);
    
    if (img.data.length === img.width * img.height * 3) {
      for (let i = 0, j = 0; i < img.data.length; i += 3, j += 4) {
        imageData.data[j] = img.data[i];
        imageData.data[j + 1] = img.data[i + 1];
        imageData.data[j + 2] = img.data[i + 2];
        imageData.data[j + 3] = 255;
      }
    } else if (img.data.length === img.width * img.height) {
        for (let i = 0, j = 0; i < img.data.length; i++, j += 4) {
          imageData.data[j] = img.data[i];
          imageData.data[j + 1] = img.data[i];
          imageData.data[j + 2] = img.data[i];
          imageData.data[j + 3] = 255;
        }
    } else {
      for (let i = 0; i < imageData.data.length && i < img.data.length; i++) {
          imageData.data[i] = img.data[i];
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (err) {
    console.warn("Failed to convert image to DataUrl", err);
    return null;
  }
};

export const parsePdfForWorkerData = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pagesData = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      
      // 1. Text Extraction for Passport and Experience
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');

      let extractedPassport = null;
      const passportMatches = text.match(/\b([A-Z]{1,2}\d{6,9}|\d{6,9}[A-Z]{1,2})\b/gi);
      
      if (passportMatches && passportMatches.length > 0) {
        extractedPassport = normalizePassport(passportMatches[0]);
      } else {
        const numMatch = text.match(/(?:Number|رقم|Passport)[\s:]*([A-Z0-9]+)/i);
        if (numMatch) {
          extractedPassport = normalizePassport(numMatch[1]);
        }
      }

      const experience = extractExperienceFromText(text);

      // 2. Image Extraction for Profile & Full Body Photos
      let extractedPhotos = { profilePhoto: null, fullBodyPhoto: null };
      try {
        extractedPhotos = await extractImagesFromPage(page);
      } catch (e) {
        console.warn('Image extraction failed, fallback to render');
      }

      // 3. Fallback: Render full page to image if specific photo extraction failed
      if (!extractedPhotos.profilePhoto) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        const pageRender = canvas.toDataURL('image/jpeg', 0.8);
        extractedPhotos.profilePhoto = pageRender;
        extractedPhotos.fullBodyPhoto = pageRender;
      }

      pagesData.push({
        pageNumber: i,
        passport: extractedPassport,
        experience,
        rawText: text,
        profileImage: extractedPhotos.profilePhoto,
        fullBodyImage: extractedPhotos.fullBodyPhoto
      });

    }

    return pagesData;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};
