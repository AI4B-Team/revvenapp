import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Search, Filter, Clock, Calendar, Star, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface CallRecording {
  id: string;
  contact: string;
  company: string;
  date: string;
  duration: string;
  outcome: 'won' | 'lost' | 'pending';
  rating: number;
  hasTranscript: boolean;
}

const MCCallPlayback = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [selectedRecording, setSelectedRecording] = useState<CallRecording | null>(null);

  const recordings: CallRecording[] = [
    { id: '1', contact: 'Sarah Johnson', company: 'TechCorp', date: 'Today, 2:30 PM', duration: '24:35', outcome: 'won', rating: 5, hasTranscript: true },
    { id: '2', contact: 'Mike Chen', company: 'StartupXYZ', date: 'Today, 11:00 AM', duration: '18:42', outcome: 'pending', rating: 4, hasTranscript: true },
    { id: '3', contact: 'Lisa Park', company: 'EnterpriseCo', date: 'Yesterday', duration: '32:18', outcome: 'won', rating: 5, hasTranscript: true },
    { id: '4', contact: 'James Wilson', company: 'GlobalTech', date: 'Yesterday', duration: '15:22', outcome: 'lost', rating: 3, hasTranscript: true },
    { id: '5', contact: 'Emma Davis', company: 'InnovateCo', date: '2 days ago', duration: '28:55', outcome: 'pending', rating: 4, hasTranscript: false },
  ];

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'won': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'lost': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Call Playback</h1>
          <p className="text-muted-foreground">Review and analyze your recorded calls</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Recordings', value: '156', icon: Play },
          { label: 'Total Duration', value: '48h 23m', icon: Clock },
          { label: 'This Week', value: '12', icon: Calendar },
          { label: 'Avg Rating', value: '4.2', icon: Star },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recordings List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {recordings.map((recording) => (
              <div 
                key={recording.id}
                onClick={() => setSelectedRecording(recording)}
                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                  selectedRecording?.id === recording.id ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecording(recording);
                        setIsPlaying(true);
                      }}
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{recording.contact}</h3>
                        <span className="text-sm text-muted-foreground">• {recording.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{recording.date}</span>
                        <span>•</span>
                        <span>{recording.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < recording.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} 
                        />
                      ))}
                    </div>
                    <Badge className={getOutcomeColor(recording.outcome)}>
                      {recording.outcome.charAt(0).toUpperCase() + recording.outcome.slice(1)}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Panel */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 className="font-semibold text-foreground">Now Playing</h2>
          
          {selectedRecording ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground">{selectedRecording.contact}</h3>
                <p className="text-sm text-muted-foreground">{selectedRecording.company}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setCurrentTime(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(Math.floor((currentTime / 100) * 1475))}</span>
                  <span>{selectedRecording.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon">
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button 
                  size="icon"
                  className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={volume}
                  max={100}
                  step={1}
                  onValueChange={setVolume}
                  className="flex-1"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  View Transcript
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a recording to play</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCCallPlayback;
