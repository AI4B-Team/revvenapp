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
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      resolve(canvas.toDataURL('image/png', 1.0));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};
