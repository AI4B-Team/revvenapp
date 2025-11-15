// types.ts - TypeScript type definitions for REVVEN Brand Wizard

export interface BrandWizardData {
  // Identity Page
  logo?: File | string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  
  // Voice Page
  toneOfVoice: string[];
  writingStyle: string;
  communicationGuidelines: string;
  brandPersonality: string[];
  dosList: string[];
  dontsList: string[];
  
  // Knowledge Base Page
  dataSources: DataSource[];
  
  // Intelligence Page
  competitors: Creator[];
  emailCompetitors: EmailCompetitor[];
  trackedContent: ContentItem[];
  
  // Characters Page
  selectedCharacters: string[];
  defaultCharacter: string;
  customCharacters?: CustomCharacter[];
}

export interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'website' | 'text' | 'discovery';
  content?: string;
  url?: string;
  file?: File;
  includedLinks?: string[];
  status: 'training' | 'trained' | 'failed';
  createdAt: Date;
  size?: string;
  pages?: number;
}

export interface Creator {
  id: string;
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin';
  followers: string;
  posts: number;
  profileImage?: string;
  selected: boolean;
  verified?: boolean;
  engagementRate?: string;
}

export interface ContentItem {
  id: string;
  creatorId: string;
  creatorUsername: string;
  platform: string;
  thumbnail: string;
  videoUrl?: string;
  views: string;
  likes: string;
  comments: string;
  shares?: string;
  caption: string;
  hashtags?: string[];
  date: string;
  transcript?: string;
  analyzed: boolean;
  viralScore?: number;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  voice?: string;
  personality?: string;
  ethnicity?: string;
  gender?: string;
  ageRange?: string;
}

export interface CustomCharacter {
  id: string;
  name: string;
  description: string;
  referenceImages?: File[];
  voiceStyle?: string;
  personality?: string;
  ethnicity?: string;
  gender?: string;
  ageRange?: string;
  createdAt: Date;
}

export interface ToneOption {
  value: string;
  label: string;
  icon: string;
}

export interface WritingStyleOption {
  value: string;
  label: string;
  description: string;
}

export interface DataSourceType {
  type: 'file' | 'website' | 'text' | 'discovery';
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

export interface WizardPageProps<T = any> {
  formData: T;
  onUpdate: (data: Partial<T>) => void;
  onNext: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export interface IdentityFormData {
  logo?: File | string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
}

export interface VoiceFormData {
  toneOfVoice: string[];
  writingStyle: string;
  communicationGuidelines: string;
  brandPersonality: string[];
  dosList: string[];
  dontsList: string[];
}

export interface KnowledgeBaseFormData {
  dataSources: DataSource[];
}

export interface IntelligenceFormData {
  competitors: Creator[];
  emailCompetitors: EmailCompetitor[];
  trackedContent: ContentItem[];
}

export interface EmailCompetitor {
  id: string;
  name: string;
  industry: string;
  website: string;
  monitoringEmail: string;
  notes?: string;
  emailsCollected: number;
  lastEmailDate?: string;
  createdAt: Date;
}

export interface CharactersFormData {
  selectedCharacters: string[];
  defaultCharacter: string;
  customCharacters?: CustomCharacter[];
}

export type WizardStep = 'identity' | 'voice' | 'knowledge' | 'intelligence' | 'characters';

export interface StepConfig {
  id: WizardStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
}

// Validation schemas
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BrandSetupResponse {
  brandId: string;
  status: 'completed' | 'pending' | 'failed';
  message: string;
  nextSteps?: string[];
}

// Social Platform types
export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'facebook' | 'threads';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  connected: boolean;
  lastSync?: Date;
  followerCount?: number;
}

// Content types
export type ContentType = 'reel' | 'story' | 'post' | 'carousel' | 'video' | 'article';

export interface ContentTemplate {
  id: string;
  name: string;
  type: ContentType;
  platform: SocialPlatform;
  thumbnail?: string;
  description: string;
}

// Campaign types (for future implementation)
export interface Campaign {
  id: string;
  name: string;
  brandId: string;
  characterId: string;
  platforms: SocialPlatform[];
  postingSchedule: PostingSchedule;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

export interface PostingSchedule {
  frequency: 'daily' | 'weekly' | 'custom';
  timesPerDay?: number;
  specificTimes?: string[];
  daysOfWeek?: number[];
  autoPublish: boolean;
}

// Analytics types (for future implementation)
export interface ContentAnalytics {
  contentId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  reach: number;
  impressions: number;
  clickThroughRate?: number;
}

// Agent types (for future implementation)
export type AgentType = 'copywriting' | 'content' | 'social' | 'mediaBuyer';

export interface AIAgent {
  id: string;
  type: AgentType;
  brandId: string;
  status: 'active' | 'inactive' | 'training';
  lastActive?: Date;
  tasksCompleted: number;
}

export interface CopywritingTask {
  id: string;
  agentId: string;
  competitorContentId: string;
  scriptVariations: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string[];
}

export interface ContentCreationTask {
  id: string;
  agentId: string;
  scriptId: string;
  characterId: string;
  contentType: ContentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  outputUrl?: string;
}

// User preferences
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    contentReady: boolean;
    campaignUpdates: boolean;
  };
  autoApprove: boolean;
  defaultCharacter?: string;
  theme: 'light' | 'dark' | 'auto';
}

// Export utility types
export type Maybe<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
