/**
 * Utility for browser-side image enhancement and resizing.
 * Focuses on clarity, sharpness, and natural results.
 */

// Helper to check if input is Data URL
const isDataUrl = (val) => typeof val === 'string' && val.startsWith('data:');

// Helper to convert between formats
const toImageBitmap = async (input) => {
  if (isDataUrl(input)) {
    const res = await fetch(input);
    const blob = await res.blob();
    return await createImageBitmap(blob);
  }
  return await createImageBitmap(input);
};

/**
 * Applies subtle enhancement: brightness, contrast, and light sharpening.
 */
export const enhanceImage = async (input, options = {}) => {
  try {
    const imageBitmap = await toImageBitmap(input);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    ctx.drawImage(imageBitmap, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 1. Subtle Brightness and Contrast
    // contrast: 1.05 to 1.10 is safe. brightness: 2 to 5 is safe.
    const contrast = options.contrast || 1.08;
    const brightness = options.brightness || 3;

    for (let i = 0; i < data.length; i += 4) {
      // Red
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
      // Green
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
      // Blue
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
    }

    // 2. Light Sharpening (Convolution Kernel)
    // Kernel: 
    // [ 0, -0.2, 0 ]
    // [-0.2, 1.8, -0.2]
    // [ 0, -0.2, 0 ]
    if (options.sharpen !== false) {
      applySharpen(data, canvas.width, canvas.height);
    }

    ctx.putImageData(imageData, 0, 0);

    // Return as Data URL (JPEG 0.95)
    return canvas.toDataURL("image/jpeg", 0.95);
  } catch (err) {
    console.warn("Image enhancement failed, returning original", err);
    return input;
  }
};

/**
 * Resizes an image if it exceeds max dimensions.
 */
export const resizeImage = async (input, maxWidth, maxHeight) => {
  try {
    const imageBitmap = await toImageBitmap(input);
    let { width, height } = imageBitmap;

    if (width <= maxWidth && height <= maxHeight) return input;

    const ratio = Math.min(maxWidth / width, maxHeight / height);
    const newWidth = Math.round(width * ratio);
    const newHeight = Math.round(height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    
    // Use high quality interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);

    return canvas.toDataURL("image/jpeg", 0.95);
  } catch (err) {
    return input;
  }
};

/**
 * Simple Sharpening Filter
 */
function applySharpen(data, width, height) {
  const original = new Uint8ClampedArray(data);
  const weights = [
     0, -0.2,  0,
    -0.2, 1.8, -0.2,
     0, -0.2,  0
  ];
  const side = 3;
  const halfSide = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstOff = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
          const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
          const srcOff = (scy * width + scx) * 4;
          const wt = weights[cy * side + cx];
          
          r += original[srcOff] * wt;
          g += original[srcOff + 1] * wt;
          b += original[srcOff + 2] * wt;
        }
      }

      data[dstOff] = Math.min(255, Math.max(0, r));
      data[dstOff + 1] = Math.min(255, Math.max(0, g));
      data[dstOff + 2] = Math.min(255, Math.max(0, b));
    }
  }
}
