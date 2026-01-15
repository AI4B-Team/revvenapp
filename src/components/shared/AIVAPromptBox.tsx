import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Send, Sparkles, Video, Pencil, User, Users, RefreshCw, BarChart, BookOpen, Headphones, Image, Layers, Camera, ArrowRightLeft, AudioLines, Music, FileText, CreditCard, ImageIcon, LayoutTemplate, TableCellsMerge, Mail, FolderOpen, Shuffle, LayoutGrid, Box, Copy, Hash, X, ChevronDown, Monitor, Clock, SlidersHorizontal, Move, PenTool, Check, Search, Kanban, Zap, Brush, Upload, Globe, Languages, Repeat, Volume2, type LucideIcon } from 'lucide-react';
import ReferenceLinkIcon from '@/components/icons/ReferenceLinkIcon';
import VideoStyleIcon from '@/components/icons/VideoStyleIcon';
import IntentSelector, { type Intent } from '@/components/IntentSelector';
import AutoDropdown, { type AutoOption } from '@/components/AutoDropdown';
import ControlChip from '@/components/ControlChip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';
import AudioSelectModal from '@/components/dashboard/AudioSelectModal';
import { useToast } from '@/hooks/use-toast';
// Model logo imports
import autoLogo from '@/assets/model-logos/auto.png';
import fluxLogo from '@/assets/model-logos/flux.png';
import openaiLogo from '@/assets/model-logos/openai.png';
import seedreamLogo from '@/assets/model-logos/seedream.png';
import qwenLogo from '@/assets/model-logos/qwen.png';
import nanoBananaLogo from '@/assets/model-logos/nano-banana.png';
import ideogramLogo from '@/assets/model-logos/ideogram.png';
import grokLogo from '@/assets/model-logos/grok.png';
import imagenLogo from '@/assets/model-logos/imagen.png';
import zImageLogo from '@/assets/model-logos/z-image.png';
import googleLogo from '@/assets/model-logos/google.svg';
import soraLogo from '@/assets/model-logos/sora.png';
import klingLogo from '@/assets/model-logos/kling.png';
import veoLogo from '@/assets/model-logos/veo.png';
import heygenLogo from '@/assets/model-logos/heygen.png';
import synthesiaLogo from '@/assets/model-logos/synthesia.png';
import didLogo from '@/assets/model-logos/d-id.png';
import hedraLogo from '@/assets/model-logos/hedra.png';
import arcadsLogo from '@/assets/model-logos/arcads.png';
import creatifyLogo from '@/assets/model-logos/creatify.png';
import runwayLogo from '@/assets/model-logos/runway.png';
import pikaLogo from '@/assets/model-logos/pika.png';
import wanLogo from '@/assets/model-logos/wan.png';
import hailuoLogo from '@/assets/model-logos/hailuo.png';
import elevenlabsLogo from '@/assets/model-logos/elevenlabs.png';
import sunoLogo from '@/assets/model-logos/suno.png';
import udioLogo from '@/assets/model-logos/udio.png';
import bytedanceLogo from '@/assets/model-logos/bytedance.png';

const placeholdersByIntent: Record<Intent | 'default', string> = {
  default: 'Ask anything...',
  Create: 'Describe what you want to create…',
  Research: 'What do you want to research or understand?',
  Plan: 'What do you want to plan or map out?',
  Automate: 'What do you want to automate or systemize?',
};

interface SubOption {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

interface ControlIcon {
  id: string;
  icon: LucideIcon;
  tooltip: string;
}

interface ModelOption {
  id: string;
  label: string;
  description: string;
  logo?: string;
  badge?: 'SUGGESTED' | 'PREMIUM' | 'NEW' | 'ULTRA';
  supportsImg2Img?: boolean;
  supportsDraw?: boolean;
  supportsSwap?: boolean;
  supportsPhoto?: boolean;
}

// Control icons for Image types - uses Brush icon for style
const imageControlIcons: ControlIcon[] = [
  { id: 'style', icon: Brush, tooltip: 'Style' },
  { id: 'reference', icon: Layers, tooltip: 'Reference' },
  { id: 'character', icon: User, tooltip: 'Character' },
  { id: 'ratio', icon: Copy, tooltip: 'Ratio' },
  { id: 'number', icon: Hash, tooltip: 'Number' },
];

// Control icons for Video types - reference uses custom icon component
const videoControlIcons: ControlIcon[] = [
  { id: 'reference', icon: Layers, tooltip: 'Reference' },
  { id: 'character', icon: User, tooltip: 'Character' },
  { id: 'ratio', icon: Copy, tooltip: 'Ratio' },
  { id: 'duration', icon: Clock, tooltip: 'Duration' },
  { id: 'quality', icon: SlidersHorizontal, tooltip: 'Quality' },
];

// Control icons for Document types - minimal controls
const documentControlIcons: ControlIcon[] = [];

// Model options based on content type and subtype

// Image model options by subtype
const imageGenerateModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', badge: 'SUGGESTED', supportsImg2Img: true, logo: autoLogo },
  { id: 'flux-pro', label: 'Flux Pro', description: 'Balanced performance and quality', supportsImg2Img: true, logo: fluxLogo },
  { id: 'flux-max', label: 'Flux Max', description: 'Enhanced quality for complex scenes', badge: 'PREMIUM', supportsImg2Img: true, logo: fluxLogo },
  { id: 'gpt-4o-image', label: 'GPT-4o Image', description: 'OpenAI\'s advanced image model', badge: 'NEW', supportsImg2Img: true, logo: openaiLogo },
  { id: 'seedream-4', label: 'Seedream 4.0', description: 'ByteDance\'s next-gen 2K model', badge: 'NEW', supportsImg2Img: true, logo: seedreamLogo },
  { id: 'seedream-3', label: 'Seedream 3.0', description: 'ByteDance\'s reliable SD model', logo: seedreamLogo },
  { id: 'qwen-image', label: 'Qwen Image', description: 'Alibaba\'s multilingual model', logo: qwenLogo },
  { id: 'nano-banana', label: 'Nano Banana', description: 'Gemini 2.5 Flash Image Preview', supportsImg2Img: true, logo: nanoBananaLogo },
  { id: 'nano-banana-pro', label: 'Nano Banana Pro', description: 'Advanced Gemini 2.5 Image Model', supportsImg2Img: true, logo: nanoBananaLogo },
  { id: 'ideogram-v3-edit', label: 'Ideogram V3 Edit', description: 'Inpainting with mask editing', logo: ideogramLogo },
  { id: 'ideogram-character', label: 'Ideogram Character', description: 'Character-consistent generation', supportsImg2Img: true, logo: ideogramLogo },
  { id: 'grok-imagine', label: 'Grok Imagine', description: 'X.AI\'s powerful text-to-image model', logo: grokLogo },
  { id: 'imagen-4-ultra', label: 'Imagen 4 Ultra', description: 'Google\'s most advanced image model', badge: 'ULTRA', supportsImg2Img: true, logo: imagenLogo },
  { id: 'z-image', label: 'Z-Image', description: 'Hyper-realistic text-to-image generation', badge: 'NEW', logo: zImageLogo },
];

const imageBatchModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', badge: 'SUGGESTED', supportsImg2Img: true, logo: autoLogo },
  { id: 'flux-pro', label: 'Flux Pro', description: 'Balanced performance and quality', supportsImg2Img: true, logo: fluxLogo },
  { id: 'flux-max', label: 'Flux Max', description: 'Enhanced quality for complex scenes', badge: 'PREMIUM', supportsImg2Img: true, logo: fluxLogo },
  { id: 'gpt-4o-image', label: 'GPT-4o Image', description: 'OpenAI\'s advanced image model', badge: 'NEW', supportsImg2Img: true, logo: openaiLogo },
  { id: 'seedream-4', label: 'Seedream 4.0', description: 'ByteDance\'s next-gen 2K model', badge: 'NEW', supportsImg2Img: true, logo: seedreamLogo },
  { id: 'seedream-3', label: 'Seedream 3.0', description: 'ByteDance\'s reliable SD model', logo: seedreamLogo },
  { id: 'qwen-image', label: 'Qwen Image', description: 'Alibaba\'s multilingual model', logo: qwenLogo },
  { id: 'nano-banana', label: 'Nano Banana', description: 'Gemini 2.5 Flash Image Preview', supportsImg2Img: true, logo: nanoBananaLogo },
  { id: 'nano-banana-pro', label: 'Nano Banana Pro', description: 'Advanced Gemini 2.5 Image Model', supportsImg2Img: true, logo: nanoBananaLogo },
  { id: 'ideogram-v3-edit', label: 'Ideogram V3 Edit', description: 'Inpainting with mask editing', logo: ideogramLogo },
  { id: 'ideogram-character', label: 'Ideogram Character', description: 'Character-consistent generation', supportsImg2Img: true, logo: ideogramLogo },
  { id: 'grok-imagine', label: 'Grok Imagine', description: 'X.AI\'s powerful text-to-image model', logo: grokLogo },
  { id: 'imagen-4-ultra', label: 'Imagen 4 Ultra', description: 'Google\'s most advanced image model', badge: 'ULTRA', supportsImg2Img: true, logo: imagenLogo },
  { id: 'z-image', label: 'Z-Image', description: 'Hyper-realistic text-to-image generation', badge: 'NEW', logo: zImageLogo },
];

const imageDrawModelOptions: ModelOption[] = [
  { id: 'seedream-4', label: 'Seedream 4.0', description: 'ByteDance\'s next-gen 2K model', badge: 'NEW', supportsImg2Img: true, logo: seedreamLogo },
  { id: 'seedream-4.5', label: 'Seedream 4.5', description: 'ByteDance\'s 4K edit model (up to 12 refs)', badge: 'NEW', supportsImg2Img: true, logo: seedreamLogo },
  { id: 'nano-banana', label: 'Nano Banana', description: 'Gemini 2.5 Flash Image Preview', supportsImg2Img: true, logo: nanoBananaLogo },
  { id: 'nano-banana-pro', label: 'Nano Banana Pro', description: 'Advanced Gemini 2.5 Image Model', supportsImg2Img: true, supportsDraw: true, logo: nanoBananaLogo },
];

const imageSwapModelOptions: ModelOption[] = [
  { id: 'seedream-4', label: 'Seedream 4.0', description: 'ByteDance\'s next-gen 2K model', badge: 'NEW', supportsImg2Img: true, supportsSwap: true, logo: seedreamLogo },
  { id: 'nano-banana-pro', label: 'Nano Banana Pro', description: 'Advanced Gemini 2.5 Image Model', supportsImg2Img: true, supportsSwap: true, logo: nanoBananaLogo },
];

const imagePhotoshootModelOptions: ModelOption[] = [
  { id: 'nano-banana-pro', label: 'Nano Banana Pro', description: 'Advanced Gemini 2.5 Image Model', supportsImg2Img: true, supportsPhoto: true, logo: nanoBananaLogo },
];

// Video model options by subtype
const videoStoryModelOptions: ModelOption[] = [
  { id: 'sora-storyboard', label: 'Sora Storyboard', description: 'Storyboard video creation', logo: soraLogo },
];

const videoPresentationModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation', logo: veoLogo },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output', logo: veoLogo },
  { id: 'sora-2-pro', label: 'Sora 2 Pro', description: 'Storyboard (no people photos)', logo: soraLogo },
  { id: 'sora-2', label: 'Sora 2', description: 'Image-to-video, 10-15s duration', logo: soraLogo },
  { id: 'kling-2.1', label: 'Kling 2.1', description: 'Image-to-video, supports people', logo: klingLogo },
  { id: 'kling-2.5', label: 'Kling 2.5', description: 'Text or image-to-video, turbo', logo: klingLogo },
  { id: 'kling-2.6', label: 'Kling 2.6', description: 'Image-to-video with sound', logo: klingLogo },
  { id: 'wan-2.5', label: 'Wan 2.5', description: 'Image-to-video (800 char limit)', logo: wanLogo },
  { id: 'wan-2.2', label: 'Wan 2.2', description: 'Text or image-to-video, turbo', logo: wanLogo },
  { id: 'hailuo-2.3', label: 'Hailuo 2.3', description: 'Image-to-video, high quality', logo: hailuoLogo },
  { id: 'bytedance-v1', label: 'Bytedance V1', description: 'Image-to-video, fast', logo: bytedanceLogo },
];

const videoVSLModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation', logo: veoLogo },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output', logo: veoLogo },
  { id: 'sora-2-pro', label: 'Sora 2 Pro', description: 'Storyboard (no people photos)', logo: soraLogo },
  { id: 'sora-2', label: 'Sora 2', description: 'Image-to-video, 10-15s duration', logo: soraLogo },
  { id: 'kling-2.1', label: 'Kling 2.1', description: 'Image-to-video, supports people', logo: klingLogo },
  { id: 'kling-2.5', label: 'Kling 2.5', description: 'Text or image-to-video, turbo', logo: klingLogo },
  { id: 'kling-2.6', label: 'Kling 2.6', description: 'Image-to-video with sound', logo: klingLogo },
  { id: 'wan-2.5', label: 'Wan 2.5', description: 'Image-to-video (800 char limit)', logo: wanLogo },
  { id: 'wan-2.2', label: 'Wan 2.2', description: 'Text or image-to-video, turbo', logo: wanLogo },
  { id: 'hailuo-2.3', label: 'Hailuo 2.3', description: 'Image-to-video, high quality', logo: hailuoLogo },
  { id: 'bytedance-v1', label: 'Bytedance V1', description: 'Image-to-video, fast', logo: bytedanceLogo },
];

const videoAvatarModelOptions: ModelOption[] = [
  { id: 'wan-avatar', label: 'Wan Avatar', description: 'Speech-to-video with lip sync (max 15s)', logo: wanLogo },
  { id: 'kling-avatar', label: 'Kling Avatar', description: 'Pro avatar with audio sync (max 15s)', logo: klingLogo },
];

const videoUGCModelOptions: ModelOption[] = [
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation', logo: veoLogo },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output', logo: veoLogo },
  { id: 'kling-2.6', label: 'Kling 2.6', description: 'Image-to-video with sound', logo: klingLogo },
];

const videoRecastModelOptions: ModelOption[] = [
  { id: 'animate-move', label: 'Animate Move', description: 'Move/animate elements in video', logo: autoLogo },
  { id: 'animate-replace', label: 'Animate Replace', description: 'Replace character with image', logo: autoLogo },
];

const videoAnimateModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation', logo: veoLogo },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output', logo: veoLogo },
  { id: 'sora-2-pro', label: 'Sora 2 Pro', description: 'Storyboard (no people photos)', logo: soraLogo },
  { id: 'sora-2', label: 'Sora 2', description: 'Image-to-video, 10-15s duration', logo: soraLogo },
  { id: 'kling-2.1', label: 'Kling 2.1', description: 'Image-to-video, supports people', logo: klingLogo },
  { id: 'kling-2.5', label: 'Kling 2.5', description: 'Text or image-to-video, turbo', logo: klingLogo },
  { id: 'kling-2.6', label: 'Kling 2.6', description: 'Image-to-video with sound', logo: klingLogo },
  { id: 'wan-2.5', label: 'Wan 2.5', description: 'Image-to-video (800 char limit)', logo: wanLogo },
  { id: 'wan-2.2', label: 'Wan 2.2', description: 'Text or image-to-video, turbo', logo: wanLogo },
  { id: 'hailuo-2.3', label: 'Hailuo 2.3', description: 'Image-to-video, high quality', logo: hailuoLogo },
  { id: 'bytedance-v1', label: 'Bytedance V1', description: 'Image-to-video, fast', logo: bytedanceLogo },
];

const videoDrawModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation', logo: veoLogo },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output', logo: veoLogo },
];

const videoLipSyncModelOptions: ModelOption[] = [
  { id: 'wan-avatar', label: 'Wan Avatar', description: 'Speech-to-video with lip sync (max 15s)', logo: wanLogo },
  { id: 'kling-avatar', label: 'Kling Avatar', description: 'Pro avatar with audio sync (max 15s)', logo: klingLogo },
];

const videoMotionSyncModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation', logo: veoLogo },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output', logo: veoLogo },
  { id: 'sora-2-pro', label: 'Sora 2 Pro', description: 'Storyboard (no people photos)', logo: soraLogo },
  { id: 'sora-2', label: 'Sora 2', description: 'Image-to-video, 10-15s duration', logo: soraLogo },
  { id: 'kling-2.1', label: 'Kling 2.1', description: 'Image-to-video, supports people', logo: klingLogo },
  { id: 'kling-2.5', label: 'Kling 2.5', description: 'Text or image-to-video, turbo', logo: klingLogo },
  { id: 'kling-2.6', label: 'Kling 2.6', description: 'Image-to-video with sound', logo: klingLogo },
  { id: 'wan-2.5', label: 'Wan 2.5', description: 'Image-to-video (800 char limit)', logo: wanLogo },
  { id: 'wan-2.2', label: 'Wan 2.2', description: 'Text or image-to-video, turbo', logo: wanLogo },
  { id: 'hailuo-2.3', label: 'Hailuo 2.3', description: 'Image-to-video, high quality', logo: hailuoLogo },
  { id: 'bytedance-v1', label: 'Bytedance V1', description: 'Image-to-video, fast', logo: bytedanceLogo },
];

const videoPodcastModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'veo3_fast', label: 'Veo 3.1 Fast', description: 'Quick video generation', logo: veoLogo },
  { id: 'veo3', label: 'Veo 3.1 Quality', description: 'Higher quality output', logo: veoLogo },
  { id: 'kling-2.6', label: 'Kling 2.6', description: 'Image-to-video with sound', logo: klingLogo },
];

// Audio model options by subtype
const audioVoiceoverModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'eleven-turbo-v2.5', label: 'Eleven Turbo v2.5', description: 'Fast & natural', logo: elevenlabsLogo },
  { id: 'eleven-multilingual-v2', label: 'Eleven Multilingual v2', description: '29 languages', logo: elevenlabsLogo },
];

const audioCloneModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'elevenlabs-clone', label: 'ElevenLabs Clone', description: 'Premium cloning', logo: elevenlabsLogo },
  { id: 'resemble-ai', label: 'Resemble AI', description: 'Fast cloning', logo: autoLogo },
  { id: 'coqui', label: 'Coqui', description: 'Open source', logo: autoLogo },
];

const audioRevoiceModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'kie-ai', label: 'KIE.AI', description: 'Voice conversion', logo: autoLogo },
  { id: 'rvc', label: 'RVC', description: 'Real-time voice', logo: autoLogo },
  { id: 'so-vits', label: 'So-VITS', description: 'High quality', logo: autoLogo },
];

const audioSoundEffectsModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'elevenlabs-sfx', label: 'ElevenLabs SFX', description: 'Premium effects', logo: elevenlabsLogo },
  { id: 'audiogen', label: 'AudioGen', description: 'Diverse sounds', logo: autoLogo },
  { id: 'make-an-audio', label: 'Make-An-Audio', description: 'Creative SFX', logo: autoLogo },
];

const audioMusicModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'v5-best', label: 'V5 (Best)', description: 'Highest quality', logo: sunoLogo },
  { id: 'v4.5-rich', label: 'V4.5+ (Rich)', description: 'Rich sound', logo: sunoLogo },
  { id: 'v4.5-all', label: 'V4.5 All', description: 'Balanced', logo: sunoLogo },
  { id: 'v4.5-fast', label: 'V4.5 (Fast)', description: 'Quick generation', logo: sunoLogo },
  { id: 'v4-basic', label: 'V4 (Basic)', description: 'Basic quality', logo: sunoLogo },
];

const audioAudiobookModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'elevenlabs', label: 'ElevenLabs', description: 'Premium narration', logo: elevenlabsLogo },
  { id: 'openai-tts-hd', label: 'OpenAI TTS HD', description: 'Natural reading', logo: openaiLogo },
  { id: 'amazon-polly', label: 'Amazon Polly', description: 'Reliable narration', logo: autoLogo },
];

// Design model options
const designModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Google AI', logo: googleLogo },
  { id: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI model', logo: openaiLogo },
  { id: 'claude-3.5', label: 'Claude 3.5', description: 'Anthropic model', logo: autoLogo },
];

// Document model options
const documentModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Google AI', logo: googleLogo },
  { id: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI model', logo: openaiLogo },
  { id: 'claude-3.5', label: 'Claude 3.5', description: 'Anthropic model', logo: autoLogo },
];

