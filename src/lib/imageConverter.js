/**
 * Converts an image file to WebP format client-side using HTML5 Canvas.
 * @param {File} file The original image file
 * @param {number} quality The quality of the output webp image (0.0 to 1.0)
 * @returns {Promise<File>} A promise that resolves with the converted WebP file
 */
export function convertToWebP(file, quality = 0.82) {
  return new Promise((resolve, reject) => {
    // If the file is not an image, reject
    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan merupakan gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          
          // Let's also limit max dimensions to prevent huge resource consumption 
          // (e.g., max 1920px width/height is more than enough for web/mobile views)
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Gagal menginisialisasi canvas context.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Gagal mengonversi gambar ke WebP.'));
                return;
              }

              // Extract original name without extension
              const lastDotIndex = file.name.lastIndexOf('.');
              const nameWithoutExt = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
              
              // Create new webp File object
              const webpFile = new File([blob], `${nameWithoutExt}.webp`, {
                type: 'image/webp',
                lastModified: Date.now()
              });

              resolve(webpFile);
            },
            'image/webp',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (error) => {
        reject(new Error('Gagal memuat gambar: ' + error.message));
      };
    };
    reader.onerror = (error) => {
      reject(new Error('Gagal membaca file: ' + error.message));
    };
  });
}
