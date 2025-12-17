// ============================================================================
// LLM ARENA - TYPE DEFINITIONS
// ============================================================================

// Provider & Model Types
export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  apiEndpoint?: string;
  apiKeyEnvVar?: string;
}

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  capabilities: ModelCapability[];
  description?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  costPer1kInput?: number;
  costPer1kOutput?: number;
  isAvailable?: boolean;
}

export type ModelCapability = 
  | 'thinking'
  | 'vision'
  | 'code'
  | 'fast'
  | 'audio'
  | 'reasoning'
  | 'efficient'
  | 'open-source'
  | 'multilingual'
  | 'search'
  | 'citations'
  | 'realtime'
  | 'tools';

// Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  modelId?: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokensUsed?: number;
  latencyMs?: number;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
  citations?: Citation[];
}

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

// Panel & Layout Types
export interface PanelState {
  id: string;
  modelId: string;
  messages: Message[];
  isLoading: boolean;
  isExpanded: boolean;
  error?: string;
  streamingContent?: string;
}

export type LayoutMode = 1 | 2 | 3 | 4;

// Arena Configuration
export interface ArenaConfig {
  maxPanels: number;
  defaultLayout: LayoutMode;
  enableInterModelChat: boolean;
  interModelRounds: number;
  enableToolkits: boolean;
  availableToolkits: Toolkit[];
  streamResponses: boolean;
  saveHistory: boolean;
}

export interface Toolkit {
  id: string;
  name: string;
  icon: string;
  description: string;
  isEnabled: boolean;
}

// API Request/Response Types
export interface ChatRequest {
  modelId: string;
  messages: Message[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: ToolDefinition[];
}

export interface ChatResponse {
  id: string;
  modelId: string;
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

export interface StreamChunk {
  id: string;
  delta: string;
  finishReason?: 'stop' | 'length' | 'content_filter';
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Inter-Model Communication Types
export interface InterModelConfig {
  enabled: boolean;
  rounds: number;
  mode: 'sequential' | 'parallel';
  topicFocus?: string;
  moderatorModel?: string;
}

export interface InterModelExchange {
  round: number;
  exchanges: {
    fromModelId: string;
    toModelId: string;
    message: Message;
  }[];
}

// Event Types for Real-time Updates
export type ArenaEvent = 
  | { type: 'message_start'; panelId: string; modelId: string }
  | { type: 'message_delta'; panelId: string; delta: string }
  | { type: 'message_complete'; panelId: string; message: Message }
  | { type: 'message_error'; panelId: string; error: string }
  | { type: 'inter_model_start'; round: number }
  | { type: 'inter_model_complete'; round: number };

// User Preferences
export interface ArenaPreferences {
  defaultModels: string[];
  preferredLayout: LayoutMode;
  theme: 'dark' | 'light' | 'system';
  showTokenCounts: boolean;
  showLatency: boolean;
  autoScroll: boolean;
}

// History & Analytics
export interface ArenaSession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  panels: PanelState[];
  config: ArenaConfig;
}

export interface ModelAnalytics {
  modelId: string;
  totalRequests: number;
  avgLatencyMs: number;
  avgTokensPerResponse: number;
  errorRate: number;
}
