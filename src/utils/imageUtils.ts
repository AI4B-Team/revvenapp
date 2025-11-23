/**
 * Utility functions for reference image handling
 */

// File size limit (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Max number of images
export const MAX_IMAGES = 6;

// Allowed file types
export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * Validate if a file is an allowed image type
 */
export const isValidImageType = (file: File): boolean => {
  return ALLOWED_TYPES.includes(file.type);
};

/**
 * Validate if a file is within size limit
 */
export const isValidFileSize = (file: File, maxSize: number = MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * Validate a file completely
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!isValidImageType(file)) {
    return {
      valid: false,
      error: 'File must be PNG, JPG, or WEBP format'
    };
  }
  
  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: 'File must be less than 5MB'
    };
  }
  
  return { valid: true };
};

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Create a preview URL for a file
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up preview URL to prevent memory leaks
 */
export const revokePreviewUrl = (url: string): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
