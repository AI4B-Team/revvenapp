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
import { BookOpen, Play, Loader2, Volume2, Gauge, Wand2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VideoGenerationCountdown } from '@/components/VideoGenerationCountdown';

const voices = [
  { id: 'af_heart', name: 'Heart', description: 'American Female' },
  { id: 'af_alloy', name: 'Alloy', description: 'American Female' },
  { id: 'af_aoede', name: 'Aoede', description: 'American Female' },
  { id: 'af_bella', name: 'Bella', description: 'American Female' },
  { id: 'af_jessica', name: 'Jessica', description: 'American Female' },
  { id: 'af_kore', name: 'Kore', description: 'American Female' },
  { id: 'af_nicole', name: 'Nicole', description: 'American Female' },
  { id: 'af_nova', name: 'Nova', description: 'American Female' },
  { id: 'af_river', name: 'River', description: 'American Female' },
  { id: 'af_sarah', name: 'Sarah', description: 'American Female' },
  { id: 'af_sky', name: 'Sky', description: 'American Female' },
  { id: 'am_adam', name: 'Adam', description: 'American Male' },
  { id: 'am_echo', name: 'Echo', description: 'American Male' },
  { id: 'am_eric', name: 'Eric', description: 'American Male' },
  { id: 'am_fenrir', name: 'Fenrir', description: 'American Male' },
  { id: 'am_liam', name: 'Liam', description: 'American Male' },
  { id: 'am_michael', name: 'Michael', description: 'American Male' },
  { id: 'am_onyx', name: 'Onyx', description: 'American Male' },
  { id: 'am_puck', name: 'Puck', description: 'American Male' },
  { id: 'am_santa', name: 'Santa', description: 'American Male' },
  { id: 'bf_alice', name: 'Alice', description: 'British Female' },
  { id: 'bf_emma', name: 'Emma', description: 'British Female' },
  { id: 'bf_isabella', name: 'Isabella', description: 'British Female' },
  { id: 'bf_lily', name: 'Lily', description: 'British Female' },
  { id: 'bm_daniel', name: 'Daniel', description: 'British Male' },
  { id: 'bm_fable', name: 'Fable', description: 'British Male' },
  { id: 'bm_george', name: 'George', description: 'British Male' },
  { id: 'bm_lewis', name: 'Lewis', description: 'British Male' },
  { id: 'zf_xiaobei', name: 'Xiaobei', description: 'Chinese Female' },
  { id: 'zf_xiaoni', name: 'Xiaoni', description: 'Chinese Female' },
  { id: 'zf_xiaoxiao', name: 'Xiaoxiao', description: 'Chinese Female' },
  { id: 'zf_xiaoyi', name: 'Xiaoyi', description: 'Chinese Female' },
  { id: 'zm_yunjian', name: 'Yunjian', description: 'Chinese Male' },
  { id: 'zm_yunxi', name: 'Yunxi', description: 'Chinese Male' },
  { id: 'zm_yunxia', name: 'Yunxia', description: 'Chinese Male' },
  { id: 'zm_yunyang', name: 'Yunyang', description: 'Chinese Male' },
  { id: 'ef_dora', name: 'Dora', description: 'Spanish Female' },
  { id: 'em_alex', name: 'Alex', description: 'Spanish Male' },
  { id: 'em_santa', name: 'Santa ES', description: 'Spanish Male' },
  { id: 'ff_siwis', name: 'Siwis', description: 'French Female' },
  { id: 'if_sara', name: 'Sara', description: 'Italian Female' },
  { id: 'im_nicola', name: 'Nicola', description: 'Italian Male' },
  { id: 'pf_dora', name: 'Dora PT', description: 'Portuguese Female' },
  { id: 'pm_alex', name: 'Alex PT', description: 'Portuguese Male' },
  { id: 'pm_santa', name: 'Santa PT', description: 'Portuguese Male' },
  { id: 'hf_alpha', name: 'Alpha', description: 'Hindi Female' },
  { id: 'hf_beta', name: 'Beta', description: 'Hindi Female' },
  { id: 'hm_omega', name: 'Omega', description: 'Hindi Male' },
  { id: 'hm_psi', name: 'Psi', description: 'Hindi Male' },
];

const AIStory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoPrompting, setIsAutoPrompting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleAutoPrompt = async () => {
    setIsAutoPrompting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-story-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: 'auto-prompt' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate prompt');
      }

      const data = await response.json();
      setPrompt(data.result);
      toast({
        title: 'Prompt generated!',
        description: 'A creative story idea has been generated for you.',
      });
    } catch (error) {
      console.error('Auto prompt error:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsAutoPrompting(false);
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'No prompt to enhance',
        description: 'Please enter a prompt first.',
        variant: 'destructive',
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-story-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: 'enhance', prompt }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance prompt');
      }

      const data = await response.json();
      setPrompt(data.result);
      toast({
        title: 'Prompt enhanced!',
        description: 'Your story prompt has been improved.',
      });
    } catch (error) {
      console.error('Enhance error:', error);
      toast({
        title: 'Enhancement failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: 'Write your story prompt to generate a video.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);

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

      const result = await response.json();
      
      if (result.videoUrl) {
        setVideoUrl(result.videoUrl);
        setIsGenerating(false);
        toast({
          title: 'Story generated!',
          description: 'Your AI story video is ready to play.',
        });
      } else if (result.status === 'processing') {
        // Video is being generated - keep showing countdown
        toast({
          title: 'Video generation started',
          description: result.message || 'Your video is being created. This may take up to 10 minutes.',
        });
        // Keep isGenerating true to show countdown
      } else {
        setIsGenerating(false);
        throw new Error('No video URL returned');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setIsGenerating(false);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleSkipCountdown = () => {
    toast({
      title: 'Generation in progress',
      description: 'Your video will appear here when ready. Feel free to continue working.',
    });
  };

  const selectedVoiceInfo = voices.find(v => v.id === selectedVoice);

  // Show countdown screen while generating
  if (isGenerating) {
    return (
      <VideoGenerationCountdown
        totalSeconds={600}
        onComplete={() => {}}
        onSkip={handleSkipCountdown}
      />
    );
  }

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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Story Prompt</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoPrompt}
                    disabled={isAutoPrompting || isEnhancing || isGenerating}
                  >
                    {isAutoPrompting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Auto Prompt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnhance}
                    disabled={isEnhancing || isAutoPrompting || isGenerating || !prompt.trim()}
                  >
                    {isEnhancing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    AI Enhance
                  </Button>
                </div>
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

            {/* Video Player */}
            {videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Story Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <video controls className="w-full rounded-lg" src={videoUrl}>
                    Your browser does not support the video element.
                  </video>
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
