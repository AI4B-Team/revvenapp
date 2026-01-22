import React, { useState } from 'react';
import { Mic, MicOff, Download, Copy, Search, Clock, User, Bot, Pause, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptSegment {
  id: string;
  speaker: 'user' | 'prospect';
  text: string;
  timestamp: string;
  confidence: number;
}

const MCLiveTranscribe = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const transcriptSegments: TranscriptSegment[] = [
    { id: '1', speaker: 'user', text: "Hi Sarah, thanks for taking the time to speak with me today. How are you doing?", timestamp: '0:00', confidence: 98 },
    { id: '2', speaker: 'prospect', text: "I'm doing well, thank you! I've been looking forward to this call. We've heard great things about your solution.", timestamp: '0:08', confidence: 95 },
    { id: '3', speaker: 'user', text: "That's wonderful to hear! Before we dive in, could you tell me a bit about what prompted you to reach out to us?", timestamp: '0:18', confidence: 97 },
    { id: '4', speaker: 'prospect', text: "Sure. We've been struggling with our current sales process. Our team spends too much time on administrative tasks and not enough time actually selling.", timestamp: '0:28', confidence: 94 },
    { id: '5', speaker: 'user', text: "I completely understand. Many of our clients faced similar challenges before implementing our solution. What would you say is the biggest pain point for your team right now?", timestamp: '0:45', confidence: 96 },
    { id: '6', speaker: 'prospect', text: "Honestly, it's the follow-ups. We're missing opportunities because we can't keep track of all the conversations and next steps.", timestamp: '1:02', confidence: 93 },
    { id: '7', speaker: 'user', text: "That's a really common challenge. Our AI-powered follow-up system was designed specifically to solve that problem. It automatically tracks every conversation and suggests the optimal next action.", timestamp: '1:18', confidence: 98 },
  ];

  const getSpeakerColor = (speaker: string) => {
    return speaker === 'user' 
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const getSpeakerIcon = (speaker: string) => {
    return speaker === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />;
  };

  const copyToClipboard = () => {
    const fullTranscript = transcriptSegments
      .map(s => `[${s.timestamp}] ${s.speaker === 'user' ? 'You' : 'Prospect'}: ${s.text}`)
      .join('\n');
    navigator.clipboard.writeText(fullTranscript);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Live Transcribe</h1>
            {isRecording && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Real-time speech-to-text transcription</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              size="lg"
              onClick={() => setIsRecording(!isRecording)}
              className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
            >
              {isRecording ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Recording
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume Recording
                </>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-lg font-medium text-foreground">12:34</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">847</p>
              <p className="text-xs text-muted-foreground">Words</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">96%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">2</p>
              <p className="text-xs text-muted-foreground">Speakers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search in transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Transcript */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <ScrollArea className="h-[500px]">
          <div className="p-6 space-y-4">
            {transcriptSegments.map((segment) => (
              <div key={segment.id} className="flex gap-4">
                <div className="flex-shrink-0 pt-1">
                  <span className="text-xs text-muted-foreground font-mono">{segment.timestamp}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSpeakerColor(segment.speaker)}>
                      {getSpeakerIcon(segment.speaker)}
                      <span className="ml-1">{segment.speaker === 'user' ? 'You' : 'Prospect'}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">{segment.confidence}% confidence</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{segment.text}</p>
                </div>
              </div>
            ))}
            
            {isRecording && (
              <div className="flex gap-4 animate-pulse">
                <div className="flex-shrink-0 pt-1">
                  <span className="text-xs text-muted-foreground font-mono">...</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">Listening...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'You', value: '45%', sublabel: 'Talk time' },
          { label: 'Prospect', value: '55%', sublabel: 'Talk time' },
          { label: 'Avg Segment', value: '12s', sublabel: 'Duration' },
          { label: 'Pace', value: '142', sublabel: 'Words/min' },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCLiveTranscribe;
