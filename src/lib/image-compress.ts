/**
 * Client-side image compression and resizing utility.
 * Downscales images to max dimensions and compresses them to WebP/JPEG,
 * reducing multi-megabyte camera photos (e.g. 8-15 MB) down to ~150-350 KB.
 * This prevents Vercel serverless 4.5 MB body limit errors and speeds up uploads.
 */

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
}

export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.8,
): Promise<CompressedImageResult> {
  // If the file is not an image or is SVG, return unchanged
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    const dataUrl = await fileToDataUrl(file);
    return { file, dataUrl };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio-preserved scaled dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to original if 2D context fails
          fileToDataUrl(file).then((dataUrl) => resolve({ file, dataUrl }));
          return;
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer image/jpeg for broad cross-platform support and predictable compression
        const outputMime = "image/jpeg";
        const dataUrl = canvas.toDataURL(outputMime, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              fileToDataUrl(file).then((origUrl) => resolve({ file, dataUrl: origUrl }));
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], cleanName, {
              type: outputMime,
              lastModified: Date.now(),
            });

            resolve({ file: compressedFile, dataUrl });
          },
          outputMime,
          quality,
        );
      };

      img.onerror = () => {
        fileToDataUrl(file).then((dataUrl) => resolve({ file, dataUrl }));
      };

      if (typeof readerEvent.target?.result === "string") {
        img.src = readerEvent.target.result;
      } else {
        fileToDataUrl(file).then((dataUrl) => resolve({ file, dataUrl }));
      }
    };

    reader.onerror = () => {
      fileToDataUrl(file).then((dataUrl) => resolve({ file, dataUrl }));
    };

    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
