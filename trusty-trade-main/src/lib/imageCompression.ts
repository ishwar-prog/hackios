/**
 * Image compression utility to prevent localStorage size limit errors.
 * Compresses images to a maximum dimension and quality to keep them under ~100KB each.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.7,
  mimeType: 'image/jpeg'
};

/**
 * Compresses an image file to reduce its size for localStorage storage.
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<string> - Base64 data URL of compressed image
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const { maxWidth, maxHeight, quality, mimeType } = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed data URL
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Compresses multiple image files.
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Promise<string[]> - Array of base64 data URLs
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<string[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Estimates the size of a base64 string in bytes.
 * @param base64 - Base64 encoded string
 * @returns number - Estimated size in bytes
 */
export const estimateBase64Size = (base64: string): number => {
  // Remove data URL prefix if present
  const base64Data = base64.split(',')[1] || base64;
  // Base64 encoding increases size by ~33%, so actual bytes = length * 3/4
  return Math.round((base64Data.length * 3) / 4);
};

/**
 * Formats bytes to human readable string.
 * @param bytes - Number of bytes
 * @returns string - Formatted size string (e.g., "125 KB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
