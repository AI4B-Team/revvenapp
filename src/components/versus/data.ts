import { AIProvider, AIModel } from './types';

// Import model logos
import grokLogo from '@/assets/model-logos/grok.png';
import openaiLogo from '@/assets/model-logos/openai.png';
import anthropicLogo from '@/assets/model-logos/anthropic.svg';
import googleLogo from '@/assets/model-logos/google.svg';
import perplexityLogo from '@/assets/model-logos/perplexity.svg';
import deepseekLogo from '@/assets/model-logos/deepseek.svg';

export const AI_PROVIDERS: AIProvider[] = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    icon: '◎', 
    logo: openaiLogo,
    color: '#10a37f' 
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    icon: '◈', 
    logo: anthropicLogo,
    color: '#d4a574' 
  },
  { 
    id: 'google', 
    name: 'Google', 
    icon: '✦', 
    logo: googleLogo,
    color: '#4285f4' 
  },
  { 
    id: 'xai', 
    name: 'xAI', 
    icon: '𝕏', 
    logo: grokLogo,
    color: '#ffffff' 
  },
  { 
    id: 'meta', 
    name: 'Meta', 
    icon: '∞', 
    color: '#0668E1' 
  },
  { 
    id: 'mistral', 
    name: 'Mistral', 
    icon: '▣', 
    color: '#ff7000' 
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    icon: '◉', 
    logo: perplexityLogo,
    color: '#20b8cd' 
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    icon: '🔍', 
    logo: deepseekLogo,
    color: '#6366f1' 
  },
];

export const AI_MODELS: AIModel[] = [
  // OpenAI
  { 
    id: 'gpt-5', 
    providerId: 'openai', 
    name: 'GPT-5', 
    displayName: 'GPT-5', 
    capabilities: ['thinking', 'vision', 'code', 'tools'],
    supportsVision: true,
    supportsFiles: true,
    tier: 'deep'
  },
  { 
    id: 'gpt-5-turbo', 
    providerId: 'openai', 
    name: 'GPT-5 Turbo', 
    displayName: 'GPT-5 Turbo', 
    capabilities: ['fast', 'vision'],
    supportsVision: true,
    supportsFiles: true,
    tier: 'fast'
  },
  { 
    id: 'gpt-4o', 
    providerId: 'openai', 
    name: 'GPT-4o', 
    displayName: 'GPT-4o', 
    capabilities: ['vision', 'audio'],
    supportsVision: true,
    supportsFiles: true,
    tier: 'balanced'
  },
  { 
    id: 'o1-pro', 
    providerId: 'openai', 
    name: 'o1 Pro', 
    displayName: 'o1 Pro', 
    capabilities: ['thinking', 'reasoning'],
    supportsVision: false,
    supportsFiles: false,
    tier: 'deep'
  },
  
  // Anthropic
  { 
    id: 'claude-opus-4', 
    providerId: 'anthropic', 
    name: 'Claude Opus 4', 
    displayName: 'Claude Opus 4', 
    capabilities: ['thinking', 'vision', 'code'],
    supportsVision: true,
    supportsFiles: true,
    tier: 'deep'
  },
  { 
    id: 'claude-sonnet-4', 
    providerId: 'anthropic', 
    name: 'Claude Sonnet 4', 
    displayName: 'Claude Sonnet 4', 
    capabilities: ['fast', 'vision', 'code'],
    supportsVision: true,
    supportsFiles: true,
    tier: 'balanced'
  },
  { 
    id: 'claude-haiku-4', 
    providerId: 'anthropic', 
    name: 'Claude Haiku 4', 
    displayName: 'Claude Haiku 4', 
    capabilities: ['fast', 'efficient'],
    supportsVision: true,
    supportsFiles: false,
    tier: 'fast'
  },
  
  // Google
  { 
    id: 'gemini-2-ultra', 
    providerId: 'google', 
    name: 'Gemini 2 Ultra', 
    displayName: 'Gemini 2 Ultra', 
    capabilities: ['thinking', 'vision', 'code'],
    supportsVision: true,
    supportsFiles: true,
    tier: 'deep'
  },
  { 
    id: 'gemini-2-flash', 
    providerId: 'google', 
    name: 'Gemini 2.5 Flash', 
    displayName: 'Gemini 2.5 Flash', 
    capabilities: ['fast', 'vision'],
    supportsVision: true,
    supportsFiles: true,
    tier: 'fast'
  },
  
  // xAI
  { 
    id: 'grok-3', 
    providerId: 'xai', 
    name: 'Grok-3', 
    displayName: 'Grok-3', 
    capabilities: ['thinking', 'realtime', 'web'],
    supportsVision: true,
    supportsFiles: false,
    tier: 'balanced'
  },
  
  // Meta
  { 
    id: 'llama-4-405b', 
    providerId: 'meta', 
    name: 'Llama 4 405B', 
    displayName: 'Llama 4 405B', 
    capabilities: ['open-source', 'code'],
    supportsVision: false,
    supportsFiles: false,
    tier: 'deep'
  },
  
  // Mistral
  { 
    id: 'mistral-large', 
    providerId: 'mistral', 
    name: 'Mistral Large', 
    displayName: 'Mistral Large', 
    capabilities: ['multilingual', 'code'],
    supportsVision: false,
    supportsFiles: false,
    tier: 'balanced'
  },
  
  // Perplexity
  { 
    id: 'sonar-pro', 
    providerId: 'perplexity', 
    name: 'Sonar Pro', 
    displayName: 'Sonar Pro', 
    capabilities: ['search', 'citations', 'web'],
    supportsVision: false,
    supportsFiles: false,
    tier: 'balanced'
  },
  
  // DeepSeek
  { 
    id: 'deepseek-r1', 
    providerId: 'deepseek', 
    name: 'DeepSeek R1', 
    displayName: 'DeepSeek R1', 
    capabilities: ['reasoning', 'code'],
    supportsVision: false,
    supportsFiles: false,
    tier: 'deep'
  },
];

export const getModelById = (modelId: string) => AI_MODELS.find(m => m.id === modelId);
export const getProviderById = (providerId: string) => AI_PROVIDERS.find(p => p.id === providerId);
export const generateId = () => Math.random().toString(36).substring(2, 15);

// Simulated AI response - Replace with actual API calls
export const simulateAIResponse = async (
  modelId: string, 
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const model = getModelById(modelId);
  const responses = [
    `As ${model?.displayName}, I'd approach this by analyzing the key factors at play. `,
    `Let me break this down systematically. First, we need to consider the underlying assumptions. `,
    `This is an interesting challenge. From my perspective, the optimal solution involves several steps. `,
    `Based on my training and capabilities, here's my analysis of your request. `,
  ];
  
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];
  const fullResponse = baseResponse + `The question "${prompt.substring(0, 50)}..." touches on important concepts. I believe the best approach would be to consider multiple perspectives and synthesize them into a coherent framework. This allows us to address both the immediate concerns and the broader implications. Let me elaborate on the key points that stand out to me...`;
  
  // Simulate streaming
  for (let i = 0; i < fullResponse.length; i += 3) {
    await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    onChunk(fullResponse.substring(0, i + 3));
  }
  
  return fullResponse;
};
