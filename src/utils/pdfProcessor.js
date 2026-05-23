import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Processes a PDF file and extracts text and the main profile photo from each page.
 */
export const processPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pagesData = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      
      // 1. Extract Text
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');

      // 2. Extract Images (The profile photo)
      let extractedPhoto = null;
      try {
        extractedPhoto = await extractMainImageFromPage(page);
      } catch (imgErr) {
        console.warn(`Failed to extract specific image from page ${i}, falling back to full page.`, imgErr);
      }

      // 3. Fallback: Render full page to image if no specific photo found
      if (!extractedPhoto) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        extractedPhoto = canvas.toDataURL('image/jpeg', 0.8);
      }

      pagesData.push({
        pageNumber: i,
        text,
        image: extractedPhoto
      });
    }

    return pagesData;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};

/**
 * Attempts to find and extract the largest bitmap image on a PDF page (usually the worker photo).
 */
const extractMainImageFromPage = async (page) => {
  const ops = await page.getOperatorList();
  const images = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    // Check for image painting operators
    if (
      ops.fnArray[i] === pdfjsLib.OPS.paintJpegXObject || 
      ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject
    ) {
      const name = ops.argsArray[i][0];
      try {
        // Look in both objs and commonObjs using a callback wrapper
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

        if (img && img.width > 100 && img.height > 100) { // Filter out tiny icons, slightly larger threshold
          images.push(img);
        }
      } catch (e) {
        console.warn('Failed to load image object', e);
      }
    }
  }

  if (images.length === 0) return null;

  // Pick the largest image (most likely the profile photo)
  const largestImg = images.reduce((prev, current) => {
    return (prev.width * prev.height > current.width * current.height) ? prev : current;
  });

  return convertPdfImageToDataUrl(largestImg);
};

/**
 * Converts a PDF.js image object to a browser-ready Data URL.
 */
const convertPdfImageToDataUrl = (img) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    // Some images (like JPEG) come with an img.bitmap or img.src
    if (img.bitmap) {
       ctx.drawImage(img.bitmap, 0, 0);
       return canvas.toDataURL('image/jpeg', 0.9);
    }
    
    if (!img.data) return null;

    const imageData = ctx.createImageData(img.width, img.height);
    
    // Handle different PDF image formats (RGB vs RGBA vs Grayscale)
    if (img.data.length === img.width * img.height * 3) {
      // RGB to RGBA
      for (let i = 0, j = 0; i < img.data.length; i += 3, j += 4) {
        imageData.data[j] = img.data[i];
        imageData.data[j + 1] = img.data[i + 1];
        imageData.data[j + 2] = img.data[i + 2];
        imageData.data[j + 3] = 255;
      }
    } else if (img.data.length === img.width * img.height) {
        // Grayscale to RGBA
        for (let i = 0, j = 0; i < img.data.length; i++, j += 4) {
          imageData.data[j] = img.data[i];
          imageData.data[j + 1] = img.data[i];
          imageData.data[j + 2] = img.data[i];
          imageData.data[j + 3] = 255;
        }
    } else {
      // Assume RGBA or exact match
      // Need to copy because img.data might be a Uint8Array, not Uint8ClampedArray
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

export const mapPdfToWorkers = (workers, pdfPages) => {
  return workers.map((worker, index) => {
    const matchingPage = pdfPages.find(p => 
      p.text.includes(worker.Worker_No) || 
      p.text.toLowerCase().includes(worker.Worker_Name.toLowerCase())
    ) || pdfPages[index];

    if (matchingPage) {
      return {
        ...worker,
        Photo: matchingPage.image,
        Full_Image: matchingPage.image,
        PdfText: matchingPage.text,
      };
    }
    return worker;
  });
};

export const extractExperienceFromText = (text) => {
  const expKeywords = ['EXPERIENCE', 'WORK HISTORY', 'الخبرة', 'سابق', 'EMPLOYMENT'];
  const textUpper = text.toUpperCase();
  
  for (const keyword of expKeywords) {
    const index = textUpper.indexOf(keyword);
    if (index !== -1) {
      return text.substring(index, index + 400).trim();
    }
  }
  return null;
};
