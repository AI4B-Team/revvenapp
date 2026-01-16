import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { X, MessageSquare, SlidersHorizontal, Maximize2, Minimize2, Mic, MicOff, Plus, Send, Sparkles, Loader2, Trash2, Image, Video, Music, Palette, FileText, BookOpen, ChevronDown, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Voice options for audio generation
const VOICE_OPTIONS = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'Female' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'Male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'Female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'Male' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'Male' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'Male' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', gender: 'Neutral' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'Male' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'Female' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'Female' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'Female' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', gender: 'Male' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'Female' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', gender: 'Male' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'Male' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'Male' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'Male' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'Female' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'Male' },
];

// Tool definitions for AIVA with specific models
const AIVA_TOOLS = [
  { id: 'image', label: 'Generate Image', icon: Image, color: 'text-blue-500', description: 'AI Image Generator', model: 'nano-banana-pro' },
  { id: 'video', label: 'Generate Video', icon: Video, color: 'text-purple-500', description: 'AI Video Generator', model: 'veo3' },
  { id: 'audio', label: 'Generate Audio', icon: Music, color: 'text-orange-500', description: 'Text to Speech', model: 'elevenlabs' },
  { id: 'design', label: 'Create Design', icon: Palette, color: 'text-pink-500', description: 'AI Design Generator', model: 'nano-banana-pro' },
  { id: 'content', label: 'Write Content', icon: FileText, color: 'text-green-500', description: 'AI Content Writer', model: 'claude-sonnet-4.5' },
  { id: 'document', label: 'Create Document', icon: BookOpen, color: 'text-cyan-500', description: 'AI Document Writer', model: 'claude-sonnet-4.5' },
] as const;

// Simple markdown renderer for chat messages
const renderMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Split by lines to handle lists and paragraphs
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Process inline formatting
    const processInline = (str: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = str;
      let keyIndex = 0;
      
      while (remaining.length > 0) {
        // Bold: **text**
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.substring(0, boldMatch.index));
          }
          parts.push(<strong key={`bold-${keyIndex++}`}>{boldMatch[1]}</strong>);
          remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
          continue;
        }
        
        // Italic: *text* (but not **)
        const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
        if (italicMatch && italicMatch.index !== undefined) {
          if (italicMatch.index > 0) {
            parts.push(remaining.substring(0, italicMatch.index));
          }
          parts.push(<em key={`italic-${keyIndex++}`}>{italicMatch[1]}</em>);
          remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
          continue;
        }
        
        // No more matches, add remaining text
        parts.push(remaining);
        break;
      }
      
      return parts;
    };
    
    // Check for list items
    if (line.match(/^\d+\.\s/)) {
      // Numbered list
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={lineIndex} className="flex gap-2 ml-2">
          <span className="text-muted-foreground">{line.match(/^\d+/)?.[0]}.</span>
          <span>{processInline(content)}</span>
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Bullet list
      const content = line.substring(2);
      elements.push(
        <div key={lineIndex} className="flex gap-2 ml-2">
          <span className="text-muted-foreground">•</span>
          <span>{processInline(content)}</span>
        </div>
      );
    } else if (line.trim() === '') {
      // Empty line = paragraph break
      elements.push(<div key={lineIndex} className="h-2" />);
    } else {
      // Regular line
      elements.push(
        <div key={lineIndex}>{processInline(line)}</div>
      );
    }
  });
  
  return <div className="space-y-1 text-sm whitespace-pre-wrap">{elements}</div>;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  isGenerating?: boolean;
  generationType?: 'image' | 'video' | 'audio';
}

export type ToolType = 'image' | 'video' | 'audio' | 'design' | 'content' | 'document';

export interface ToolAction {
  type: ToolType;
  prompt: string;
  subType?: string;
  model?: string;
}

interface AIVASidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarCollapsed?: boolean;
  onToolAction?: (action: ToolAction) => void;
}

