import { useState, useCallback } from 'react';

export interface ReferenceImage {
  id: string;
  url?: string;
  preview?: string;
  name?: string;
  file?: File;
  image_url?: string;
  thumbnail_url?: string;
  original_filename?: string;
}

/**
 * Custom hook for managing reference images
 * Provides state management and helper functions for the reference image feature
 */
export const useReferenceImages = () => {
  const [selectedImages, setSelectedImages] = useState<ReferenceImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open the reference image modal
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Close the reference image modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle selected images from modal - replaces current selection
  const handleImagesSelect = useCallback((images: ReferenceImage[]) => {
    setSelectedImages(images);
    closeModal();
  }, [closeModal]);

  // Add images to the existing selection (appends without closing modal)
  const addImages = useCallback((newImages: ReferenceImage[]) => {
    setSelectedImages(prev => {
      const existingIds = new Set(prev.map(img => img.id));
      const uniqueNewImages = newImages.filter(img => !existingIds.has(img.id));
      return [...prev, ...uniqueNewImages];
    });
  }, []);

  // Remove a specific image
  const removeImage = useCallback((imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  // Clear all selected images
  const clearAll = useCallback(() => {
    setSelectedImages([]);
  }, []);

  // Get image URLs for API submission
  const getImageUrls = useCallback(() => {
    return selectedImages.map(img => img.url || img.preview || img.image_url || '');
  }, [selectedImages]);

  // Get image data for API submission
  const getImageData = useCallback(() => {
    return selectedImages.map(img => ({
      id: img.id,
      url: img.url || img.preview || img.image_url || '',
      name: img.name || img.original_filename || `image-${img.id}`,
      file: img.file
    }));
  }, [selectedImages]);

  return {
    selectedImages,
    setSelectedImages,
    isModalOpen,
    openModal,
    closeModal,
    handleImagesSelect,
    addImages,
    removeImage,
    clearAll,
    getImageUrls,
    getImageData,
    hasImages: selectedImages.length > 0,
    imageCount: selectedImages.length
  };
};
