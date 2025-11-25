// ========================================
// IMAGE PROCESSING UTILITIES
// ========================================

/**
 * Apply brightness adjustment to image
 */
export const applyBrightness = (imageData, value) => {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] += value;     // Red
    data[i + 1] += value; // Green
    data[i + 2] += value; // Blue
  }
  return imageData;
};

/**
 * Apply contrast adjustment to image
 */
export const applyContrast = (imageData, value) => {
  const data = imageData.data;
  const factor = (259 * (value + 255)) / (255 * (259 - value));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;
    data[i + 1] = factor * (data[i + 1] - 128) + 128;
    data[i + 2] = factor * (data[i + 2] - 128) + 128;
  }
  return imageData;
};

/**
 * Apply saturation adjustment to image
 */
export const applySaturation = (imageData, value) => {
  const data = imageData.data;
  const factor = (value / 100) + 1;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
    data[i] = -gray * factor + data[i] * (1 + factor);
    data[i + 1] = -gray * factor + data[i + 1] * (1 + factor);
    data[i + 2] = -gray * factor + data[i + 2] * (1 + factor);
  }
  return imageData;
};

/**
 * Apply multiple adjustments at once
 */
export const applyAdjustments = (canvas, ctx, image, adjustments) => {
  // Draw original image
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  // Get image data
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Apply adjustments
  if (adjustments.brightness !== 0) {
    imageData = applyBrightness(imageData, adjustments.brightness);
  }
  if (adjustments.contrast !== 0) {
    imageData = applyContrast(imageData, adjustments.contrast);
  }
  if (adjustments.saturation !== 0) {
    imageData = applySaturation(imageData, adjustments.saturation);
  }
  
  // Put adjusted image data back
  ctx.putImageData(imageData, 0, 0);
  
  return canvas.toDataURL('image/png');
};

/**
 * Generate thumbnail for history
 */
export const generateThumbnail = (imageUrl, maxWidth = 80, maxHeight = 80) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

/**
 * Compress image for upload
 */
