import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import MCTransferModal from './MCTransferModal';
import type { CallMode } from '@/pages/MasterCloser';
import { templates, type ConversationTemplate } from './MCConversationTemplates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    {
      id: '1',
      speaker: callMode === 'voice-agent' ? 'agent' : 'you',
      text: 'Hi Sarah, thanks for taking the time to chat today!',
      timestamp: '00:00',
      confidence: 95
    },
    {
      id: '2',
      speaker: 'prospect',
      text: "Sure, but I only have about 15 minutes. We're pretty happy with our current solution to be honest.",
      timestamp: '00:05',
      confidence: 92
    }
  ]);

  // Generate suggestions based on template
  const getTemplateSuggestions = (): AISuggestion[] => {
    if (!selectedTemplate) {
      return [
        {
          id: '1',
          type: callMode === 'listen' ? 'coach' : 'response',
          text: callMode === 'listen' 
            ? "💡 They mentioned 'happy with current solution' - this is a soft objection. Suggest probing for hidden pain points."
            : "I completely understand. Many of our happiest clients said the same thing initially. What I've found is that even when things are working well, there's often 1-2 pain points lurking beneath the surface. Mind if I ask you just 2-3 quick questions to see if we're even a fit?",
          confidence: 94,
          reasoning: callMode === 'listen' ? 'Coaching tip for sales rep' : 'Acknowledges objection, builds credibility, asks permission to continue'
        },
        {
          id: '2',
          type: 'objection',
          text: 'Handle "Happy with current solution" → Use permission-based discovery',
          confidence: 89,
          reasoning: 'Common early objection, needs soft approach'
        },
        {
          id: '3',
          type: 'question',
          text: "What made you agree to this call in the first place?",
          confidence: 87,
          reasoning: 'Uncovers hidden pain points'
        }
      ];
    }

    // Template-specific suggestions
    const templateSuggestions: Record<string, AISuggestion[]> = {
      'discovery-call': [
        { id: '1', type: 'response', text: `Let's start with understanding your current situation. ${selectedTemplate.keyPhases[1] ? `We're in the ${selectedTemplate.keyPhases[1]} phase` : ''}. What challenges are you facing right now?`, confidence: 95, reasoning: 'SPIN methodology - Situation question' },
        { id: '2', type: 'question', text: "What's the impact of this problem on your team or business?", confidence: 92, reasoning: 'Implication question to deepen pain' },
        { id: '3', type: 'objection', text: `Common objection: "${selectedTemplate.commonObjections[0]}" → Acknowledge and probe deeper`, confidence: 88, reasoning: 'Prepared for likely resistance' }
      ],
      'inbound-sales': [
        { id: '1', type: 'response', text: "Thanks for reaching out! I'm excited to learn more about what brought you to us. What specific problem are you trying to solve?", confidence: 96, reasoning: 'Warm lead - acknowledge interest first' },
        { id: '2', type: 'question', text: "What would success look like for you in 90 days?", confidence: 91, reasoning: 'Future-pacing to understand desired outcome' },
        { id: '3', type: 'objection', text: `Handle "${selectedTemplate.commonObjections[1]}" → Show unique differentiators`, confidence: 87, reasoning: 'They\'re comparing - stand out' }
      ],
      'outbound-sales': [
        { id: '1', type: 'response', text: "I know you weren't expecting my call, so I'll be brief. I'm reaching out because companies like yours are seeing [specific result]. Would it be worth a quick chat?", confidence: 94, reasoning: 'Permission-based pattern interrupt' },
        { id: '2', type: 'question', text: "Before I take more of your time, can I ask what your biggest priority is this quarter?", confidence: 90, reasoning: 'Quick qualification' },
        { id: '3', type: 'objection', text: `When they say "${selectedTemplate.commonObjections[0]}" → Earn 30 more seconds`, confidence: 85, reasoning: 'Expected resistance - stay confident' }
      ],
      'high-ticket-sales': [
        { id: '1', type: 'response', text: "This isn't for everyone, and that's by design. Let me understand if you're the right fit for what we offer. Tell me about your vision for the next 12 months.", confidence: 97, reasoning: 'Premium positioning - qualify them' },
        { id: '2', type: 'question', text: "What would it be worth to you to solve this problem completely?", confidence: 93, reasoning: 'Anchor to transformation value' },
        { id: '3', type: 'objection', text: `"${selectedTemplate.commonObjections[0]}" → Reframe as investment with ROI`, confidence: 91, reasoning: 'Price objection = value not established' }
      ],
      'investor-pitch': [
        { id: '1', type: 'response', text: "We're solving a $X billion problem that affects Y million people. Our unique insight is [key differentiator].", confidence: 96, reasoning: 'Lead with market size and insight' },
        { id: '2', type: 'question', text: "What's your typical check size for companies at our stage?", confidence: 88, reasoning: 'Qualify investor fit' },
        { id: '3', type: 'objection', text: `Address "${selectedTemplate.commonObjections[0]}" with TAM/SAM/SOM analysis`, confidence: 90, reasoning: 'Back claims with data' }
      ],
      'hiring-interview': [
        { id: '1', type: 'response', text: "Tell me about a time when you faced a significant challenge in your role. How did you handle it?", confidence: 94, reasoning: 'Behavioral interview - past behavior predicts future' },
        { id: '2', type: 'question', text: "What would make this the best career move you've ever made?", confidence: 91, reasoning: 'Understand their motivations' },
        { id: '3', type: 'objection', text: `If they raise "${selectedTemplate.commonObjections[0]}" → Discuss total compensation and growth`, confidence: 87, reasoning: 'Sell the opportunity' }
      ],
      'negotiation': [
        { id: '1', type: 'response', text: "I appreciate your position. Help me understand what's most important to you in this agreement.", confidence: 95, reasoning: 'Understand their priorities first' },
        { id: '2', type: 'question', text: "If we can meet you on [X], would you be ready to move forward today?", confidence: 92, reasoning: 'Conditional close to test commitment' },
        { id: '3', type: 'objection', text: `Counter "${selectedTemplate.commonObjections[0]}" with value justification`, confidence: 89, reasoning: 'Hold your ground with confidence' }
      ]
    };

    return templateSuggestions[selectedTemplate.id] || [
      { id: '1', type: 'response', text: `Based on the ${selectedTemplate.name} template, focus on: ${selectedTemplate.objective}`, confidence: 93, reasoning: `Following ${selectedTemplate.recommendedTone} approach` },
      { id: '2', type: 'question', text: `Key phase: ${selectedTemplate.keyPhases[0]} - Start by building rapport`, confidence: 90, reasoning: 'Template-guided structure' },
      { id: '3', type: 'objection', text: `Prepare for: "${selectedTemplate.commonObjections[0]}"`, confidence: 87, reasoning: 'Anticipated objection from template' }
    ];
  };

  const [suggestions, setSuggestions] = useState<AISuggestion[]>(getTemplateSuggestions());

  // Update suggestions when template changes
  useEffect(() => {
    setSuggestions(getTemplateSuggestions());
  }, [selectedTemplate, callMode]);

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

        {/* Template Info Section */}
        <div className="p-4 border-b border-border bg-amber-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {selectedTemplate ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{selectedTemplate.name}</h4>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.objective}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">No Template</h4>
                    <p className="text-xs text-muted-foreground">Select a conversation template</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Template Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors">
                  <RefreshCw className="w-3 h-3" />
                  Switch
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-80">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Template</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {selectedTemplate && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onTemplateChange?.(null)}
                        className="flex items-center gap-2 text-red-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Clear Template</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {templates.map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => onTemplateChange?.(template)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        selectedTemplate?.id === template.id ? 'bg-amber-50' : ''
                      }`}
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-amber-100 text-amber-600 flex-shrink-0">
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{template.category}</p>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {selectedTemplate && (
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Phases: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTemplate.keyPhases.map((phase, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
                      {phase}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Tone: </span>
                <span className="text-xs text-foreground">{selectedTemplate.recommendedTone}</span>
              </div>
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
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
            <Zap className="w-4 h-4 text-yellow-500" />
            {callMode === 'listen' ? 'Coaching Tips' : 'Smart Suggestions'}
          </h4>

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
    </div>
  );
};

export default MCLiveCall;
