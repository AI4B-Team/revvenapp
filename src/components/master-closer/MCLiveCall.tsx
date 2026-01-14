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
  Target
} from 'lucide-react';

interface MCLiveCallProps {
  isActive: boolean;
  onEndCall: () => void;
}

interface TranscriptMessage {
  id: string;
  speaker: 'you' | 'prospect' | 'ai';
  text: string;
  timestamp: string;
  confidence?: number;
}

interface AISuggestion {
  id: string;
  type: 'response' | 'objection' | 'question' | 'warning';
  text: string;
  confidence: number;
  reasoning?: string;
}

const MCLiveCall: React.FC<MCLiveCallProps> = ({ isActive, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [sentiment, setSentiment] = useState(75);
  const [callDuration, setCallDuration] = useState(0);
  
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    {
      id: '1',
      speaker: 'you',
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

  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      type: 'response',
      text: "I completely understand Sarah. Many of our happiest clients said the same thing initially. What I've found is that even when things are working well, there's often 1-2 pain points lurking beneath the surface. Mind if I ask you just 2-3 quick questions to see if we're even a fit?",
      confidence: 94,
      reasoning: 'Acknowledges objection, builds credibility, asks permission to continue'
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
  ]);

  const callPhases = [
    { id: 'intro', name: 'Introduction', status: 'completed', duration: '2:30' },
    { id: 'discovery', name: 'Discovery', status: 'active', duration: '5:45' },
    { id: 'solution', name: 'Solution', status: 'pending', duration: '0:00' },
    { id: 'close', name: 'Close', status: 'pending', duration: '0:00' }
  ];

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const getSentimentColorClasses = () => {
    switch (currentSentiment.color) {
      case 'emerald': return { icon: 'text-emerald-600', bar: 'bg-emerald-500' };
      case 'yellow': return { icon: 'text-yellow-600', bar: 'bg-yellow-500' };
      case 'red': return { icon: 'text-red-600', bar: 'bg-red-500' };
      default: return { icon: 'text-emerald-600', bar: 'bg-emerald-500' };
    }
  };

  const sentimentColors = getSentimentColorClasses();

  return (
    <div className="h-[calc(100vh-73px)] flex">
      {/* Left Panel - Transcript */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Call Status Bar */}
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Sarah Johnson</h2>
                <p className="text-sm text-gray-500">VP of Marketing • Acme Corp</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-gray-900">{formatDuration(callDuration)}</div>
                <div className="text-xs text-gray-500">Call Duration</div>
              </div>
              
              <button
                onClick={onEndCall}
                className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors text-white"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                !isSpeakerOn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-sm">{isSpeakerOn ? 'Speaker On' : 'Speaker Off'}</span>
            </button>

            {/* Sentiment Indicator */}
            <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <Brain className={`w-5 h-5 ${sentimentColors.icon}`} />
              <div>
                <div className="text-sm font-medium text-gray-900">{currentSentiment.label}</div>
                <div className="text-xs text-gray-500">Prospect Sentiment</div>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`${sentimentColors.bar} h-2 rounded-full transition-all`}
                  style={{ width: `${sentiment}%` }}
                />
              </div>
              <span className="text-sm font-mono text-gray-700">{sentiment}%</span>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {transcript.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.speaker === 'you' ? 'justify-end' : ''}`}
            >
              {message.speaker !== 'you' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">SP</span>
                </div>
              )}

              <div
                className={`max-w-2xl ${
                  message.speaker === 'you'
                    ? 'bg-purple-100 border border-purple-200'
                    : message.speaker === 'ai'
                    ? 'bg-emerald-100 border border-emerald-200'
                    : 'bg-white border border-gray-200'
                } rounded-lg p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    {message.speaker === 'you' ? 'You' : message.speaker === 'ai' ? 'AI Assistant' : 'Prospect'}
                  </span>
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                  {message.confidence && (
                    <span className="text-xs text-gray-400">• {message.confidence}% confident</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-gray-800">{message.text}</p>
              </div>

              {message.speaker === 'you' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">YO</span>
                </div>
              )}
            </div>
          ))}

          {/* Live Listening Indicator */}
          <div className="flex items-center justify-center gap-3 p-4 bg-emerald-100 border border-emerald-200 rounded-lg">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
              <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm text-emerald-700 font-medium">AI is listening and analyzing...</span>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Assistant */}
      <div className="w-[450px] border-l border-gray-200 bg-white flex flex-col">
        {/* AI Header */}
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-purple-100 to-pink-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-lg text-gray-900">AI Co-Pilot</h3>
          </div>
          <p className="text-xs text-gray-600">Real-time suggestions and guidance</p>
        </div>

        {/* Call Phase Tracker */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900">
            <Target className="w-4 h-4" />
            Call Structure
          </h4>
          <div className="space-y-2">
            {callPhases.map((phase) => (
              <div
                key={phase.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  phase.status === 'active'
                    ? 'bg-purple-100 border border-purple-200'
                    : phase.status === 'completed'
                    ? 'bg-emerald-100 border border-emerald-200'
                    : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {phase.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : phase.status === 'active' ? (
                    <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-800">{phase.name}</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">{phase.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900">
            <Zap className="w-4 h-4 text-yellow-500" />
            Smart Suggestions
          </h4>

          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border ${
                suggestion.type === 'response'
                  ? 'bg-purple-50 border-purple-200'
                  : suggestion.type === 'objection'
                  ? 'bg-yellow-50 border-yellow-200'
                  : suggestion.type === 'question'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {suggestion.type === 'response' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                  {suggestion.type === 'objection' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                  {suggestion.type === 'question' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                  {suggestion.type === 'warning' && <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span className="text-xs font-medium uppercase text-gray-700">
                    {suggestion.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-mono text-emerald-600">{suggestion.confidence}%</span>
                </div>
              </div>

              <p className="text-sm mb-3 leading-relaxed text-gray-800">{suggestion.text}</p>

              {suggestion.reasoning && (
                <p className="text-xs text-gray-500 mb-3 italic">💡 {suggestion.reasoning}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors text-white"
                >
                  <Copy className="w-3 h-3" />
                  Use This
                </button>
                <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                  <ThumbsUp className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                  <ThumbsDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors text-gray-700">
              🎯 Handle Objection
            </button>
            <button className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors text-gray-700">
              ❓ Ask Question
            </button>
            <button className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors text-gray-700">
              📝 Summarize
            </button>
            <button className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors text-gray-700">
              🚀 Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCLiveCall;
