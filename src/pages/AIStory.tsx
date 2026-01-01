import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Play, Loader2, Volume2, Gauge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const voices = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm & friendly' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Deep & authoritative' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Soft & gentle' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Young & energetic' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Clear & professional' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Calm & soothing' },
];

const AIStory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: 'Write your story prompt to generate audio.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-story`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            voiceId: selectedVoice,
            speed: voiceSpeed[0],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      toast({
        title: 'Story generated!',
        description: 'Your AI story audio is ready to play.',
      });
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedVoiceInfo = voices.find(v => v.id === selectedVoice);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-tool-purple flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Story</h1>
                <p className="text-muted-foreground">Generate AI-powered story narrations</p>
              </div>
            </div>

            {/* Prompt Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Story Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your story prompt... (e.g., 'Tell me a bedtime story about a brave little fox who discovers a magical forest')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </CardContent>
            </Card>

            {/* Voice Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voice Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{voice.name}</span>
                            <span className="text-xs text-muted-foreground">{voice.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVoiceInfo && (
                    <p className="text-sm text-muted-foreground">
                      Selected: <span className="font-medium">{selectedVoiceInfo.name}</span> - {selectedVoiceInfo.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Voice Speed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Voice Speed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Speed: {voiceSpeed[0].toFixed(1)}x</Label>
                      <span className="text-xs text-muted-foreground">
                        {voiceSpeed[0] < 0.9 ? 'Slower' : voiceSpeed[0] > 1.1 ? 'Faster' : 'Normal'}
                      </span>
                    </div>
                    <Slider
                      value={voiceSpeed}
                      onValueChange={setVoiceSpeed}
                      min={0.7}
                      max={1.2}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.7x</span>
                      <span>1.0x</span>
                      <span>1.2x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Story...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Generate Story
                </>
              )}
            </Button>

            {/* Audio Player */}
            {audioUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Story</CardTitle>
                </CardHeader>
                <CardContent>
                  <audio controls className="w-full" src={audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIStory;
