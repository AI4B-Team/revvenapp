import { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VoiceAgentMessage {
  id: string;
  speaker: 'agent' | 'prospect';
  text: string;
  timestamp: string;
}

interface UseMasterCloserVoiceAgentOptions {
  agentId: string;
  onMessage?: (message: VoiceAgentMessage) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export const useMasterCloserVoiceAgent = ({
  agentId,
  onMessage,
  onStatusChange,
  onSpeakingChange
}: UseMasterCloserVoiceAgentOptions) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<VoiceAgentMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatTimestamp = () => {
    const now = new Date();
    return `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      onStatusChange?.('connected');
      setError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      onStatusChange?.('disconnected');
    },
    onMessage: (message: any) => {
      console.log('Agent message:', message);
      
      // Handle different message types
      if (message?.type === 'user_transcript') {
        const userTranscript = message?.user_transcription_event?.user_transcript;
        if (userTranscript) {
          const newMessage: VoiceAgentMessage = {
            id: Date.now().toString(),
            speaker: 'prospect',
            text: userTranscript,
            timestamp: formatTimestamp()
          };
          setMessages(prev => [...prev, newMessage]);
          onMessage?.(newMessage);
        }
      } else if (message?.type === 'agent_response') {
        const agentResponse = message?.agent_response_event?.agent_response;
        if (agentResponse) {
          const newMessage: VoiceAgentMessage = {
            id: Date.now().toString(),
            speaker: 'agent',
            text: agentResponse,
            timestamp: formatTimestamp()
          };
          setMessages(prev => [...prev, newMessage]);
          onMessage?.(newMessage);
        }
      }
    },
    onError: (error: any) => {
      console.error('ElevenLabs conversation error:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Connection error';
      setError(errorMessage);
      onStatusChange?.('error');
      toast.error('Voice agent connection error. Please try again.');
    },
  });

  // Track speaking state
  const isSpeaking = conversation.isSpeaking;
  
  // Notify parent of speaking changes
  if (onSpeakingChange) {
    // This will be called reactively when isSpeaking changes
  }

  const startConversation = useCallback(async () => {
    if (!agentId) {
      toast.error('No agent ID configured. Please set up your voice agent.');
      return;
    }

    setIsConnecting(true);
    onStatusChange?.('connecting');
    setError(null);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from edge function
      const { data, error: functionError } = await supabase.functions.invoke(
        'elevenlabs-conversation-token',
        { body: { agentId } }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to get conversation token');
      }

      if (!data?.signed_url) {
        throw new Error('No signed URL received from server');
      }

      // Start the conversation with WebSocket
      await conversation.startSession({
        signedUrl: data.signed_url,
      });

      toast.success('Voice agent connected!');
    } catch (err) {
      console.error('Failed to start conversation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      onStatusChange?.('error');
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        toast.error('Microphone access denied. Please allow microphone access to use the voice agent.');
      } else {
        toast.error(`Failed to start voice agent: ${errorMessage}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, conversation, onStatusChange]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      toast.info('Voice agent disconnected');
    } catch (err) {
      console.error('Error ending conversation:', err);
    }
  }, [conversation]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume });
    } catch (err) {
      console.error('Error setting volume:', err);
    }
  }, [conversation]);

  return {
    status: conversation.status,
    isSpeaking,
    isConnecting,
    messages,
    error,
    startConversation,
    endConversation,
    setVolume,
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
  };
};