export const compressImage = (file, maxSizeMB = 5) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        const maxDimension = 2048;
        
        // Resize if too large
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress
        let quality = 0.9;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Check size and reduce quality if needed
        while (dataUrl.length / 1024 / 1024 > maxSizeMB && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ========================================
// AI INTEGRATION UTILITIES
// ========================================

/**
 * Send AI editing command
 */
export const sendAICommand = async (imageUrl, command, apiKey) => {
  try {
    const response = await fetch('/api/ai-edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        image: imageUrl,
        command: command,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI edit failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      editedImage: result.image_url,
      metadata: result.metadata
    };
  } catch (error) {
    console.error('AI command error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process voice command
 */
export const processVoiceCommand = async (audioBlob, apiKey) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await fetch('/api/voice-to-text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Voice processing failed');
    }
    
    const result = await response.json();
    return {
      success: true,
      text: result.transcript,
      confidence: result.confidence
    };
  } catch (error) {
    console.error('Voice command error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Parse AI command for intent
 */
export const parseCommandIntent = (command) => {
  const lowerCommand = command.toLowerCase();
  
  // Background commands
  if (lowerCommand.includes('background')) {
    if (lowerCommand.includes('remove') || lowerCommand.includes('delete')) {
      return { type: 'remove_background', confidence: 0.95 };
    }
    if (lowerCommand.includes('blur')) {
      return { type: 'blur_background', confidence: 0.9 };
    }
    if (lowerCommand.includes('change') || lowerCommand.includes('replace')) {
      return { type: 'change_background', confidence: 0.85 };
    }
  }
  
  // Color commands
  if (lowerCommand.includes('color') || lowerCommand.includes('colour')) {
    if (lowerCommand.includes('change') || lowerCommand.includes('make')) {
      return { type: 'change_color', confidence: 0.9 };
    }
  }
  
  // Brightness commands
  if (lowerCommand.includes('bright') || lowerCommand.includes('dark')) {
    if (lowerCommand.includes('bright') || lowerCommand.includes('lighter')) {
      return { type: 'increase_brightness', confidence: 0.85 };
    }
    if (lowerCommand.includes('dark') || lowerCommand.includes('dimmer')) {
      return { type: 'decrease_brightness', confidence: 0.85 };
    }
  }
  
  // Filter commands
  if (lowerCommand.includes('filter') || lowerCommand.includes('style')) {
    return { type: 'apply_filter', confidence: 0.8 };
  }
  
  // Crop/resize commands
  if (lowerCommand.includes('crop') || lowerCommand.includes('resize')) {
    return { type: 'crop_resize', confidence: 0.9 };
  }
  
  // Default
  return { type: 'general_edit', confidence: 0.5 };
};

// ========================================
// EXPORT UTILITIES
// ========================================

/**
 * Export image with options
 */
export const exportImage = (canvas: HTMLCanvasElement, options: {
  format?: string;
  quality?: number;
  filename?: string;
} = {}) => {
  const {
    format = 'png',
    quality = 1.0,
    filename = 'edited-image'
  } = options;
  
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, quality);
  
  // Create download link
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  link.click();
};

/**
 * Export to specific dimensions
 */
export const exportResized = (imageUrl, width, height, format = 'png') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = width;
      canvas.height = height;
      
      // Calculate scaling to maintain aspect ratio
      const scale = Math.min(width / img.width, height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Center the image
      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(mimeType, 0.92));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

// ========================================
// HISTORY MANAGEMENT UTILITIES
// ========================================

/**
 * Save edit to history
 */
export const saveToHistory = (currentHistory, newEdit, maxHistory = 20) => {
  const updated = [...currentHistory, newEdit];
  return updated.slice(-maxHistory);
};

/**
 * Navigate history
 */
export const navigateHistory = (history, currentIndex, direction) => {
  if (direction === 'undo' && currentIndex > 0) {
    return {
      newIndex: currentIndex - 1,
      image: history[currentIndex - 1]
    };
  }
  if (direction === 'redo' && currentIndex < history.length - 1) {
    return {
      newIndex: currentIndex + 1,
      image: history[currentIndex + 1]
    };
  }
  return {
    newIndex: currentIndex,
    image: history[currentIndex]
  };
};

/**
 * Compare two images
 */
export const compareImages = (imageUrl1, imageUrl2) => {
  return new Promise((resolve, reject) => {
    const img1 = new Image();
    const img2 = new Image();
    let loaded = 0;
    
    const onLoad = () => {
      loaded++;
      if (loaded === 2) {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        
        canvas1.width = img1.width;
        canvas1.height = img1.height;
        canvas2.width = img2.width;
        canvas2.height = img2.height;
        
        ctx1.drawImage(img1, 0, 0);
        ctx2.drawImage(img2, 0, 0);
        
        const data1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height).data;
        const data2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data;
        
        let diff = 0;
        for (let i = 0; i < data1.length; i++) {
          diff += Math.abs(data1[i] - data2[i]);
        }
        
        const similarity = 1 - (diff / (data1.length * 255));
        resolve({ similarity, difference: 1 - similarity });
      }
    };
    
    img1.onload = onLoad;
    img2.onload = onLoad;
    img1.onerror = reject;
    img2.onerror = reject;
    img1.src = imageUrl1;
    img2.src = imageUrl2;
  });
};

// ========================================
// FILTER PRESETS
// ========================================

export const filterPresets = {
  vivid: {
    brightness: 10,
    contrast: 20,
    saturation: 30
  },
  dramatic: {
    brightness: -10,
    contrast: 40,
    saturation: 20
  },
  bw: {
    brightness: 0,
    contrast: 10,
    saturation: -100
  },
  vintage: {
    brightness: 5,
    contrast: -10,
    saturation: -20,
    temperature: 10
  },
  warm: {
    brightness: 5,
    contrast: 0,
    saturation: 10,
    temperature: 20
  },
  cool: {
    brightness: 0,
    contrast: 5,
    saturation: 5,
    temperature: -20
  },
  sepia: {
    brightness: 10,
    contrast: 5,
    saturation: -30,
    temperature: 30
  }
};

/**
 * Apply filter preset
 */
export const applyFilterPreset = (imageUrl, presetName) => {
  const preset = filterPresets[presetName.toLowerCase()];
  if (!preset) {
    throw new Error(`Filter preset '${presetName}' not found`);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      const result = applyAdjustments(canvas, ctx, img, preset);
      resolve(result);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example 1: Apply adjustments
const adjustedImage = await applyAdjustments(canvas, ctx, image, {
  brightness: 20,
  contrast: 10,
  saturation: 15
});

// Example 2: Send AI command
const result = await sendAICommand(
  imageUrl,
  "Make the background blue",
  apiKey
);

// Example 3: Export image
exportImage(canvas, {
  format: 'jpeg',
  quality: 0.9,
  filename: 'my-edit'
});

// Example 4: Apply filter preset
const filteredImage = await applyFilterPreset(imageUrl, 'vintage');

// Example 5: Generate thumbnail
const thumbnail = await generateThumbnail(imageUrl, 80, 80);
*/

export default {
  applyBrightness,
  applyContrast,
  applySaturation,
  applyAdjustments,
  generateThumbnail,
  compressImage,
  sendAICommand,
  processVoiceCommand,
  parseCommandIntent,
  exportImage,
  exportResized,
  saveToHistory,
  navigateHistory,
  compareImages,
  filterPresets,
  applyFilterPreset
};
