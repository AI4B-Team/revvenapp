import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Play, Loader2, Volume2, Gauge, Wand2, Sparkles, Download, Clock, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const voices = [
  { id: 'af_heart', name: 'Heart', description: 'American Female' },
  { id: 'af_alloy', name: 'Alloy', description: 'American Female' },
  { id: 'af_bella', name: 'Bella', description: 'American Female' },
  { id: 'af_jessica', name: 'Jessica', description: 'American Female' },
  { id: 'af_nova', name: 'Nova', description: 'American Female' },
  { id: 'am_adam', name: 'Adam', description: 'American Male' },
  { id: 'am_eric', name: 'Eric', description: 'American Male' },
  { id: 'am_michael', name: 'Michael', description: 'American Male' },
  { id: 'bf_emma', name: 'Emma', description: 'British Female' },
  { id: 'bm_daniel', name: 'Daniel', description: 'British Male' },
];

interface StoryJob {
  id: string;
  prompt: string;
  status: string;
  video_url: string | null;
  created_at: string;
  voice_id: string | null;
}

const AIStory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoPrompting, setIsAutoPrompting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<StoryJob[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<StoryJob | null>(null);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('ai_story_jobs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setHistory(data);
    }
  };

  // Subscribe to realtime updates for all processing jobs
  useEffect(() => {
    const processingJobs = history.filter(job => job.status === 'processing' || job.status === 'pending');
    if (processingJobs.length === 0) return;

    console.log('Subscribing to updates for processing jobs:', processingJobs.map(j => j.id));

    const channel = supabase
      .channel('ai-story-jobs-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_story_jobs',
        },
        (payload) => {
          console.log('Story job update received:', payload);
          const updatedJob = payload.new as StoryJob;
          
          // Update the job in history
          setHistory(prev => prev.map(job => 
            job.id === updatedJob.id ? updatedJob : job
          ));

          // If this was the selected item, update the video URL
          if (selectedHistoryItem?.id === updatedJob.id && updatedJob.video_url) {
            setVideoUrl(updatedJob.video_url);
            setSelectedHistoryItem(updatedJob);
          }

          // Show toast for completed/error status
          if (updatedJob.status === 'completed' && updatedJob.video_url) {
            toast({
              title: 'Story ready!',
              description: `"${updatedJob.prompt.slice(0, 50)}..." is ready to watch.`,
            });
          } else if (updatedJob.status === 'error') {
            toast({
              title: 'Generation failed',
              description: `Failed to generate story.`,
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from story job updates');
      supabase.removeChannel(channel);
    };
  }, [history.filter(j => j.status === 'processing' || j.status === 'pending').length, selectedHistoryItem, toast]);

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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to generate videos.',
        variant: 'destructive',
      });
      return;
    }

    const currentPrompt = prompt;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-story`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            prompt: currentPrompt,
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
      
      if (result.job_id) {
        // Clear prompt for next generation
        setPrompt('');
        
        // Add job to history immediately
        const newJob: StoryJob = {
          id: result.job_id,
          prompt: currentPrompt,
          status: 'processing',
          video_url: null,
          created_at: new Date().toISOString(),
          voice_id: selectedVoice,
        };
        setHistory(prev => [newJob, ...prev]);

        toast({
          title: 'Generation started!',
          description: 'Your story is being created. You can generate more while waiting.',
        });
      } else if (result.videoUrl || result.video_url) {
        setVideoUrl(result.videoUrl || result.video_url);
        setPrompt('');
        fetchHistory();
        toast({
          title: 'Story generated!',
          description: 'Your AI story video is ready to play.',
        });
      }
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || `ai-story-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast({
        title: 'Download started',
        description: 'Your video is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download the video.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    const { error } = await supabase
      .from('ai_story_jobs')
      .delete()
      .eq('id', id);

    if (!error) {
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
        setVideoUrl(null);
      }
      toast({
        title: 'Deleted',
        description: 'Story removed from history.',
      });
    }
  };

  const handlePreviewHistoryItem = (item: StoryJob) => {
    setSelectedHistoryItem(item);
    if (item.video_url) {
      setVideoUrl(item.video_url);
    } else {
      setVideoUrl(null);
    }
  };

  const selectedVoiceInfo = voices.find(v => v.id === selectedVoice);
  const processingCount = history.filter(j => j.status === 'processing' || j.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {/* Hero Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8 p-8 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--accent) / 0.1) 50%, hsl(var(--secondary) / 0.15) 100%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                      AI Story Generator
                    </h1>
                    <p className="text-muted-foreground mt-1">Transform your ideas into captivating narrated video stories</p>
                  </div>
                </div>
                {processingCount > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                    <span className="text-sm text-yellow-400">{processingCount} processing</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Main Controls */}
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Prompt Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Story Prompt
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAutoPrompt}
                          disabled={isAutoPrompting || isEnhancing}
                          className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                        >
                          {isAutoPrompting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4 mr-2 text-purple-400" />
                          )}
                          Auto Prompt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEnhance}
                          disabled={isEnhancing || isAutoPrompting || !prompt.trim()}
                          className="border-pink-500/30 hover:bg-pink-500/10 hover:border-pink-500/50"
                        >
                          {isEnhancing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2 text-pink-400" />
                          )}
                          AI Enhance
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Textarea
                      placeholder="Enter your story prompt... (e.g., 'Tell me a bedtime story about a brave little fox who discovers a magical forest')"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-purple-500/50 transition-colors"
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Voice Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Voice Selection */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-blue-400" />
                      Voice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="bg-background/50 border-border/50">
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
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Volume2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedVoiceInfo.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedVoiceInfo.description}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Voice Speed */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-orange-400" />
                      Voice Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Speed</Label>
                        <span className="text-lg font-bold text-orange-400">{voiceSpeed[0].toFixed(1)}x</span>
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
                        <span>Slower</span>
                        <span>Normal</span>
                        <span>Faster</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Generate Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleGenerate}
                  disabled={isSubmitting || !prompt.trim()}
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 border-0 shadow-lg shadow-purple-500/25"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Generation...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Story
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Video Player */}
              <AnimatePresence mode="wait">
                {videoUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                      <CardHeader className="border-b border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Play className="w-5 h-5 text-green-400" />
                            {selectedHistoryItem ? 'Preview' : 'Your Story Video'}
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(videoUrl)}
                            className="border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
                          >
                            <Download className="w-4 h-4 mr-2 text-green-400" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-black">
                          <video 
                            controls 
                            className="w-full h-full" 
                            src={videoUrl}
                            key={videoUrl}
                          >
                            Your browser does not support the video element.
                          </video>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History Grid Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  History
                  {history.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{history.length}</Badge>
                  )}
                </h2>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card/30 rounded-2xl border border-border/50">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No stories generated yet</p>
                  <p className="text-sm mt-1">Your generated videos will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`group relative rounded-lg border overflow-hidden transition-all duration-200 bg-card/50 backdrop-blur-sm ${
                        item.video_url ? 'cursor-pointer hover:border-primary/50 hover:ring-1 hover:ring-primary/20' : ''
                      } ${selectedHistoryItem?.id === item.id ? 'border-primary ring-1 ring-primary/30' : 'border-border/50'}`}
                      onClick={() => handlePreviewHistoryItem(item)}
                    >
                      {/* Video Thumbnail */}
                      <div className="aspect-[9/16] bg-muted/30 relative overflow-hidden">
                        {item.status === 'completed' && item.video_url ? (
                          <video
                            src={item.video_url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {item.status === 'processing' || item.status === 'pending' ? (
                              <div className="text-center">
                                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-1" />
                                <span className="text-[10px] text-muted-foreground">Processing</span>
                              </div>
                            ) : item.status === 'error' ? (
                              <div className="text-center px-2">
                                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-1">
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </div>
                                <span className="text-[10px] text-red-400">Failed</span>
                              </div>
                            ) : (
                              <BookOpen className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        )}

                        {/* Status Badge */}
                        <Badge 
                          className={`absolute top-1 left-1 text-[10px] px-1.5 py-0 h-4 ${getStatusColor(item.status)}`}
                        >
                          {item.status === 'processing' && (
                            <Loader2 className="w-2 h-2 mr-0.5 animate-spin" />
                          )}
                          {item.status}
                        </Badge>

                        {/* Hover Overlay with Actions */}
                        {item.status === 'completed' && item.video_url && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="w-7 h-7 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewHistoryItem(item);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="w-7 h-7 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.video_url!);
                              }}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* Delete Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-500/80 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistoryItem(item.id);
                          }}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </Button>
                      </div>

                      {/* Card Content */}
                      <div className="p-2">
                        <p className="text-xs line-clamp-2 min-h-[2rem] text-foreground/90">
                          {item.prompt}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Clock className="w-2.5 h-2.5" />
                          {format(new Date(item.created_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIStory;
