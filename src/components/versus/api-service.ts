// ============================================================================
// LLM ARENA - API SERVICE LAYER
// ============================================================================

import type { 
  ChatRequest, 
  ChatResponse, 
  StreamChunk, 
  AIModel, 
  AIProvider,
  Message 
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  xai: 'https://api.x.ai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  perplexity: 'https://api.perplexity.ai/chat/completions',
  // For self-hosted/open models via your backend
  revven: '/api/llm/chat',
};

// Model ID to API model string mapping
const MODEL_API_NAMES: Record<string, string> = {
  // OpenAI
  'gpt-5': 'gpt-5',
  'gpt-5-turbo': 'gpt-5-turbo',
  'gpt-4o': 'gpt-4o',
  'o1-pro': 'o1-pro',
  
  // Anthropic
  'claude-opus-4': 'claude-opus-4-20251201',
  'claude-sonnet-4': 'claude-sonnet-4-20251201',
  'claude-haiku-4': 'claude-haiku-4-20251201',
  
  // Google
  'gemini-2-ultra': 'gemini-2.0-ultra',
  'gemini-2-flash': 'gemini-2.5-flash',
  
  // xAI
  'grok-3': 'grok-3',
  
  // Meta (via your backend)
  'llama-4-405b': 'meta-llama/Llama-4-405b-instruct',
  
  // Mistral
  'mistral-large': 'mistral-large-latest',
  
  // Perplexity
  'sonar-pro': 'sonar-pro',
};

// ============================================================================
// PROVIDER-SPECIFIC REQUEST FORMATTERS
// ============================================================================

interface FormattedRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

const formatOpenAIRequest = (
  request: ChatRequest,
  apiKey: string
): FormattedRequest => {
  const messages = request.messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  if (request.systemPrompt) {
    messages.unshift({ role: 'system', content: request.systemPrompt });
  }

  return {
    url: API_ENDPOINTS.openai,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_API_NAMES[request.modelId] || request.modelId,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
      stream: request.stream ?? true,
    }),
  };
};

const formatAnthropicRequest = (
  request: ChatRequest,
  apiKey: string
): FormattedRequest => {
  const messages = request.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role,
      content: m.content,
    }));

  return {
    url: API_ENDPOINTS.anthropic,
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2024-10-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_API_NAMES[request.modelId] || request.modelId,
      messages,
      system: request.systemPrompt,
      max_tokens: request.maxTokens ?? 4096,
      stream: request.stream ?? true,
    }),
  };
};

const formatGoogleRequest = (
  request: ChatRequest,
  apiKey: string
): FormattedRequest => {
  const modelName = MODEL_API_NAMES[request.modelId] || request.modelId;
  const contents = request.messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return {
    url: `${API_ENDPOINTS.google}/${modelName}:${request.stream ? 'streamGenerateContent' : 'generateContent'}?key=${apiKey}`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      systemInstruction: request.systemPrompt ? { parts: [{ text: request.systemPrompt }] } : undefined,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 4096,
      },
    }),
  };
};

const formatRevvenRequest = (
  request: ChatRequest,
  userToken: string
): FormattedRequest => {
  // Route through your REVVEN backend for unified handling
  return {
    url: API_ENDPOINTS.revven,
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modelId: request.modelId,
      messages: request.messages,
      systemPrompt: request.systemPrompt,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      stream: request.stream,
      tools: request.tools,
    }),
  };
};

// ============================================================================
// MAIN API SERVICE CLASS
// ============================================================================

export class LLMArenaService {
  private apiKeys: Record<string, string> = {};
  private userToken: string = '';
  private useRevvenBackend: boolean = true;

  constructor(config?: {
    apiKeys?: Record<string, string>;
    userToken?: string;
    useRevvenBackend?: boolean;
  }) {
    if (config?.apiKeys) this.apiKeys = config.apiKeys;
    if (config?.userToken) this.userToken = config.userToken;
    if (config?.useRevvenBackend !== undefined) this.useRevvenBackend = config.useRevvenBackend;
  }

  setApiKey(provider: string, key: string): void {
    this.apiKeys[provider] = key;
  }

  setUserToken(token: string): void {
    this.userToken = token;
  }

  // Get provider ID from model ID
  private getProviderId(modelId: string): string {
    const providerMap: Record<string, string> = {
      'gpt': 'openai',
      'o1': 'openai',
      'claude': 'anthropic',
      'gemini': 'google',
      'grok': 'xai',
      'llama': 'meta',
      'mistral': 'mistral',
      'sonar': 'perplexity',
    };

    for (const [prefix, provider] of Object.entries(providerMap)) {
      if (modelId.startsWith(prefix)) return provider;
    }
    return 'revven'; // Default to REVVEN backend
  }

