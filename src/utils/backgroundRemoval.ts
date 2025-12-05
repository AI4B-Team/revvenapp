import { supabase } from '@/integrations/supabase/client';

export const removeBackground = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Starting background removal via KIE.AI...');
    
    const { data, error } = await supabase.functions.invoke('remove-background', {
      body: { imageUrl },
    });

    if (error) {
      throw new Error(error.message || 'Background removal failed');
    }

    if (!data.success || !data.imageUrl) {
      throw new Error(data.error || 'No result from background removal');
    }

    console.log('Background removal successful:', data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const cropImage = async (
  imageUrl: string,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Handle CORS for external URLs
    if (!imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Ensure crop area is within bounds
        const x = Math.max(0, Math.min(cropArea.x, img.naturalWidth));
        const y = Math.max(0, Math.min(cropArea.y, img.naturalHeight));
        const width = Math.min(cropArea.width, img.naturalWidth - x);
        const height = Math.min(cropArea.height, img.naturalHeight - y);
        
        if (width <= 0 || height <= 0) {
          reject(new Error('Invalid crop dimensions'));
          return;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(
          img,
          x,
          y,
          width,
          height,
          0,
          0,
          width,
          height
        );
        
        const result = canvas.toDataURL('image/png', 1.0);
        resolve(result);
      } catch (error) {
        reject(new Error('Failed to process image: ' + (error as Error).message));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image. The image may have CORS restrictions.'));
    };
    
    img.src = imageUrl;
  });
};