// App-specific suggestions
const appSuggestions: Record<string, { title: string; suggestions: string[] }> = {
  '/create': {
    title: 'Create Studio',
    suggestions: [
      'Generate a product photo with studio lighting',
      'Create a social media carousel for my brand',
      'Help me write a caption for Instagram',
      'Upscale and enhance my image quality',
    ],
  },
  '/edit': {
    title: 'Video Editor',
    suggestions: [
      'Add captions to my video automatically',
      'Suggest background music for this clip',
      'Help me trim and arrange my scenes',
      'Create a thumbnail for my video',
    ],
  },
  '/transcribe': {
    title: 'Transcribe',
    suggestions: [
      'Transcribe this audio file accurately',
      'Identify different speakers in the recording',
      'Generate a summary of the transcript',
      'Export transcript to different formats',
    ],
  },
  '/blog-writer': {
    title: 'Blog Writer',
    suggestions: [
      'Help me outline a blog post about...',
      'Suggest SEO keywords for my article',
      'Write an engaging introduction',
      'Generate meta description for this post',
    ],
  },
  '/voiceovers': {
    title: 'Voiceovers',
    suggestions: [
      'Generate a professional voiceover',
      'Clone my voice for future use',
      'Add background music to narration',
      'Translate voiceover to another language',
    ],
  },
  default: {
    title: 'AIVA Assistant',
    suggestions: [
      'Help me create engaging content',
      'Generate images for my project',
      'Write copy for my brand',
      'Suggest creative ideas',
    ],
  },
};