// Video type options
const videoTypes: SubOption[] = [
  { id: 'story', label: 'Story', icon: BookOpen, color: 'text-blue-500' },
  { id: 'presentation', label: 'Presentation', icon: Monitor, color: 'text-violet-500' },
  { id: 'vsl', label: 'VSL', icon: BarChart, color: 'text-blue-500' },
  { id: 'avatar', label: 'Avatar', icon: User, color: 'text-violet-500' },
  { id: 'ugc', label: 'UGC', icon: Users, color: 'text-amber-500' },
  { id: 'recast', label: 'Recast', icon: RefreshCw, color: 'text-emerald-500' },
  { id: 'animate', label: 'Animate', icon: Video, color: 'text-red-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'lip-sync', label: 'Lip-Sync', icon: PenTool, color: 'text-red-500' },
  { id: 'motion-sync', label: 'Motion-Sync', icon: Move, color: 'text-violet-500' },
  { id: 'podcast', label: 'Podcast', icon: Headphones, color: 'text-blue-500' },
];

// Image type options
const imageTypes: SubOption[] = [
  { id: 'generate', label: 'Generate', icon: Sparkles, color: 'text-amber-500' },
  { id: 'batch', label: 'Batch', icon: Layers, color: 'text-emerald-500' },
  { id: 'draw', label: 'Draw', icon: Pencil, color: 'text-orange-500' },
  { id: 'swap', label: 'Swap', icon: ArrowRightLeft, color: 'text-blue-500' },
  { id: 'photoshoot', label: 'Photoshoot', icon: Camera, color: 'text-violet-500' },
];

// Audio type options
const audioTypes: SubOption[] = [
  { id: 'voiceover', label: 'Voiceover', icon: Mic, color: 'text-emerald-500' },
  { id: 'clone', label: 'Clone', icon: User, color: 'text-violet-500' },
  { id: 'revoice', label: 'Revoice', icon: RefreshCw, color: 'text-cyan-500' },
  { id: 'transcribe', label: 'Transcribe', icon: FileText, color: 'text-rose-500' },
  { id: 'sound-effects', label: 'Sound Effects', icon: AudioLines, color: 'text-amber-500' },
  { id: 'music', label: 'Music', icon: Music, color: 'text-blue-500' },
  { id: 'audiobook', label: 'AudioBook', icon: Headphones, color: 'text-indigo-500' },
];

// Design type options
const designTypes: SubOption[] = [
  { id: 'brochure', label: 'Brochure', icon: FolderOpen, color: 'text-emerald-500' },
  { id: 'business-card', label: 'Business Card', icon: CreditCard, color: 'text-purple-500' },
  { id: 'cover', label: 'Cover', icon: ImageIcon, color: 'text-blue-500' },
  { id: 'flyer', label: 'Flyer', icon: FileText, color: 'text-amber-500' },
  { id: 'infographic', label: 'Infographic', icon: TableCellsMerge, color: 'text-violet-500' },
  { id: 'invitation', label: 'Invitation', icon: Mail, color: 'text-cyan-500' },
  { id: 'logo', label: 'Logo', icon: Sparkles, color: 'text-yellow-500' },
  { id: 'poster', label: 'Poster', icon: LayoutTemplate, color: 'text-indigo-500' },
  { id: 'thumbnail', label: 'Thumbnail', icon: ImageIcon, color: 'text-red-500' },
];

// Content type options
const contentTypes: SubOption[] = [
  { id: 'social', label: 'Social', icon: LayoutTemplate, color: 'text-blue-500' },
];

// Document type options
const documentTypes: SubOption[] = [
  { id: 'ebook', label: 'Ebook', icon: BookOpen, color: 'text-amber-500' },
  { id: 'whitepaper', label: 'Whitepaper', icon: FileText, color: 'text-slate-500' },
  { id: 'report', label: 'Report', icon: TableCellsMerge, color: 'text-blue-500' },
  { id: 'business-plan', label: 'Business Plan', icon: BarChart, color: 'text-indigo-500' },
  { id: 'handbook', label: 'Handbook', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'proposal', label: 'Proposal', icon: FileText, color: 'text-purple-500' },
  { id: 'case-study', label: 'Case Study', icon: FileText, color: 'text-teal-500' },
  { id: 'cover-letter', label: 'Cover Letter', icon: FileText, color: 'text-red-500' },
  { id: 'presentation', label: 'Presentation', icon: Monitor, color: 'text-orange-500' },
];

export interface SubOptionType {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

// Ratio options
const ratioOptions = ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'];
// Number options
const numberOptions = [1, 2, 4, 8];
// Duration options
const durationOptions = ['5s', '10s', '15s', '30s', '60s'];
// Quality options
const qualityOptions = ['standard', 'high', 'ultra'];

// Audio-specific options
const sfxSpeedOptions = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
const sfxInfluenceOptions = ['10%', '20%', '30%', '50%', '70%', '100%'];
const sfxFormatOptions = ['MP3', 'WAV', 'OGG', 'FLAC'];
const languageOptions = ['Auto', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'];
const musicVocalOptions = ['Instrumental', 'With Vocals'];
const musicGenderOptions = ['Female', 'Male'];

// Transcribe model options
const audioTranscribeModelOptions: ModelOption[] = [
  { id: 'auto', label: 'Auto', description: 'AI picks what\'s best', logo: autoLogo },
  { id: 'whisper-large', label: 'Whisper Large', description: 'Most accurate', logo: openaiLogo },
  { id: 'whisper-turbo', label: 'Whisper Turbo', description: 'Fast & accurate', logo: openaiLogo },
];

interface AIVAPromptBoxProps {
  onGenerate?: () => void;
  showGreeting?: boolean;
  greetingName?: string;
  showTagline?: boolean;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  selectedIntent?: Intent | null;
  onIntentChange?: (intent: Intent | null) => void;
  onSubTypeChange?: (subType: SubOptionType | null) => void;
  // Control callbacks for opening modals (style, reference, and character need external modals)
  onStyleClick?: () => void;
  onReferenceClick?: () => void;
  onCharacterClick?: () => void;
}

const AIVAPromptBox = ({ 
  onGenerate, 
  showGreeting = false, 
  greetingName, 
  showTagline = false,
  prompt: externalPrompt,
  onPromptChange,
  selectedIntent: externalIntent,
  onIntentChange,
  onSubTypeChange,
  onStyleClick,
  onReferenceClick,
  onCharacterClick,
}: AIVAPromptBoxProps) => {
  const [internalPrompt, setInternalPrompt] = useState('');
  const [internalIntent, setInternalIntent] = useState<Intent | null>(null);
  
  // Use external state if provided, otherwise use internal
  const prompt = externalPrompt !== undefined ? externalPrompt : internalPrompt;
  const setPrompt = onPromptChange || setInternalPrompt;
  const intent = externalIntent !== undefined ? externalIntent : internalIntent;
  const setIntent = onIntentChange || setInternalIntent;
  const [selectedOption, setSelectedOption] = useState<AutoOption | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubOption | null>(null);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState('5s');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  
  // Audio-specific state
  const [sfxSpeed, setSfxSpeed] = useState('Normal');
  const [sfxLoop, setSfxLoop] = useState(false);
  const [sfxInfluence, setSfxInfluence] = useState('30%');
  const [sfxFormat, setSfxFormat] = useState('MP3');
  const [fromLanguage, setFromLanguage] = useState('Auto');
  const [toLanguage, setToLanguage] = useState('Spanish');
  const [musicVocal, setMusicVocal] = useState('Instrumental');
  const [musicGender, setMusicGender] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [musicLyrics, setMusicLyrics] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<number>(0);
  const [clonedVoices, setClonedVoices] = useState<number>(0);
  
  // Audio modal and selection state
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [audioModalMode, setAudioModalMode] = useState<'voiceover' | 'clone' | 'revoice' | 'transcribe' | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<{ name: string; duration: number; url: string } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  
  // Recording state for transcribe
  const [isRecording, setIsRecordingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  
  // Single state for tracking which dropdown is open (only one at a time)
  type DropdownType = 'type' | 'model' | 'ratio' | 'number' | 'duration' | 'quality' | 'sfx-speed' | 'sfx-influence' | 'sfx-format' | 'from-language' | 'to-language' | 'music-vocal' | 'music-gender' | null;
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  
  // Toggle dropdown - if clicking same one, close it; otherwise open new one
  const toggleDropdown = useCallback((dropdown: DropdownType) => {
    setActiveDropdown(prev => prev === dropdown ? null : dropdown);
  }, []);
  
  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside any dropdown
      if (!target.closest('[data-dropdown]')) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  // Speech recognition hook
  const handleTranscriptResult = useCallback((transcript: string) => {
    setPrompt(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening, cancelListening } = useSpeechRecognition({
    onResult: handleTranscriptResult,
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(prompt);
    }
  };

  // Audio modal handlers
  const handleOpenAudioModal = (mode: 'voiceover' | 'clone' | 'revoice' | 'transcribe') => {
    setAudioModalMode(mode);
    setAudioModalOpen(true);
  };

  const handleAudioSelect = (audio: { name: string; duration: number; url: string }) => {
    setSelectedAudioFile(audio);
    setUploadedFiles(1);
    setAudioModalOpen(false);
    toast({
      title: "Audio selected",
      description: audio.name,
    });
  };

  // Recording functions for transcribe mode
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType =
        MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : MediaRecorder.isTypeSupported('audio/ogg')
            ? 'audio/ogg'
            : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType: preferredMimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || preferredMimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setSelectedAudioFile({
          name: `Recording_${Date.now()}.webm`,
          duration: recordingTime,
          url: audioUrl,
        });
        setUploadedFiles(1);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio",
        variant: "destructive",
      });
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset chips when intent changes
  useEffect(() => {
    setSelectedOption(null);
    setSelectedSubType(null);
    setActiveDropdown(null);
    onSubTypeChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent]);

  // Notify parent when sub-type changes
  useEffect(() => {
    onSubTypeChange?.(selectedSubType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubType]);

  const handleOptionSelect = (option: AutoOption | null) => {
    setSelectedOption(option);
    setSelectedSubType(null);
    setActiveDropdown(null);
  };

  const handleRemoveOption = () => {
    setSelectedOption(null);
    setSelectedSubType(null);
    setActiveDropdown(null);
  };

  const handleRemoveSubType = () => {
    setSelectedSubType(null);
  };

  const handleSubTypeSelect = (subType: SubOption) => {
    setSelectedSubType(subType);
    setActiveDropdown(null);
  };

  const getSubTypeOptions = (): SubOption[] => {
    if (selectedOption?.id === 'video') return videoTypes;
    if (selectedOption?.id === 'image') return imageTypes;
    if (selectedOption?.id === 'audio') return audioTypes;
    if (selectedOption?.id === 'design') return designTypes;
    if (selectedOption?.id === 'content') return contentTypes;
    if (selectedOption?.id === 'document') return documentTypes;
    return [];
  };

  // Get control icons based on selected option type
  const getControlIcons = (): ControlIcon[] => {
    if (selectedOption?.id === 'document') return documentControlIcons;
    if (selectedOption?.id === 'video') return videoControlIcons;
    return imageControlIcons;
  };

  // Get model options based on selected option type and subtype
  const getModelOptions = (): ModelOption[] => {
    // Video subtypes
    if (selectedOption?.id === 'video') {
      switch (selectedSubType?.id) {
        case 'story': return videoStoryModelOptions;
        case 'presentation': return videoPresentationModelOptions;
        case 'vsl': return videoVSLModelOptions;
        case 'avatar': return videoAvatarModelOptions;
        case 'ugc': return videoUGCModelOptions;
        case 'recast': return videoRecastModelOptions;
        case 'animate': return videoAnimateModelOptions;
        case 'draw': return videoDrawModelOptions;
        case 'lip-sync': return videoLipSyncModelOptions;
        case 'motion-sync': return videoMotionSyncModelOptions;
        case 'podcast': return videoPodcastModelOptions;
        default: return videoStoryModelOptions;
      }
    }
    // Image subtypes
    if (selectedOption?.id === 'image') {
      switch (selectedSubType?.id) {
        case 'generate': return imageGenerateModelOptions;
        case 'batch': return imageBatchModelOptions;
        case 'draw': return imageDrawModelOptions;
        case 'swap': return imageSwapModelOptions;
        case 'photoshoot': return imagePhotoshootModelOptions;
        default: return imageGenerateModelOptions;
      }
    }
    // Audio subtypes
    if (selectedOption?.id === 'audio') {
      switch (selectedSubType?.id) {
        case 'voiceover': return audioVoiceoverModelOptions;
        case 'clone': return audioCloneModelOptions;
        case 'revoice': return audioRevoiceModelOptions;
        case 'transcribe': return audioTranscribeModelOptions;
        case 'sound-effects': return audioSoundEffectsModelOptions;
        case 'music': return audioMusicModelOptions;
        case 'audiobook': return audioAudiobookModelOptions;
        default: return audioVoiceoverModelOptions;
      }
    }
    // Design and Document use the same models for all subtypes
    if (selectedOption?.id === 'design') return designModelOptions;
    if (selectedOption?.id === 'document') return documentModelOptions;
    return imageGenerateModelOptions; // default
  };

  const currentModelOptions = getModelOptions();

  // Check if document type is selected (show only Type button initially)
  const isDocumentType = selectedOption?.id === 'document';

  const showSubTypeSelector = selectedOption !== null;

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Headline Section */}
      {showGreeting && (
        <div className="text-center">
          {greetingName && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <span className="text-xl text-muted-foreground font-medium">Hi {greetingName}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            What Would You Like To Do Today?
          </h1>
        </div>
      )}
      
      {/* Tagline for Landing */}
      {showTagline && (
        <div className="text-center">
          <p className="text-lg text-slate-400 mb-2 tracking-wide">
            Create Anything — Automate Everything
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight max-w-[52rem] mx-auto">
            What Would You Like To Do Today?
          </h1>
        </div>
      )}
      
      {/* Intent Selector */}
      <IntentSelector selectedIntent={intent} onIntentChange={setIntent} />
      
      {/* Prompt Input Box */}
      <div className="relative mx-auto w-full max-w-[95%] md:max-w-[1400px]" style={{ minWidth: 'min(340px, 100%)' }}>
        <div className="bg-white border-2 border-emerald-400 rounded-3xl shadow-sm min-h-[180px] flex flex-col w-fit min-w-[340px] sm:min-w-[520px] md:min-w-[800px] mx-auto relative">
          {/* Input area */}
          <div className="px-6 pt-5 pb-3 flex-1 flex gap-3 min-w-0">
            {/* Left side icons - only shown when an option is selected */}
            {selectedOption && (
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className={`p-1.5 rounded-lg bg-slate-100 ${selectedOption.color} hover:bg-slate-200 transition-colors`}>
                      <selectedOption.icon size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {selectedOption.id === 'image' ? 'Image-To-Prompt' : selectedOption.label}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 rounded-lg bg-slate-100 text-emerald-500 hover:bg-slate-200 transition-colors">
                      <Shuffle size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Auto Prompt</TooltipContent>
                </Tooltip>
              </div>
            )}

            <textarea
              placeholder={
                isListening 
                  ? 'Listening...' 
                  : selectedSubType?.id === 'transcribe' 
                    ? 'Upload or record audio to transcribe'
                    : selectedOption?.id === 'audio'
                      ? 'Describe your sound, music, or voiceover...'
                      : placeholdersByIntent[intent || 'default']
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="flex-1 min-w-0 border-none text-base text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Bottom bar */}
          <div className="flex items-center gap-4 flex-wrap px-4 pb-4">
            {/* Left side controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Auto dropdown - visible when intent is selected */}
              {intent && (
                <AutoDropdown intent={intent} selectedOption={selectedOption} onSelect={handleOptionSelect} />
              )}
              
              {/* For Document type: Show Type button directly after Document chip */}
              {selectedOption?.id === 'document' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      data-dropdown
                      onClick={() => toggleDropdown('type')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer",
                        selectedSubType 
                          ? (() => {
                              const color = selectedSubType.color || '';
                              let pastelBg = 'bg-slate-50 hover:bg-slate-100';
                              if (color.includes('blue')) pastelBg = 'bg-blue-50 hover:bg-blue-100';
                              else if (color.includes('red')) pastelBg = 'bg-red-50 hover:bg-red-100';
                              else if (color.includes('green')) pastelBg = 'bg-green-50 hover:bg-green-100';
                              else if (color.includes('orange')) pastelBg = 'bg-orange-50 hover:bg-orange-100';
                              else if (color.includes('purple')) pastelBg = 'bg-purple-50 hover:bg-purple-100';
                              else if (color.includes('amber')) pastelBg = 'bg-amber-50 hover:bg-amber-100';
                              else if (color.includes('violet')) pastelBg = 'bg-violet-50 hover:bg-violet-100';
                              else if (color.includes('cyan')) pastelBg = 'bg-cyan-50 hover:bg-cyan-100';
                              else if (color.includes('indigo')) pastelBg = 'bg-indigo-50 hover:bg-indigo-100';
                              else if (color.includes('teal')) pastelBg = 'bg-teal-50 hover:bg-teal-100';
                              else if (color.includes('emerald')) pastelBg = 'bg-emerald-50 hover:bg-emerald-100';
                              return `${pastelBg} ${selectedSubType.color} ${selectedSubType.color?.replace('text-', 'border-')}`;
                            })()
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                      )}
                    >
                      {selectedSubType ? (
                        <>
                          <selectedSubType.icon size={16} className={selectedSubType.color} />
                          <span>{selectedSubType.label}</span>
                          <ChevronDown size={14} className={selectedSubType.color} />
                        </>
                      ) : (
                        <>
                          <LayoutGrid size={16} className="text-slate-500" />
                          <span>Type</span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Type</TooltipContent>
                </Tooltip>
              )}
              
              {/* Type button - shows after Auto option is selected (for non-document types) */}
              {selectedOption && selectedOption.id !== 'document' && (
                <>
                  {/* Vertical separator between Auto and Type */}
                  <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        data-dropdown
                        onClick={() => toggleDropdown('type')}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer",
                          selectedSubType 
                            ? (() => {
                                const color = selectedSubType.color || '';
                                let pastelBg = 'bg-slate-50 hover:bg-slate-100';
                                if (color.includes('blue')) pastelBg = 'bg-blue-50 hover:bg-blue-100';
                                else if (color.includes('red')) pastelBg = 'bg-red-50 hover:bg-red-100';
                                else if (color.includes('green')) pastelBg = 'bg-green-50 hover:bg-green-100';
                                else if (color.includes('orange')) pastelBg = 'bg-orange-50 hover:bg-orange-100';
                                else if (color.includes('purple')) pastelBg = 'bg-purple-50 hover:bg-purple-100';
                                else if (color.includes('amber')) pastelBg = 'bg-amber-50 hover:bg-amber-100';
                                else if (color.includes('violet')) pastelBg = 'bg-violet-50 hover:bg-violet-100';
                                else if (color.includes('cyan')) pastelBg = 'bg-cyan-50 hover:bg-cyan-100';
                                else if (color.includes('indigo')) pastelBg = 'bg-indigo-50 hover:bg-indigo-100';
                                else if (color.includes('teal')) pastelBg = 'bg-teal-50 hover:bg-teal-100';
                                else if (color.includes('emerald')) pastelBg = 'bg-emerald-50 hover:bg-emerald-100';
                                return `${pastelBg} ${selectedSubType.color} ${selectedSubType.color?.replace('text-', 'border-')}`;
                              })()
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                        )}
                      >
                        {selectedSubType ? (
                          <>
                            <selectedSubType.icon size={16} className={selectedSubType.color} />
                            <span>{selectedSubType.label}</span>
                            <ChevronDown size={14} className={selectedSubType.color} />
                          </>
                        ) : (
                          <>
                            <LayoutGrid size={16} className="text-slate-500" />
                            <span>Type</span>
                            <ChevronDown size={14} className="text-slate-400" />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Type</TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Model and Control icons - visible after Type is selected */}
              {selectedSubType && (
                <>
                  {/* Vertical separator */}
                  <div className="w-px h-8 bg-slate-200 flex-shrink-0" />

                  {/* Model Button with dropdown */}
                  <div className="relative" data-dropdown>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          data-dropdown
                          onClick={() => toggleDropdown('model')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-sm font-medium transition-colors cursor-pointer"
                        >
                          <Box size={16} className="text-slate-500" />
                          <span>{currentModelOptions.find(m => m.id === selectedModel)?.label || 'Auto'}</span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Model</TooltipContent>
                    </Tooltip>
                    
                    {/* Model Dropdown */}
                    {activeDropdown === 'model' && (
                      <div data-dropdown className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[280px] max-h-[400px] overflow-y-auto">
                        {currentModelOptions.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setActiveDropdown(null);
                            }}
                            className={cn(
                              "flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                              selectedModel === model.id 
                                ? "bg-emerald-50 text-emerald-700" 
                                : "hover:bg-slate-50 text-slate-600"
                            )}
                          >
                            {/* Model Logo */}
                            {model.logo && (
                              <img 
                                src={model.logo} 
                                alt={model.label} 
                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0 mt-0.5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{model.label}</span>
                                {/* Badges */}
                                {model.badge && (
                                  <span className={cn(
                                    "px-1.5 py-0.5 text-[10px] font-semibold rounded",
                                    model.badge === 'SUGGESTED' && "bg-emerald-100 text-emerald-700",
                                    model.badge === 'PREMIUM' && "bg-amber-100 text-amber-700",
                                    model.badge === 'NEW' && "bg-blue-100 text-blue-700",
                                    model.badge === 'ULTRA' && "bg-purple-100 text-purple-700"
                                  )}>
                                    {model.badge}
                                  </span>
                                )}
                                {model.supportsImg2Img && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600">
                                    IMG2IMG
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block mt-0.5">{model.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audio-specific controls */}
                  {selectedOption?.id === 'audio' && (
                    <>
                      {/* Voiceover controls: Model + Voice + Language + Settings */}
                      {selectedSubType?.id === 'voiceover' && (
                        <>
                          <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleOpenAudioModal('voiceover')}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border",
                                  selectedVoice 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                )}
                              >
                                <Mic size={16} />
                                {selectedVoice && <span className="text-xs">{selectedVoice}</span>}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Select Voice</TooltipContent>
                          </Tooltip>
                          <div className="relative" data-dropdown>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={() => toggleDropdown('from-language')}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border",
                                    fromLanguage !== 'Auto'
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                  )}
                                >
                                  <Globe size={16} />
                                  {fromLanguage !== 'Auto' && <span className="text-xs">{fromLanguage}</span>}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Language</TooltipContent>
                            </Tooltip>
                            {activeDropdown === 'from-language' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[140px] max-h-[280px] overflow-y-auto">
                                {languageOptions.map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      setFromLanguage(lang);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      fromLanguage === lang ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="relative" data-dropdown>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={() => toggleDropdown('sfx-speed')}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border",
                                    sfxSpeed !== 'Normal'
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                  )}
                                >
                                  <Clock size={16} />
                                  {sfxSpeed !== 'Normal' && <span className="text-xs">{sfxSpeed}</span>}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Speed</TooltipContent>
                            </Tooltip>
                            {activeDropdown === 'sfx-speed' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[120px]">
                                {sfxSpeedOptions.map((speed) => (
                                  <button
                                    key={speed}
                                    onClick={() => {
                                      setSfxSpeed(speed);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      sfxSpeed === speed ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {speed}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-sm font-medium transition-colors">
                                <SlidersHorizontal size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Settings</TooltipContent>
                          </Tooltip>
                        </>
                      )}

                      {/* Clone controls: Clone Voice button + Select Voice dropdown */}
                      {selectedSubType?.id === 'clone' && (
                        <>
                          <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                          <button 
                            onClick={() => handleOpenAudioModal('clone')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors"
                          >
                            <Mic size={16} />
                            <span>Clone Voice</span>
                          </button>
                          <button 
                            onClick={() => handleOpenAudioModal('clone')}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                              clonedVoices > 0
                                ? "bg-violet-50 text-violet-600 border-violet-200"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                            )}
                          >
                            <Copy size={16} />
                            <span>Select Voice</span>
                            {clonedVoices > 0 && (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 text-white text-xs font-semibold">{clonedVoices}</span>
                            )}
                            <ChevronDown size={14} className="text-slate-400" />
                          </button>
                        </>
                      )}

                      {/* Revoice controls: Upload Audio + From Language + To Language */}
                      {selectedSubType?.id === 'revoice' && (
                        <>
                          <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                          <button 
                            onClick={() => handleOpenAudioModal('revoice')}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                              selectedAudioFile
                                ? "bg-cyan-50 text-cyan-600 border-cyan-200"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                            )}
                          >
                            <Upload size={16} />
                            <span>{selectedAudioFile ? selectedAudioFile.name.slice(0, 15) + '...' : 'Audio'}</span>
                            {uploadedFiles > 0 && (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-white text-xs font-semibold">{uploadedFiles}</span>
                            )}
                            <ChevronDown size={14} className="text-slate-400" />
                          </button>
                          <div className="relative" data-dropdown>
                            <button 
                              onClick={() => toggleDropdown('from-language')}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                fromLanguage !== 'Auto'
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              )}
                            >
                              <span>From: {fromLanguage}</span>
                              <ChevronDown size={14} className="text-slate-400" />
                            </button>
                            {activeDropdown === 'from-language' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[140px] max-h-[280px] overflow-y-auto">
                                {languageOptions.map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      setFromLanguage(lang);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      fromLanguage === lang ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="relative" data-dropdown>
                            <button 
                              onClick={() => toggleDropdown('to-language')}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                toLanguage !== 'Spanish'
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              )}
                            >
                              <Languages size={16} />
                              <span>To: {toLanguage}</span>
                              <ChevronDown size={14} className="text-slate-400" />
                            </button>
                            {activeDropdown === 'to-language' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[140px] max-h-[280px] overflow-y-auto">
                                {languageOptions.filter(l => l !== 'Auto').map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      setToLanguage(lang);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      toLanguage === lang ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Transcribe controls: Model + Language + Upload/Record */}
                      {selectedSubType?.id === 'transcribe' && (
                        <>
                          <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                          <div className="relative" data-dropdown>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={() => toggleDropdown('from-language')}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border",
                                    fromLanguage !== 'Auto'
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                  )}
                                >
                                  <Globe size={16} />
                                  {fromLanguage !== 'Auto' && <span className="text-xs">{fromLanguage}</span>}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Language</TooltipContent>
                            </Tooltip>
                            {activeDropdown === 'from-language' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[140px] max-h-[280px] overflow-y-auto">
                                {languageOptions.map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      setFromLanguage(lang);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      fromLanguage === lang ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleOpenAudioModal('transcribe')}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border",
                                  selectedAudioFile
                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                )}
                              >
                                <Upload size={16} />
                                {selectedAudioFile && <span className="text-xs">{selectedAudioFile.name.slice(0, 10)}...</span>}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Upload Audio</TooltipContent>
                          </Tooltip>
                          {isRecording ? (
                            <button 
                              onClick={stopRecordingAudio}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors animate-pulse"
                            >
                              <div className="w-2 h-2 rounded-full bg-white" />
                              <span>{formatRecordingTime(recordingTime)}</span>
                            </button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={startRecordingAudio}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-sm font-medium transition-colors"
                                >
                                  <Mic size={16} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Record Audio</TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      )}

                      {/* Sound Effects controls: Duration + Loop + Influence + Format */}
                      {selectedSubType?.id === 'sound-effects' && (
                        <>
                          <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                          <div className="relative" data-dropdown>
                            <button 
                              onClick={() => toggleDropdown('sfx-speed')}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                sfxSpeed !== 'Normal'
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              )}
                            >
                              <Clock size={16} />
                              <span>{sfxSpeed}</span>
                              <ChevronDown size={14} className="text-slate-400" />
                            </button>
                            {activeDropdown === 'sfx-speed' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[120px]">
                                {sfxSpeedOptions.map((speed) => (
                                  <button
                                    key={speed}
                                    onClick={() => {
                                      setSfxSpeed(speed);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      sfxSpeed === speed ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {speed}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => setSfxLoop(!sfxLoop)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                              sfxLoop 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                            )}
                          >
                            <Repeat size={16} />
                            <span>Loop</span>
                          </button>
                          <div className="relative" data-dropdown>
                            <button 
                              onClick={() => toggleDropdown('sfx-influence')}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                sfxInfluence !== '30%'
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              )}
                            >
                              <SlidersHorizontal size={16} />
                              <span>{sfxInfluence}</span>
                              <ChevronDown size={14} className="text-slate-400" />
                            </button>
                            {activeDropdown === 'sfx-influence' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[100px]">
                                {sfxInfluenceOptions.map((inf) => (
                                  <button
                                    key={inf}
                                    onClick={() => {
                                      setSfxInfluence(inf);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      sfxInfluence === inf ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {inf}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="relative" data-dropdown>
                            <button 
                              onClick={() => toggleDropdown('sfx-format')}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                sfxFormat !== 'MP3'
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              )}
                            >
                              <span>{sfxFormat}</span>
                              <ChevronDown size={14} className="text-slate-400" />
                            </button>
                            {activeDropdown === 'sfx-format' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[100px]">
                                {sfxFormatOptions.map((fmt) => (
                                  <button
                                    key={fmt}
                                    onClick={() => {
                                      setSfxFormat(fmt);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      sfxFormat === fmt ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {fmt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Music controls: Model Version + Instrumental/Vocals + Gender + Lyrics + Custom */}
                      {selectedSubType?.id === 'music' && (
                        <>
                          <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                          <div className="relative" data-dropdown>
                            <button 
                              onClick={() => toggleDropdown('music-vocal')}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                musicVocal === 'Instrumental'
                                  ? "bg-violet-50 text-violet-600 border-violet-200"
                                  : "bg-rose-50 text-rose-600 border-rose-200"
                              )}
                            >
                              {musicVocal === 'Instrumental' ? (
                                <Music size={16} />
                              ) : (
                                <Volume2 size={16} />
                              )}
                              <span>{musicVocal}</span>
                            </button>
                            {activeDropdown === 'music-vocal' && (
                              <div className="absolute left-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[140px]">
                                {musicVocalOptions.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() => {
                                      setMusicVocal(opt);
                                      if (opt === 'Instrumental') setMusicGender(null);
                                      setActiveDropdown(null);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                      musicVocal === opt ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                  >
                                    {opt === 'Instrumental' ? <Music size={16} /> : <Volume2 size={16} />}
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {musicVocal === 'With Vocals' && (
                            <>
                              <button 
                                onClick={() => setMusicGender(musicGender === 'Female' ? null : 'Female')}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                  musicGender === 'Female'
                                    ? "bg-pink-50 text-pink-600 border-pink-200"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                )}
                              >
                                👩
                                <span>Female</span>
                              </button>
                              <button 
                                onClick={() => setMusicGender(musicGender === 'Male' ? null : 'Male')}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                  musicGender === 'Male'
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                )}
                              >
                                👨
                                <span>Male</span>
                              </button>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button 
                                    className={cn(
                                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                      musicLyrics
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                    )}
                                  >
                                    <FileText size={16} />
                                    <span>{musicLyrics ? 'Lyrics ✓' : 'Add Lyrics'}</span>
                                    <ChevronDown size={14} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-96 bg-white border-slate-200 z-[9999] p-3" data-dropdown>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-slate-500">Enter your song lyrics (max 5000 characters)</p>
                                    </div>
                                    <textarea
                                      value={musicLyrics}
                                      onChange={(e) => setMusicLyrics(e.target.value)}
                                      placeholder="Write your lyrics here..."
                                      className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-200 outline-none resize-none min-h-[200px] focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300"
                                      maxLength={5000}
                                    />
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs text-slate-400">{musicLyrics.length}/5000</p>
                                      {musicLyrics && (
                                        <button
                                          onClick={() => setMusicLyrics('')}
                                          className="text-xs text-red-400 hover:text-red-500"
                                        >
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </>
                          )}
                          <button 
                            onClick={() => setCustomMode(!customMode)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                              customMode
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                            )}
                          >
                            <span>Custom</span>
                          </button>
                        </>
                      )}

                      {/* Audiobook controls: Just model selector (already shown) */}
                    </>
                  )}

                  {/* Additional control icons (if any) - only for non-document and non-audio types */}
                  {selectedOption?.id !== 'document' && selectedOption?.id !== 'audio' && getControlIcons().length > 0 && (
                    <>
                      <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                      <div className="relative flex items-center gap-1.5 flex-shrink-0">
                        {getControlIcons().map((control) => {
                          // Map control id to callback - use internal handlers for dropdowns
                          const getControlClickHandler = () => {
                            switch (control.id) {
                              case 'style': return () => { closeAllDropdowns(); onStyleClick?.(); };
                              case 'reference': return () => { closeAllDropdowns(); onReferenceClick?.(); };
                              case 'character': return () => { closeAllDropdowns(); onCharacterClick?.(); };
                              case 'ratio': return () => toggleDropdown('ratio');
                              case 'number': return () => toggleDropdown('number');
                              case 'duration': return () => toggleDropdown('duration');
                              case 'quality': return () => toggleDropdown('quality');
                              default: return undefined;
                            }
                          };
                          const clickHandler = getControlClickHandler();
                          
                          // Check if this control's dropdown is open
                          const isActive = activeDropdown === control.id;
                          
                          // Get selected value label for display
                          const getSelectedLabel = () => {
                            switch (control.id) {
                              case 'ratio': return selectedRatio;
                              case 'number': return selectedNumber.toString();
                              case 'duration': return selectedDuration;
                              case 'quality': return selectedQuality.charAt(0).toUpperCase() + selectedQuality.slice(1);
                              default: return null;
                            }
                          };
                          const selectedLabel = getSelectedLabel();
                          const hasSelection = selectedLabel && ['ratio', 'number', 'duration', 'quality'].includes(control.id);
                          
                          return (
                            <Tooltip key={control.id}>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={clickHandler}
                                  className={cn(
                                    "flex items-center gap-1.5 rounded-xl transition-colors border",
                                    hasSelection ? "px-3 py-2" : "p-2",
                                    isActive 
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-600 border-slate-200"
                                  )}
                                >
                                  <control.icon size={18} />
                                  {hasSelection && (
                                    <span className="text-sm font-medium">{selectedLabel}</span>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>{control.tooltip}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                        
                        {/* Dropdowns - rendered inside the relative container */}
                        {activeDropdown === 'ratio' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[100px]">
                            {ratioOptions.map((ratio) => (
                              <button
                                key={ratio}
                                onClick={() => {
                                  setSelectedRatio(ratio);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                  selectedRatio === ratio ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {activeDropdown === 'number' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[80px]">
                            {numberOptions.map((num) => (
                              <button
                                key={num}
                                onClick={() => {
                                  setSelectedNumber(num);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                  selectedNumber === num ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {activeDropdown === 'duration' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[80px]">
                            {durationOptions.map((dur) => (
                              <button
                                key={dur}
                                onClick={() => {
                                  setSelectedDuration(dur);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                  selectedDuration === dur ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {dur}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {activeDropdown === 'quality' && (
                          <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[9999] min-w-[100px]">
                            {qualityOptions.map((quality) => (
                              <button
                                key={quality}
                                onClick={() => {
                                  setSelectedQuality(quality);
                                  setActiveDropdown(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left capitalize",
                                  selectedQuality === quality ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                {quality}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right side controls */}
            <div className="ml-auto flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors",
                      !prompt.trim() && "opacity-0 pointer-events-none"
                    )}
                  >
                    <Sparkles size={16} className="text-violet-500" />
                    <span>AI</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Enhance Prompt</TooltipContent>
              </Tooltip>
              {isSupported && (
                isListening ? (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => {
                            cancelListening();
                            setPrompt('');
                          }}
                          className="p-1.5 rounded-lg transition-colors bg-red-50 hover:bg-red-100"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel</TooltipContent>
                    </Tooltip>
                    <div className="flex items-center gap-[2px] px-2">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-[2px] bg-red-400 rounded-full origin-center"
                          style={{
                            height: '16px',
                            animation: 'audioWave 0.6s ease-in-out infinite',
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={handleMicClick}
                          className="p-1.5 rounded-lg transition-colors bg-green-50 hover:bg-green-100"
                        >
                          <Check size={16} className="text-green-600" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Done</TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleMicClick}
                        className="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                      >
                        <Mic size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Speak</TooltipContent>
                  </Tooltip>
                )
              )}
              <button 
                onClick={onGenerate}
                disabled={selectedSubType?.id === 'transcribe' ? false : !prompt.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  (selectedSubType?.id === 'transcribe' || prompt.trim())
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-emerald-500/40 text-white/70 cursor-not-allowed'
                }`}
              >
                <Send size={16} />
                <span>{selectedSubType?.id === 'transcribe' ? 'Transcribe' : 'Generate For Free!'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Type Dropdown Panel */}
        {activeDropdown === 'type' && showSubTypeSelector && (
          <div data-dropdown className="absolute left-0 right-0 top-full mt-3 bg-white border border-slate-200 rounded-2xl shadow-lg p-5 z-50">
            <div className="grid grid-cols-4 gap-x-6 gap-y-3">
              {getSubTypeOptions().map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSubTypeSelect(option)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <option.icon size={18} className={option.color} />
                  <span className="text-sm font-medium text-slate-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audio Select Modal */}
      <AudioSelectModal
        isOpen={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        onSelectAudio={handleAudioSelect}
      />
    </div>
  );
};

export default AIVAPromptBox;
