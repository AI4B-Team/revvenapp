import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image as ImageIcon, Music, Sparkles, Loader2, Play, Download, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

type TaskState = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

const InfinityTalk = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'480p' | '720p'>('480p');
  const [taskState, setTaskState] = useState<TaskState>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setTaskState('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-reference-image', {
        body: formData,
      });

      if (error) throw error;
      
      setImageUrl(data.url);
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setTaskState('idle');
    }
  };

  const handleAudioUpload = async (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an MP3, WAV, AAC, MP4, or OGG audio file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Audio must be less than 10MB');
      return;
    }

    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = async () => {
      if (audio.duration > 15) {
        toast.error('Audio must be 15 seconds or less');
        return;
      }

      setTaskState('uploading');
      try {
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('upload-audio', {
          body: formData,
        });

        if (error) throw error;
        
        setAudioUrl(data.url);
        setAudioFile(file);
        toast.success('Audio uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload audio');
      } finally {
        setTaskState('idle');
      }
    };
  };

  const pollTaskStatus = async (taskIdToCheck: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('infinity-talk', {
        body: { action: 'query', taskId: taskIdToCheck },
      });

      if (error) throw error;

      const state = data.state;
      
      if (state === 'waiting' || state === 'queuing') {
        setProgress(20);
      } else if (state === 'generating') {
        setProgress(prev => Math.min(prev + 10, 80));
      } else if (state === 'success') {
        setProgress(100);
        setTaskState('success');
        if (data.resultUrls && data.resultUrls.length > 0) {
          setResultVideoUrl(data.resultUrls[0]);
        }
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        toast.success('Video generated successfully!');
      } else if (state === 'fail') {
        setTaskState('error');
        setErrorMessage(data.failMsg || 'Generation failed');
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        toast.error(data.failMsg || 'Generation failed');
      }
    } catch (error) {
      console.error('Error polling task:', error);
    }
  };

  const handleGenerate = async () => {
    if (!imageUrl) {
      toast.error('Please upload an image');
      return;
    }
    if (!audioUrl) {
      toast.error('Please upload audio');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setTaskState('generating');
    setProgress(10);
    setErrorMessage(null);
    setResultVideoUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('infinity-talk', {
        body: {
          action: 'create',
          imageUrl,
          audioUrl,
          prompt: prompt.trim(),
          resolution,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to start generation');
      }

      setTaskId(data.taskId);
      toast.success('Generation started! This may take a few minutes...');

      pollIntervalRef.current = setInterval(() => {
        pollTaskStatus(data.taskId);
      }, 5000);
    } catch (error: any) {
      console.error('Generation error:', error);
      setTaskState('error');
      setErrorMessage(error.message);
      toast.error(error.message || 'Failed to start generation');
    }
  };

  const handleReset = () => {
    setImageUrl('');
    setImagePreview('');
    setAudioUrl('');
    setAudioFile(null);
    setPrompt('');
    setResolution('480p');
    setTaskState('idle');
    setTaskId(null);
    setResultVideoUrl(null);
    setProgress(0);
    setErrorMessage(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const isGenerating = taskState === 'generating';
  const canGenerate = imageUrl && audioUrl && prompt.trim() && !isGenerating;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        activeTab="Video"
        collapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Create
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl">
                🗣️
              </div>
              <div>
                <h1 className="text-2xl font-bold">Infinity Talk</h1>
                <p className="text-muted-foreground">Make any image talk with your audio</p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Inputs */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="p-6 rounded-xl border bg-card">
                  <Label className="text-base font-semibold mb-4 block">Face Image</Label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                  {imagePreview ? (
                    <div className="relative aspect-square max-w-xs rounded-lg overflow-hidden group mx-auto">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          setImageUrl('');
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isGenerating}
                      className="w-full h-40 border-dashed flex flex-col gap-3"
                    >
                      <ImageIcon className="w-10 h-10 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium">Upload face image</p>
                        <p className="text-sm text-muted-foreground">JPEG, PNG, or WebP • Max 10MB</p>
                      </div>
                    </Button>
                  )}
                </div>

                {/* Audio Upload */}
                <div className="p-6 rounded-xl border bg-card">
                  <Label className="text-base font-semibold mb-4 block">Audio (max 15 seconds)</Label>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/ogg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                  />
                  {audioFile ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <Music className="w-5 h-5 text-violet-500" />
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{audioFile.name}</span>
                      <button
                        onClick={() => {
                          setAudioUrl('');
                          setAudioFile(null);
                        }}
                        className="p-2 hover:bg-muted rounded-full transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => audioInputRef.current?.click()}
                      disabled={isGenerating}
                      className="w-full h-32 border-dashed flex flex-col gap-3"
                    >
                      <Music className="w-10 h-10 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium">Upload audio file</p>
                        <p className="text-sm text-muted-foreground">MP3, WAV, AAC, OGG • Max 15 sec</p>
                      </div>
                    </Button>
                  )}
                </div>

                {/* Prompt & Settings */}
                <div className="p-6 rounded-xl border bg-card space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Prompt</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the person and scene, e.g., 'A young woman with long dark hair talking on a podcast.'"
                      disabled={isGenerating}
                      className="min-h-[100px] resize-none"
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground text-right mt-1">{prompt.length}/5000</p>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-2 block">Resolution</Label>
                    <Select value={resolution} onValueChange={(v) => setResolution(v as '480p' | '720p')} disabled={isGenerating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="480p">480p (Faster)</SelectItem>
                        <SelectItem value="720p">720p (Higher Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Talking Video
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Column - Result */}
              <div className="space-y-6">
                <div className="p-6 rounded-xl border bg-card min-h-[400px] flex flex-col">
                  <Label className="text-base font-semibold mb-4 block">Result</Label>
                  
                  {/* Idle State */}
                  {taskState === 'idle' && !resultVideoUrl && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <Play className="w-8 h-8" />
                        </div>
                        <p>Your generated video will appear here</p>
                      </div>
                    </div>
                  )}

                  {/* Generation Progress */}
                  {isGenerating && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-full max-w-xs space-y-4">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                          <span className="font-medium">Generating your video...</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-sm text-muted-foreground text-center">
                          This may take 1-3 minutes. Please don't close this page.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {taskState === 'error' && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 max-w-sm">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                          <div>
                            <p className="font-semibold text-destructive">Generation Failed</p>
                            <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                            <Button variant="outline" size="sm" onClick={handleReset} className="mt-3">
                              Try Again
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {resultVideoUrl && (
                    <div className="flex-1 flex flex-col">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                        <video
                          src={resultVideoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => window.open(resultVideoUrl, '_blank')}
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                        <Button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = resultVideoUrl;
                            a.download = 'infinity-talk-video.mp4';
                            a.click();
                          }}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <Button variant="ghost" onClick={handleReset} className="w-full mt-2">
                        Create Another
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InfinityTalk;
