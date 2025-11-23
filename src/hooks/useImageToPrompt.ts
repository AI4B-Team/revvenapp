import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UploadedImage {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

export const useImageToPrompt = () => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, WEBP, or GIF.');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const preview = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadedImage({
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const generatePrompt = useCallback(async () => {
    if (!uploadedImage) {
      setError('No image uploaded');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('image-to-prompt', {
        body: { imageBase64: uploadedImage.preview }
      });

      if (functionError) throw functionError;

      const prompt = data.prompt || '';
      setGeneratedPrompt(prompt);
      return prompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate prompt';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedImage]);

  const clearImage = useCallback(() => {
    setUploadedImage(null);
    setGeneratedPrompt('');
    setError(null);
  }, []);

  const updatePrompt = useCallback((newPrompt: string) => {
    setGeneratedPrompt(newPrompt);
  }, []);

  return {
    uploadedImage,
    generatedPrompt,
    isGenerating,
    error,
    handleImageUpload,
    generatePrompt,
    clearImage,
    updatePrompt,
    hasPrompt: generatedPrompt.length > 0,
    promptLength: generatedPrompt.length,
    canUsePrompt: generatedPrompt.length > 0 && generatedPrompt.length <= 1024
  };
};