  // Format request based on provider
  private formatRequest(request: ChatRequest): FormattedRequest {
    // If using REVVEN backend, route everything through it
    if (this.useRevvenBackend) {
      return formatRevvenRequest(request, this.userToken);
    }

    const providerId = this.getProviderId(request.modelId);
    const apiKey = this.apiKeys[providerId];

    if (!apiKey) {
      throw new Error(`No API key configured for provider: ${providerId}`);
    }

    switch (providerId) {
      case 'openai':
      case 'xai':
      case 'mistral':
      case 'perplexity':
        return formatOpenAIRequest(request, apiKey);
      case 'anthropic':
        return formatAnthropicRequest(request, apiKey);
      case 'google':
        return formatGoogleRequest(request, apiKey);
      default:
        return formatRevvenRequest(request, this.userToken);
    }
  }

  // Non-streaming chat completion
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const formattedRequest = this.formatRequest({ ...request, stream: false });

    const response = await fetch(formattedRequest.url, {
      method: 'POST',
      headers: formattedRequest.headers,
      body: formattedRequest.body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    // Parse response based on provider format
    return this.parseResponse(request.modelId, data, latencyMs);
  }

  // Streaming chat completion
  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const formattedRequest = this.formatRequest({ ...request, stream: true });

    const response = await fetch(formattedRequest.url, {
      method: 'POST',
      headers: formattedRequest.headers,
      body: formattedRequest.body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { id: 'done', delta: '', finishReason: 'stop' };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const chunk = this.parseStreamChunk(request.modelId, parsed);
            if (chunk) yield chunk;
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }
  }

  // Helper to stream and collect full response
  async streamToCallback(
    request: ChatRequest,
    onChunk: (content: string) => void,
    onComplete?: (fullContent: string) => void,
    onError?: (error: Error) => void
  ): Promise<string> {
    let fullContent = '';

    try {
      for await (const chunk of this.chatStream(request)) {
        fullContent += chunk.delta;
        onChunk(fullContent);

        if (chunk.finishReason === 'stop') {
          break;
        }
      }

      onComplete?.(fullContent);
      return fullContent;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  // Parse non-streaming response
  private parseResponse(modelId: string, data: any, latencyMs: number): ChatResponse {
    const providerId = this.getProviderId(modelId);

    switch (providerId) {
      case 'openai':
      case 'xai':
      case 'mistral':
      case 'perplexity':
        return {
          id: data.id,
          modelId,
          content: data.choices[0]?.message?.content || '',
          finishReason: data.choices[0]?.finish_reason || 'stop',
          usage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          } : undefined,
          latencyMs,
        };

      case 'anthropic':
        return {
          id: data.id,
          modelId,
          content: data.content[0]?.text || '',
          finishReason: data.stop_reason || 'stop',
          usage: data.usage ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          } : undefined,
          latencyMs,
        };

      case 'google':
        return {
          id: data.candidates?.[0]?.content?.parts?.[0]?.text || 'unknown',
          modelId,
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
          finishReason: 'stop',
          latencyMs,
        };

      default:
        // REVVEN backend format
        return {
          id: data.id,
          modelId,
          content: data.content || data.message || '',
          finishReason: data.finishReason || 'stop',
          usage: data.usage,
          latencyMs,
        };
    }
  }

  // Parse streaming chunk
  private parseStreamChunk(modelId: string, data: any): StreamChunk | null {
    const providerId = this.getProviderId(modelId);

    switch (providerId) {
      case 'openai':
      case 'xai':
      case 'mistral':
      case 'perplexity':
        const delta = data.choices?.[0]?.delta?.content || '';
        const finishReason = data.choices?.[0]?.finish_reason;
        return {
          id: data.id,
          delta,
          finishReason: finishReason || undefined,
        };

      case 'anthropic':
        if (data.type === 'content_block_delta') {
          return {
            id: data.index?.toString() || 'chunk',
            delta: data.delta?.text || '',
          };
        }
        if (data.type === 'message_stop') {
          return {
            id: 'stop',
            delta: '',
            finishReason: 'stop',
          };
        }
        return null;

      case 'google':
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
          id: 'chunk',
          delta: text,
          finishReason: data.candidates?.[0]?.finishReason?.toLowerCase(),
        };

      default:
        // REVVEN backend format
        return {
          id: data.id || 'chunk',
          delta: data.delta || data.content || '',
          finishReason: data.finishReason,
        };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const llmArenaService = new LLMArenaService();

// ============================================================================
// HELPER HOOKS FOR REACT
// ============================================================================

export const createArenaHooks = (service: LLMArenaService) => ({
  useChat: () => {
    return {
      sendMessage: async (
        modelId: string,
        messages: Message[],
        onChunk: (content: string) => void
      ) => {
        return service.streamToCallback(
          { modelId, messages, stream: true },
          onChunk
        );
      },
    };
  },
});
