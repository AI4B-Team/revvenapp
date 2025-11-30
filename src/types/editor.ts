export interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  image?: string;
  isRequest?: boolean;
  timestamp?: Date;
}

export interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
}

export interface Creation {
  id: string;
  thumbnail: string;
  title: string;
}

export interface CanvasSettings {
  mode: 'inpaint' | 'outpaint' | 'generate' | 'upscale';
  outpaint: boolean;
  inpaintStrength: number;
  numberOfImages: number;
  dimensions: string;
  aspectRatio: string;
  width: number;
  height: number;
  renderDensity: number;
  guidanceScale: number;
}

export interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

export interface CanvasTool {
  id: string;
  icon: React.ReactNode;
  label?: string;
}

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  mode: 'inpaint',
  outpaint: true,
  inpaintStrength: 1,
  numberOfImages: 4,
  dimensions: '512 × 512',
  aspectRatio: '1:1',
  width: 512,
  height: 512,
  renderDensity: 50,
  guidanceScale: 7,
};

export const DIMENSION_OPTIONS = [
  '512 × 512',
  '768 × 768',
  '512 × 1024',
  '768 × 1024',
  '1024 × 768',
  '1024 × 1024',
];

export const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