const AIVASidePanel = ({ isOpen, onClose, sidebarCollapsed = false, onToolAction }: AIVASidePanelProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Speech recognition for voice input
  const handleSpeechResult = useCallback((transcript: string) => {
    setMessage(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
  });

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening(message);
    }
  }, [isListening, startListening, stopListening, message]);

  // Get suggestions based on current app
  const currentPath = location.pathname;
  const appConfig = appSuggestions[currentPath] || appSuggestions.default;

  // Load user and chat history on mount
  useEffect(() => {
    const loadUserAndHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Load recent messages (last 50)
        const { data: savedMessages } = await supabase
          .from('aiva_chat_messages')
          .select('id, role, content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(50);
        
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content
          })));
        }
      }
    };
    loadUserAndHistory();
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Save message to database
  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!userId) return;
    try {
      await supabase.from('aiva_chat_messages').insert({
        user_id: userId,
        role,
        content,
        context: currentPath
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Save user message to database
    await saveMessage('user', userMessage.content);

    // Create placeholder for assistant message
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      // Get auth token for the request
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use direct fetch for streaming support
      const response = await fetch(`${SUPABASE_URL}/functions/v1/aiva-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context: currentPath,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantId 
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Save assistant response to database
      if (fullContent) {
        await saveMessage('assistant', fullContent);
      }
    } catch (error) {
      console.error('AIVA chat error:', error);
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: errorMsg }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleClearChat = async () => {
    setMessages([]);
    // Delete all messages from database
    if (userId) {
      try {
        await supabase
          .from('aiva_chat_messages')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.error('Failed to clear chat history:', error);
      }
    }
  };

  // Handle tool selection
  const handleToolSelect = (toolId: ToolType) => {
    setSelectedTool(toolId);
    setShowToolsMenu(false);
    inputRef.current?.focus();
  };

  // Execute tool with prompt - generate inline
  const executeToolAction = async (prompt: string) => {
    if (!selectedTool) return;
    
    const tool = AIVA_TOOLS.find(t => t.id === selectedTool);
    const toolName = tool?.label || selectedTool;
    const modelName = tool?.description || '';
    
    // Create placeholder message with loading state
    const messageId = crypto.randomUUID();
    
    if (selectedTool === 'image' || selectedTool === 'design') {
      // Add loading message for image generation
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: `🎨 Creating your image...\n\nPrompt: "${prompt}"`,
        isGenerating: true,
        generationType: 'image'
      }]);
      
      try {
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }
        
        // Call the generate-image edge function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            prompt: prompt,
            model: 'nano-banana-pro',
            aspectRatio: '1:1',
            numberOfImages: 1
          })
        });
        
        if (!response.ok) {
          throw new Error('Image generation failed');
        }
        
        const data = await response.json();
        
        // Update message to show it's processing (webhook will update the image)
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { 
                ...m, 
                content: `🖼️ Image is being generated...\n\nPrompt: "${prompt}"\n\n⏳ Processing...`,
                isGenerating: true
              }
            : m
        ));
        
        // Poll for the image result
        if (data.images && data.images[0]?.id) {
          pollForImageResult(messageId, data.images[0].id, prompt);
        }
        
      } catch (error) {
        console.error('Image generation error:', error);
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { 
                ...m, 
                content: `❌ Failed to generate image.\n\nPrompt: "${prompt}"\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isGenerating: false
              }
            : m
        ));
      }
    } else if (selectedTool === 'video') {
      // Add loading message for video generation
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: `🎬 Creating your video...\n\nPrompt: "${prompt}"`,
        isGenerating: true,
        generationType: 'video'
      }]);
      
      try {
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }
        
        // Call the generate-veo-video edge function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-veo-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            prompt: prompt,
            model: 'veo3',
            userId: session.user.id,
            characterName: 'AIVA Generated',
            characterBio: 'Generated from AIVA chat',
            characterImageUrl: '',
            videoTopic: prompt,
            videoStyle: 'cinematic'
          })
        });
        
        if (!response.ok) {
          throw new Error('Video generation failed');
        }
        
        const data = await response.json();
        
        // Update message to show it's processing
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { 
                ...m, 
                content: `🎬 Video is being generated...\n\nPrompt: "${prompt}"\n\n⏳ Processing...\n\nThis may take a few minutes.`,
                isGenerating: true
              }
            : m
        ));
        
        // Poll for the video result - edge function returns video_id (with underscore)
        const videoId = data.video_id || data.videoId;
        if (videoId) {
          pollForVideoResult(messageId, videoId, prompt);
        } else {
          console.error('No video_id in response:', data);
          throw new Error('No video ID returned from API');
        }
        
      } catch (error) {
        console.error('Video generation error:', error);
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { 
                ...m, 
                content: `❌ Failed to generate video.\n\nPrompt: "${prompt}"\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isGenerating: false
              }
            : m
        ));
      }
    } else if (selectedTool === 'audio') {
      // Add loading message for audio generation
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: `🎵 Creating your audio...\n\nVoice: ${selectedVoice.name}\n\nText: "${prompt}"`,
        isGenerating: true,
        generationType: 'audio'
      }]);
      
      try {
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }
        
        // Call the generate-voiceover edge function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-voiceover`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            text: prompt,
            voice: selectedVoice.id,
            voiceName: selectedVoice.name,
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 1.0
          })
        });
        
        if (!response.ok) {
          throw new Error('Audio generation failed');
        }
        
        const data = await response.json();
        
        // Update message to show it's processing
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { 
                ...m, 
                content: `🎵 Audio is being generated...\n\nVoice: ${selectedVoice.name}\n\nText: "${prompt}"\n\n⏳ Processing...`,
                isGenerating: true
              }
            : m
        ));
        
        // Poll for the audio result
        if (data.id) {
          pollForAudioResult(messageId, data.id, prompt, selectedVoice.name);
        } else {
          console.error('No id in response:', data);
          throw new Error('No audio ID returned from API');
        }
        
      } catch (error) {
        console.error('Audio generation error:', error);
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { 
                ...m, 
                content: `❌ Failed to generate audio.\n\nText: "${prompt}"\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isGenerating: false
              }
            : m
        ));
      }
    } else if (onToolAction) {
      // For other tools, use the external action handler
      onToolAction({
        type: selectedTool,
        prompt: prompt,
        model: tool?.model
      });
      
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: `🎨 Starting ${toolName}...\n\nPrompt: "${prompt}"\n\nI've sent this to the generator. Check the main area for your creation!`
      }]);
    }
    
    setSelectedTool(null);
  };
  
  // Poll for image generation result
  const pollForImageResult = async (messageId: string, imageRecordId: string, prompt: string) => {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;
    
    const checkStatus = async () => {
      attempts++;
      
      try {
        const { data: imageRecord, error } = await supabase
          .from('generated_images')
          .select('status, image_url, error_message')
          .eq('id', imageRecordId)
          .single();
        
        if (error) throw error;
        
        if (imageRecord?.status === 'completed' && imageRecord.image_url) {
          // Image is ready - update the message
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `✅ Image generated!\n\nPrompt: "${prompt}"`,
                  imageUrl: imageRecord.image_url,
                  isGenerating: false
                }
              : m
          ));
          return;
        } else if (imageRecord?.status === 'error') {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `❌ Image generation failed.\n\nPrompt: "${prompt}"\n\nError: ${imageRecord.error_message || 'Unknown error'}`,
                  isGenerating: false
                }
              : m
          ));
          return;
        }
        
        // Still processing, continue polling
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
        } else {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `⏰ Image generation is taking longer than expected.\n\nPrompt: "${prompt}"\n\nCheck your creations gallery for the result.`,
                  isGenerating: false
                }
              : m
          ));
        }
      } catch (error) {
        console.error('Error checking image status:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        }
      }
    };
    
    // Start polling after a short delay
    setTimeout(checkStatus, 3000);
  };
  
  // Poll for video generation result
  const pollForVideoResult = async (messageId: string, videoRecordId: string, prompt: string) => {
    const maxAttempts = 120; // 4 minutes max (videos take longer)
    let attempts = 0;
    
    const checkStatus = async () => {
      attempts++;
      
      try {
        const { data: videoRecord, error } = await supabase
          .from('ai_videos')
          .select('status, video_url, error_message')
          .eq('id', videoRecordId)
          .single();
        
        if (error) throw error;
        
        if (videoRecord?.status === 'completed' && videoRecord.video_url) {
          // Video is ready - update the message
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `✅ Video generated!\n\nPrompt: "${prompt}"`,
                  videoUrl: videoRecord.video_url,
                  isGenerating: false
                }
              : m
          ));
          return;
        } else if (videoRecord?.status === 'error' || videoRecord?.status === 'failed') {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `❌ Video generation failed.\n\nPrompt: "${prompt}"\n\nError: ${videoRecord.error_message || 'Unknown error'}`,
                  isGenerating: false
                }
              : m
          ));
          return;
        }
        
        // Still processing, continue polling
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
        } else {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `⏰ Video generation is taking longer than expected.\n\nPrompt: "${prompt}"\n\nCheck your creations gallery for the result.`,
                  isGenerating: false
                }
              : m
          ));
        }
      } catch (error) {
        console.error('Error checking video status:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        }
      }
    };
    
    // Start polling after a short delay (videos take longer to start)
    setTimeout(checkStatus, 5000);
  };

  // Poll for audio generation result
  const pollForAudioResult = async (messageId: string, audioRecordId: string, text: string, voiceName: string) => {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;
    
    const checkStatus = async () => {
      attempts++;
      
      try {
        const { data: audioRecord, error } = await supabase
          .from('user_voices')
          .select('status, url')
          .eq('id', audioRecordId)
          .single();
        
        if (error) throw error;
        
        if (audioRecord?.status === 'completed' && audioRecord.url) {
          // Audio is ready - update the message
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `✅ Audio generated!\n\nVoice: ${voiceName}\n\nText: "${text}"`,
                  audioUrl: audioRecord.url,
                  isGenerating: false
                }
              : m
          ));
          return;
        } else if (audioRecord?.status === 'error') {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `❌ Audio generation failed.\n\nText: "${text}"\n\nPlease try again.`,
                  isGenerating: false
                }
              : m
          ));
          return;
        }
        
        // Still processing, continue polling
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
        } else {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { 
                  ...m, 
                  content: `⏰ Audio generation is taking longer than expected.\n\nText: "${text}"\n\nCheck your voiceovers for the result.`,
                  isGenerating: false
                }
              : m
          ));
        }
      } catch (error) {
        console.error('Error checking audio status:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        }
      }
    };
    
    // Start polling after a short delay
    setTimeout(checkStatus, 2000);
  };

  const handleSendWithTool = async () => {
    if (!message.trim() || isLoading) return;
    
    if (selectedTool && onToolAction) {
      // Execute tool action
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: `[${AIVA_TOOLS.find(t => t.id === selectedTool)?.label}] ${message.trim()}`
      };
      setMessages(prev => [...prev, userMessage]);
      await saveMessage('user', userMessage.content);
      
      executeToolAction(message.trim());
      setMessage('');
      return;
    }
    
    // Regular chat
    await handleSend();
  };

  // Calculate left position based on sidebar state
  const leftPosition = sidebarCollapsed ? 'left-16' : 'left-64';

  return (
    <div 
      className={`fixed ${leftPosition} top-0 h-full bg-background border-r border-border shadow-xl z-40 flex flex-col transition-all duration-300 ${
        isOpen 
          ? (isExpanded ? 'w-[600px] translate-x-0' : 'w-[400px] translate-x-0')
          : 'w-0 -translate-x-full'
      }`}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-muted transition border border-border bg-muted/50">
                      <MessageSquare size={18} className="text-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleClearChat}
                      className="p-2 rounded-lg hover:bg-muted transition"
                    >
                      <Trash2 size={18} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear Chat</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-muted transition">
                      <SlidersHorizontal size={18} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-2 rounded-lg hover:bg-muted transition"
                    >
                      {isExpanded ? (
                        <Minimize2 size={18} className="text-muted-foreground" />
                      ) : (
                        <Maximize2 size={18} className="text-muted-foreground" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isExpanded ? 'Minimize' : 'Expand'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="flex flex-col items-center text-center max-w-sm">
                  <div className="flex items-center gap-1 mb-4">
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">How Can I Help?</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    I'm here to help you with {appConfig.title}
                  </p>
                  
                  {/* Suggestions */}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2 justify-center">
                      <Sparkles size={12} />
                      Suggestions
                    </p>
                    {appConfig.suggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-brand-green/30 transition text-sm text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-brand-green text-white rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        {msg.content ? (
                          msg.role === 'assistant' 
                            ? renderMarkdown(msg.content)
                            : <span className="text-sm">{msg.content}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-sm opacity-70">Thinking...</span>
                          </div>
                        )}
                        
                        {/* Show generating spinner for image/video/audio */}
                        {msg.isGenerating && (
                          <div className="mt-3 flex items-center gap-2 text-sm opacity-70">
                            <Loader2 size={16} className="animate-spin text-brand-green" />
                            <span>Generating...</span>
                          </div>
                        )}
                        
                        {/* Show generated image */}
                        {msg.imageUrl && (
                          <div className="mt-3">
                            <img 
                              src={msg.imageUrl} 
                              alt="Generated image"
                              className="rounded-lg max-w-full h-auto shadow-md cursor-pointer hover:opacity-90 transition"
                              onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                          </div>
                        )}
                        
                        {/* Show generated video */}
                        {msg.videoUrl && (
                          <div className="mt-3">
                            <video 
                              src={msg.videoUrl} 
                              controls
                              className="rounded-lg max-w-full h-auto shadow-md"
                              style={{ maxHeight: '300px' }}
                            />
                          </div>
                        )}
                        
                        {/* Show generated audio */}
                        {msg.audioUrl && (
                          <div className="mt-3">
                            <audio 
                              src={msg.audioUrl} 
                              controls
                              className="w-full rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-border">
            {/* Selected Tool Badge */}
            {selectedTool && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs bg-brand-green/20 text-brand-green px-2 py-1 rounded-full flex items-center gap-1">
                  {(() => {
                    const tool = AIVA_TOOLS.find(t => t.id === selectedTool);
                    const Icon = tool?.icon || Image;
                    return (
                      <>
                        <Icon size={12} />
                        {tool?.label}
                      </>
                    );
                  })()}
                  <button 
                    onClick={() => setSelectedTool(null)}
                    className="ml-1 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </span>
                
                {/* Voice selector for audio tool */}
                {selectedTool === 'audio' && (
                  <Select 
                    value={selectedVoice.id} 
                    onValueChange={(value) => {
                      const voice = VOICE_OPTIONS.find(v => v.id === value);
                      if (voice) setSelectedVoice(voice);
                    }}
                  >
                    <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs border-border bg-muted/50">
                      <Volume2 size={12} className="mr-1 text-orange-500" />
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {VOICE_OPTIONS.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id} className="text-xs">
                          {voice.name} ({voice.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            
            <div className={`border-2 ${selectedTool ? 'border-brand-green' : 'border-border'} rounded-xl p-3`}>
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendWithTool();
                  }
                }}
                placeholder={selectedTool === 'audio'
                  ? "Enter the text you want to convert to speech..."
                  : selectedTool 
                    ? `Describe what you want to ${AIVA_TOOLS.find(t => t.id === selectedTool)?.label.toLowerCase()}...`
                    : "Ask AIVA Anything"
                }
                disabled={isLoading}
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground mb-3 disabled:opacity-50"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Popover open={showToolsMenu} onOpenChange={setShowToolsMenu}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted hover:border-brand-green/50 transition text-sm text-muted-foreground">
                        <SlidersHorizontal size={14} />
                        Tools
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start" side="top">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground px-2 py-1 font-medium">Generation Tools</p>
                        {AIVA_TOOLS.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <button
                              key={tool.id}
                              onClick={() => handleToolSelect(tool.id as ToolType)}
                              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition text-left"
                            >
                              <Icon size={18} className={tool.color} />
                              <div>
                                <p className="text-sm font-medium text-foreground">{tool.label}</p>
                                <p className="text-xs text-muted-foreground">{tool.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center gap-2">
                  {isSupported && (
                    <button 
                      onClick={handleMicClick}
                      className={`p-2 rounded-lg transition ${
                        isListening 
                          ? 'bg-red-100 hover:bg-red-200' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {isListening ? (
                        <MicOff size={18} className="text-red-500 animate-pulse" />
                      ) : (
                        <Mic size={18} className="text-muted-foreground" />
                      )}
                    </button>
                  )}
                  <button 
                    onClick={handleSendWithTool}
                    disabled={!message.trim() || isLoading}
                    className={`p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedTool 
                        ? 'bg-brand-green text-white hover:bg-brand-green/90' 
                        : 'bg-brand-green/20 hover:bg-brand-green/30'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className={selectedTool ? 'text-white animate-spin' : 'text-brand-green animate-spin'} />
                    ) : (
                      <Send size={18} className={selectedTool ? 'text-white' : 'text-brand-green'} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIVASidePanel;
