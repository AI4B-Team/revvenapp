import React, { useState, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Brain,
  Target,
  Headphones,
  Bot,
  Radio,
  Hand,
  Play,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import MCTransferModal from './MCTransferModal';
import type { CallMode } from '@/pages/MasterCloser';
import { templates, type ConversationTemplate } from './MCConversationTemplates';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MCLiveCallProps {
  isActive: boolean;
  onEndCall: () => void;
  callMode: CallMode;
  selectedTemplate?: ConversationTemplate | null;
  onTemplateChange?: (template: ConversationTemplate | null) => void;
}

interface TranscriptMessage {
  id: string;
  speaker: 'you' | 'prospect' | 'ai' | 'agent';
  text: string;
  timestamp: string;
  confidence?: number;
}

interface AISuggestion {
  id: string;
  type: 'response' | 'objection' | 'question' | 'warning' | 'coach';
  text: string;
  confidence: number;
  reasoning?: string;
}

const MCLiveCall: React.FC<MCLiveCallProps> = ({ isActive, onEndCall, callMode, selectedTemplate, onTemplateChange }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [sentiment, setSentiment] = useState(75);
  const [callDuration, setCallDuration] = useState(0);
  const [coachModeEnabled, setCoachModeEnabled] = useState(true);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Generate template-specific mock conversations
  const getTemplateConversation = (template: ConversationTemplate | null | undefined): TranscriptMessage[] => {
    const speakerType: 'you' | 'agent' = callMode === 'voice-agent' ? 'agent' : 'you';
    
    if (!template) {
      return [
        { id: '1', speaker: speakerType, text: "Hey, thanks for hopping on. Really appreciate you making the time.", timestamp: '00:00', confidence: 95 },
        { id: '2', speaker: 'prospect', text: "No problem. I've only got about 15 minutes though - we're actually pretty happy with what we have.", timestamp: '00:05', confidence: 92 }
      ];
    }

    const mockConversations: Record<string, TranscriptMessage[]> = {
      'discovery-call': [
        { id: '1', speaker: speakerType, text: "Hey! Thanks for taking the time today. I'm really curious to learn more about what's going on over there.", timestamp: '00:00', confidence: 96 },
        { id: '2', speaker: 'prospect', text: "Yeah, happy to chat. We've got about 30 minutes. Been looking at some options for next quarter.", timestamp: '00:08', confidence: 94 }
      ],
      'inbound-sales': [
        { id: '1', speaker: speakerType, text: "Hey! So glad you reached out. Saw you came through the website - what got your attention?", timestamp: '00:00', confidence: 97 },
        { id: '2', speaker: 'prospect', text: "Honestly, I watched your demo and thought 'this is exactly what we need.' Our current tool has been a nightmare.", timestamp: '00:06', confidence: 95 }
      ],
      'outbound-sales': [
        { id: '1', speaker: speakerType, text: "Hey, I know you weren't expecting this call. Got 30 seconds for me to explain why I'm reaching out?", timestamp: '00:00', confidence: 93 },
        { id: '2', speaker: 'prospect', text: "Uh... I'm pretty slammed right now. What is this about?", timestamp: '00:04', confidence: 88 }
      ],
      'high-ticket-sales': [
        { id: '1', speaker: speakerType, text: "Thanks for joining. Look, I'll be real - this isn't for everyone. I want to figure out if we're even the right fit before we go further.", timestamp: '00:00', confidence: 98 },
        { id: '2', speaker: 'prospect', text: "I appreciate that honesty. I've done my homework and I'm ready to make a move. What do you need from me?", timestamp: '00:10', confidence: 96 }
      ],
      'investor-pitch': [
        { id: '1', speaker: speakerType, text: "Thanks for the meeting. We're tackling a $50 billion market that's completely broken - and we've got a unique angle.", timestamp: '00:00', confidence: 97 },
        { id: '2', speaker: 'prospect', text: "Okay, I'm listening. What do you see that the big players are missing?", timestamp: '00:08', confidence: 94 }
      ],
      'hiring-interview': [
        { id: '1', speaker: speakerType, text: "Thanks for coming in! I've gone through your background - really impressive. What made you interested in this role?", timestamp: '00:00', confidence: 95 },
        { id: '2', speaker: 'prospect', text: "I've been following your growth for a while. This role fits exactly where I want to take my career next.", timestamp: '00:07', confidence: 93 }
      ],
      'negotiation': [
        { id: '1', speaker: speakerType, text: "Alright, I've gone through everything. We're close, but there's a few things I'd like to work through before we finalize.", timestamp: '00:00', confidence: 94 },
        { id: '2', speaker: 'prospect', text: "Sure, we want to make this work too. Just know we have some hard constraints on our end.", timestamp: '00:06', confidence: 91 }
      ],
      'performance-review': [
        { id: '1', speaker: speakerType, text: "Thanks for sitting down with me. Want to have an honest conversation about how things are going and where you want to head.", timestamp: '00:00', confidence: 96 },
        { id: '2', speaker: 'prospect', text: "Yeah, I've been thinking about this a lot actually. There's some stuff I want to talk through too.", timestamp: '00:08', confidence: 92 }
      ],
      'conflict-resolution': [
        { id: '1', speaker: speakerType, text: "I appreciate you being willing to talk. I feel like there's been some miscommunication and I really want to hear your side.", timestamp: '00:00', confidence: 93 },
        { id: '2', speaker: 'prospect', text: "Yeah, I think we need to clear the air. Honestly, I've been pretty frustrated with how things went down.", timestamp: '00:07', confidence: 89 }
      ],
      'client-success': [
        { id: '1', speaker: speakerType, text: "Hey! Great to connect for our quarterly check-in. Been looking at your numbers - got some wins to celebrate and ideas to share.", timestamp: '00:00', confidence: 97 },
        { id: '2', speaker: 'prospect', text: "Awesome! Yeah, we've been really happy. There's also a few things we've been meaning to ask about.", timestamp: '00:06', confidence: 95 }
      ],
      'cold-outreach': [
        { id: '1', speaker: speakerType, text: "Hey, I know we haven't talked before. Saw you just announced some big news - congrats! Had a quick idea that might be relevant.", timestamp: '00:00', confidence: 91 },
        { id: '2', speaker: 'prospect', text: "Oh, thanks! Yeah, it's been crazy. What were you thinking?", timestamp: '00:05', confidence: 87 }
      ],
      'partnership-discussion': [
        { id: '1', speaker: speakerType, text: "Thanks for exploring this with us. I really think there's something here between our companies.", timestamp: '00:00', confidence: 95 },
        { id: '2', speaker: 'prospect', text: "Same here. We've been looking for the right partner. What does success look like from your side?", timestamp: '00:08', confidence: 94 }
      ],
      'coaching-session': [
        { id: '1', speaker: speakerType, text: "Good to see you! Before we jump in - how are you feeling about what we worked on last time?", timestamp: '00:00', confidence: 96 },
        { id: '2', speaker: 'prospect', text: "Made some progress, but that confidence thing we talked about? Still struggling with it.", timestamp: '00:06', confidence: 90 }
      ],
      'sales-demo': [
        { id: '1', speaker: speakerType, text: "Thanks for joining! Before I show you anything, I want to make sure I really understand what you're trying to solve.", timestamp: '00:00', confidence: 97 },
        { id: '2', speaker: 'prospect', text: "Yeah, so our biggest issue is our current workflow. We've tried a couple tools but nothing's stuck.", timestamp: '00:07', confidence: 93 }
      ]
    };

    return mockConversations[template.id] || [
      { id: '1', speaker: speakerType, text: "Hey, thanks for making time for this. Really looking forward to our conversation.", timestamp: '00:00', confidence: 95 },
      { id: '2', speaker: 'prospect', text: "Yeah, happy to be here. Let's get into it.", timestamp: '00:05', confidence: 93 }
    ];
  };
  
  const [transcript, setTranscript] = useState<TranscriptMessage[]>(getTemplateConversation(selectedTemplate));

  // Update transcript when template changes
  useEffect(() => {
    const newConversation = getTemplateConversation(selectedTemplate);
    setTranscript(newConversation);
    setCallDuration(0); // Reset call duration
  }, [selectedTemplate]);

  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  // Fetch AI suggestions from the edge function
  const fetchAISuggestions = useCallback(async () => {
    if (!isActive) return;
    
    setIsLoadingSuggestions(true);
    
    try {
      const transcriptText = transcript
        .map(msg => `${msg.speaker.toUpperCase()}: ${msg.text}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('master-closer-ai', {
        body: {
          transcript: transcriptText,
          template: selectedTemplate ? {
            name: selectedTemplate.name,
            objective: selectedTemplate.objective,
            keyPhases: selectedTemplate.keyPhases,
            commonObjections: selectedTemplate.commonObjections,
            recommendedTone: selectedTemplate.recommendedTone
          } : null,
          context: callMode === 'listen' ? 'User is in LISTEN mode - provide coaching tips only, not direct responses.' : null
        }
      });

      if (error) {
        console.error('Error fetching AI suggestions:', error);
        if (error.message?.includes('429')) {
          toast.error('Rate limit reached. Suggestions will refresh shortly.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add funds to continue.');
        }
        return;
      }

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        const formattedSuggestions: AISuggestion[] = data.suggestions.map((s: any, idx: number) => ({
          id: `ai-${idx}-${Date.now()}`,
          type: s.type || 'response',
          text: s.text,
          confidence: s.confidence || 90,
          reasoning: s.reasoning
        }));
        setSuggestions(formattedSuggestions);
        
        if (data.sentiment) {
          setSentiment(data.sentiment);
        }
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [transcript, selectedTemplate, callMode, isActive]);

  // Fetch suggestions when transcript changes or template changes
  useEffect(() => {
    if (isActive && transcript.length > 0) {
      const debounceTimer = setTimeout(() => {
        fetchAISuggestions();
      }, 1000); // Debounce to avoid too many API calls
      
      return () => clearTimeout(debounceTimer);
    }
  }, [transcript, selectedTemplate, isActive]);

  // Initial fetch on mount
  useEffect(() => {
    if (isActive) {
      fetchAISuggestions();
    }
  }, [isActive]);

  // Format duration helper - defined early for use in getCallPhases
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate call phases based on template
  const getCallPhases = () => {
    if (selectedTemplate?.keyPhases && selectedTemplate.keyPhases.length > 0) {
      return selectedTemplate.keyPhases.map((phase, index) => ({
        id: phase.toLowerCase().replace(/\s+/g, '-'),
        name: phase,
        status: index === 0 ? 'completed' : index === 1 ? 'active' : 'pending',
        duration: index === 0 ? '2:30' : index === 1 ? formatDuration(callDuration) : '0:00'
      }));
    }
    return [
      { id: 'intro', name: 'Introduction', status: 'completed', duration: '2:30' },
      { id: 'discovery', name: 'Discovery', status: 'active', duration: formatDuration(callDuration) },
      { id: 'solution', name: 'Solution', status: 'pending', duration: '0:00' },
      { id: 'close', name: 'Close', status: 'pending', duration: '0:00' }
    ];
  };

  const callPhases = getCallPhases();

  const getSentimentInfo = () => {
    if (sentiment >= 61) return { label: 'Engaged', color: 'emerald' };
    if (sentiment >= 31) return { label: 'Neutral', color: 'yellow' };
    return { label: 'Disengaged', color: 'red' };
  };

  const currentSentiment = getSentimentInfo();

  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive]);

  // Simulate agent speaking for voice-agent mode
  useEffect(() => {
    if (callMode === 'voice-agent' && isActive) {
      const speakingInterval = setInterval(() => {
        setIsAgentSpeaking(prev => !prev);
      }, 3000);
      return () => clearInterval(speakingInterval);
    }
  }, [callMode, isActive]);

  const handleUseSuggestion = (suggestion: AISuggestion) => {
    const newMessage: TranscriptMessage = {
      id: Date.now().toString(),
      speaker: 'you',
      text: suggestion.text,
      timestamp: formatDuration(callDuration),
      confidence: suggestion.confidence
    };
    setTranscript([...transcript, newMessage]);
  };

  const handleTakeOver = () => {
    // In real implementation, this would switch from agent to user
    console.log('Taking over from agent');
  };

  const handleHandOff = () => {
    setShowTransferModal(true);
  };

  const handleTransferComplete = (destination: any) => {
    console.log('Transferred to:', destination.name);
    // In real implementation, this would initiate the transfer
  };

  const getSentimentColorClasses = () => {
    switch (currentSentiment.color) {
      case 'emerald': return { icon: 'text-emerald-600', bar: 'bg-emerald-500' };
      case 'yellow': return { icon: 'text-yellow-600', bar: 'bg-yellow-500' };
      case 'red': return { icon: 'text-red-600', bar: 'bg-red-500' };
      default: return { icon: 'text-emerald-600', bar: 'bg-emerald-500' };
    }
  };

  const sentimentColors = getSentimentColorClasses();

  const getModeColors = () => {
    switch (callMode) {
      case 'listen': return { primary: 'blue', bg: 'bg-blue-500', light: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700' };
      case 'voice-agent': return { primary: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700' };
      default: return { primary: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700' };
    }
  };

  const modeColors = getModeColors();

  return (
    <div className="h-[calc(100vh-73px)] flex">
      {/* Left Panel - Transcript */}
      <div className="flex-1 flex flex-col bg-card">
        {/* Call Status Bar */}
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${modeColors.bg} rounded-full flex items-center justify-center`}>
                {callMode === 'listen' ? (
                  <Headphones className="w-6 h-6 text-white" />
                ) : callMode === 'voice-agent' ? (
                  <Bot className="w-6 h-6 text-white" />
                ) : (
                  <Phone className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-lg text-foreground">Sarah Johnson</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${modeColors.light} ${modeColors.text}`}>
                    {callMode === 'listen' 
                      ? '🎧 Listen Mode' 
                      : callMode === 'voice-agent' 
                        ? '🤖 Voice Agent' 
                        : '🎙️ Live Call'}
                  </span>
                  {selectedTemplate && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      📋 {selectedTemplate.name}
                    </span>
                  )}
                  {callMode === 'voice-agent' && isAgentSpeaking && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-800 animate-pulse">
                      Agent Speaking...
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">VP of Marketing • Acme Corp</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-foreground">{formatDuration(callDuration)}</div>
                <div className="text-xs text-muted-foreground">
                  {callMode === 'listen' ? 'Listening Duration' : 'Call Duration'}
                </div>
              </div>
              
              <button
                onClick={onEndCall}
                className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors text-white"
                title={callMode === 'listen' ? 'Stop Listening' : 'End Call'}
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Call Controls - Mode Specific */}
          <div className="flex items-center gap-3">
            {callMode === 'listen' ? (
              <>
                {/* Listen Mode Controls */}
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-lg">
                  <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-sm font-medium text-blue-700">Capturing Tab Audio</span>
                </div>
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    !isSpeakerOn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-sm">{isSpeakerOn ? 'Audio On' : 'Audio Off'}</span>
                </button>
                {/* Coach Mode Toggle */}
                <button
                  onClick={() => setCoachModeEnabled(!coachModeEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    coachModeEnabled ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {coachModeEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-sm">Coach Mode</span>
                </button>
              </>
            ) : callMode === 'voice-agent' ? (
              <>
                {/* Voice Agent Mode Controls */}
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-lg">
                  <Bot className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700">AI Voice Agent Active</span>
                </div>
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    !isSpeakerOn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-sm">{isSpeakerOn ? 'Audio On' : 'Audio Off'}</span>
                </button>
                {/* Take Over Button */}
                <button
                  onClick={handleTakeOver}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Hand className="w-4 h-4" />
                  <span className="text-sm font-medium">Take Over</span>
                </button>
              </>
            ) : (
              <>
                {/* Start Call Mode Controls */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    !isSpeakerOn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-sm">{isSpeakerOn ? 'Speaker On' : 'Speaker Off'}</span>
                </button>

                {/* Transfer Button */}
                <button
                  onClick={handleHandOff}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm font-medium">Transfer</span>
                </button>
              </>
            )}
            
            {/* Sentiment Indicator */}
            <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-lg">
              <Brain className={`w-5 h-5 ${sentimentColors.icon}`} />
              <div>
                <div className="text-sm font-medium text-foreground">{currentSentiment.label}</div>
                <div className="text-xs text-muted-foreground">Prospect Sentiment</div>
              </div>
              <div className="w-32 bg-muted rounded-full h-2">
                <div
                  className={`${sentimentColors.bar} h-2 rounded-full transition-all`}
                  style={{ width: `${sentiment}%` }}
                />
              </div>
              <span className="text-sm font-mono text-foreground">{sentiment}%</span>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/30">
          {transcript.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.speaker === 'you' || message.speaker === 'agent' ? 'justify-end' : ''}`}
            >
              {message.speaker !== 'you' && message.speaker !== 'agent' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">SP</span>
                </div>
              )}

              <div
                className={`max-w-2xl ${
                  message.speaker === 'you'
                    ? 'bg-emerald-100 border border-emerald-200'
                    : message.speaker === 'agent'
                    ? 'bg-purple-100 border border-purple-200'
                    : message.speaker === 'ai'
                    ? 'bg-emerald-100 border border-emerald-200'
                    : 'bg-card border border-border'
                } rounded-lg p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.speaker === 'you' ? 'You' : message.speaker === 'agent' ? 'AI Agent' : message.speaker === 'ai' ? 'AI Assistant' : 'Prospect'}
                  </span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  {message.confidence && (
                    <span className="text-xs text-muted-foreground">• {message.confidence}% confident</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground">{message.text}</p>
              </div>

              {(message.speaker === 'you' || message.speaker === 'agent') && (
                <div className={`w-8 h-8 ${message.speaker === 'agent' ? 'bg-purple-500' : 'bg-emerald-500'} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {message.speaker === 'agent' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold text-white">YO</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Live Listening Indicator */}
          <div className={`flex items-center justify-center gap-3 p-4 ${modeColors.light} ${modeColors.border} border rounded-lg`}>
            <div className="flex gap-1">
              <div className={`w-1 h-4 ${modeColors.bg} rounded-full animate-pulse`} style={{ animationDelay: '0s' }} />
              <div className={`w-1 h-4 ${modeColors.bg} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }} />
              <div className={`w-1 h-4 ${modeColors.bg} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }} />
            </div>
            <span className={`text-sm ${modeColors.text} font-medium`}>
              {callMode === 'listen' 
                ? 'AI is listening to external call and analyzing...' 
                : callMode === 'voice-agent'
                  ? 'AI Voice Agent is handling the conversation...'
                  : 'AI is listening and analyzing...'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Assistant */}
      <div className="w-[450px] border-l border-border bg-card flex flex-col">
        {/* AI Header */}
        <div className={`border-b border-border p-4 ${callMode === 'listen' ? 'bg-blue-50' : callMode === 'voice-agent' ? 'bg-purple-50' : 'bg-emerald-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${callMode === 'listen' ? 'text-blue-600' : callMode === 'voice-agent' ? 'text-purple-600' : 'text-emerald-600'}`} />
            <h3 className="font-bold text-lg text-foreground">
              {callMode === 'listen' ? 'AI Coach' : callMode === 'voice-agent' ? 'Agent Monitor' : 'AI Co-Pilot'}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {callMode === 'listen' 
              ? 'Silent coaching tips for your team' 
              : callMode === 'voice-agent'
                ? 'Monitor agent performance'
                : 'Real-time suggestions and guidance'}
          </p>
        </div>

        {/* Template Info Section - Redesigned */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Brain className="w-4 h-4 text-amber-600" />
              Call Template
            </h4>
            
            {/* Template Switcher Button */}
            <button 
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors border border-border"
            >
              <RefreshCw className="w-3 h-3" />
              Switch
            </button>
          </div>
          
          {/* Template Card */}
          {selectedTemplate ? (
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-600 text-lg border border-amber-100">
                  {selectedTemplate.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-foreground">{selectedTemplate.name}</h5>
                  <p className="text-xs text-amber-700/80 mt-0.5">{selectedTemplate.category}</p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {selectedTemplate.objective}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-muted/50 border border-dashed border-border p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted mx-auto mb-3 flex items-center justify-center">
                <Target className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No Template Selected</p>
              <p className="text-xs text-muted-foreground/70">
                Select a template to get guided suggestions
              </p>
            </div>
          )}
        </div>

        {/* Call Phase Tracker */}
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
            <Target className="w-4 h-4" />
            Call Structure
          </h4>
          <div className="space-y-2">
            {callPhases.map((phase) => (
              <div
                key={phase.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  phase.status === 'active'
                    ? `${modeColors.light} ${modeColors.border} border`
                    : phase.status === 'completed'
                    ? 'bg-emerald-100 border border-emerald-200'
                    : 'bg-muted border border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  {phase.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : phase.status === 'active' ? (
                    <Clock className={`w-4 h-4 ${callMode === 'listen' ? 'text-blue-600' : callMode === 'voice-agent' ? 'text-purple-600' : 'text-emerald-600'} animate-pulse`} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">{phase.name}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{phase.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Zap className="w-4 h-4 text-yellow-500" />
              {callMode === 'listen' ? 'Coaching Tips' : 'Smart Suggestions'}
              {isLoadingSuggestions && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </h4>
            <button
              onClick={fetchAISuggestions}
              disabled={isLoadingSuggestions}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {suggestions.length === 0 && !isLoadingSuggestions && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">AI is analyzing the conversation...</p>
            </div>
          )}

          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border ${
                suggestion.type === 'coach'
                  ? 'bg-blue-50 border-blue-200'
                  : suggestion.type === 'response'
                  ? 'bg-emerald-50 border-emerald-200'
                  : suggestion.type === 'objection'
                  ? 'bg-yellow-50 border-yellow-200'
                  : suggestion.type === 'question'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {suggestion.type === 'coach' && <Eye className="w-4 h-4 text-blue-600" />}
                  {suggestion.type === 'response' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
                  {suggestion.type === 'objection' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                  {suggestion.type === 'question' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    suggestion.type === 'coach'
                      ? 'bg-blue-100 text-blue-700'
                      : suggestion.type === 'response'
                      ? 'bg-emerald-100 text-emerald-700'
                      : suggestion.type === 'objection'
                      ? 'bg-yellow-100 text-yellow-700'
                      : suggestion.type === 'question'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {suggestion.type === 'coach' ? 'Coach Tip' : suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{suggestion.confidence}%</span>
              </div>

              <p className="text-sm mb-3 leading-relaxed text-foreground">{suggestion.text}</p>

              {suggestion.reasoning && (
                <p className="text-xs text-muted-foreground mb-3 italic">
                  💡 {suggestion.reasoning}
                </p>
              )}

              {callMode !== 'listen' && suggestion.type === 'response' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUseSuggestion(suggestion)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 ${modeColors.bg} hover:opacity-90 rounded-lg text-sm font-medium transition-all text-white`}
                  >
                    <Play className="w-3 h-3" />
                    Use This
                  </button>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-emerald-100 rounded-lg transition-colors">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="border-t border-border p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">3</div>
              <div className="text-xs text-muted-foreground">Objections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">85%</div>
              <div className="text-xs text-muted-foreground">Talk Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">2</div>
              <div className="text-xs text-muted-foreground">Next Steps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <MCTransferModal 
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransferComplete}
      />

      {/* Switch Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-600" />
              Switch Template
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {selectedTemplate && (
              <button
                onClick={() => {
                  onTemplateChange?.(null);
                  setShowTemplateModal(false);
                }}
                className="w-full mb-4 flex items-center gap-2 p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="font-medium">Clear Current Template</span>
              </button>
            )}
            
            <ScrollArea className="h-[50vh]">
              <div className="grid grid-cols-2 gap-3 pr-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onTemplateChange?.(template);
                      setShowTemplateModal(false);
                      toast.success(`Switched to ${template.name}`);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md'
                        : 'border-border bg-card hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                        selectedTemplate?.id === template.id
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground truncate">{template.name}</h4>
                          {selectedTemplate?.id === template.id && (
                            <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{template.category}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{template.objective}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MCLiveCall;
