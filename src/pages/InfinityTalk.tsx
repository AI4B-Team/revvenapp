import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Music, Sparkles, Loader2, Play, Download, X, AlertCircle, ArrowLeft, Upload, CheckCircle2, Film, Zap, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useResizableTextarea } from '@/hooks/useResizableTextarea';
import ResizeHandle from '@/components/ui/ResizeHandle';

type TaskState = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

const InfinityTalk = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
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

  const { height: promptHeight, isResizing: isPromptResizing, handleResizeStart: handlePromptResizeStart } = useResizableTextarea({
    minHeight: 120,
    maxHeight: 400,
    initialHeight: 150,
  });

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

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setTaskState('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-reference-image', {
        body: formData,
      });

      if (error) throw error;
      
      setImageUrl(data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setSelectedImageFile(null);
      setImagePreview('');
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

      setAudioFile(file);
      setTaskState('uploading');
      
      try {
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('upload-audio', {
          body: formData,
        });

        if (error) throw error;
        
        setAudioUrl(data.url);
        toast.success('Audio uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload audio');
        setAudioFile(null);
      } finally {
        setTaskState('idle');
      }
    };
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    setSelectedImageFile(null);
  };

  const handleRemoveAudio = () => {
    setAudioUrl('');
    setAudioFile(null);
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
    setSelectedImageFile(null);
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
  const isUploading = taskState === 'uploading';
  const canGenerate = imageUrl && audioUrl && prompt.trim() && !isGenerating && !isUploading;

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

          <div className="max-w-3xl mx-auto">
            {/* Result Video - Show above when generated */}
            {resultVideoUrl && (
              <div className="mb-6 p-4 rounded-xl border bg-card">
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
                  <Button variant="ghost" onClick={handleReset}>
                    Create Another
                  </Button>
                </div>
              </div>
            )}

            {/* Error State */}
            {taskState === 'error' && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-destructive">Generation Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Generation Progress */}
            {isGenerating && (
              <div className="mb-6 p-6 rounded-xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                  <span className="font-medium">Generating your talking video...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center mt-3">
                  This may take 1-3 minutes. Please don't close this page.
                </p>
              </div>
            )}

            {/* Main Prompt Box - Card Layout */}
            {!resultVideoUrl && taskState !== 'error' && !isGenerating && (
              <Card className="border-2 border-primary/20 shadow-2xl animate-fade-in overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-primary/20 transition-all duration-500">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-bl from-violet-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-2xl" />
                
                <CardHeader className="relative pb-8 border-b border-border/50">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                      <Film className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Create Talking Video</CardTitle>
                      <CardDescription className="text-base mt-1">Make any face come alive with your audio</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-8 relative pt-8">
                  {/* Hidden file inputs */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/ogg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                  />

                  {/* Face Image Upload */}
                  <div className="space-y-3 group">
                    <Label className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <ImageIcon className="w-4 h-4 text-violet-500 group-hover:animate-pulse" />
                      Face Image
                    </Label>
                    {imagePreview ? (
                      <div className="relative border-2 border-violet-500/50 rounded-lg p-4 bg-violet-500/5">
                        <div className="flex items-start gap-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-lg shadow-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Image selected
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveImage}
                                disabled={isUploading}
                                className="h-8 w-8 p-0 hover:bg-destructive/10"
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {selectedImageFile?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedImageFile ? `${(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => imageInputRef.current?.click()}
                        className="relative border-2 border-dashed border-border hover:border-violet-500/50 rounded-lg p-6 transition-all duration-300 hover:bg-violet-500/5 cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                          <p className="text-sm text-muted-foreground">Click to upload face image</p>
                          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP (max 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audio Upload */}
                  <div className="space-y-3 group">
                    <Label className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Music className="w-4 h-4 text-violet-500 group-hover:animate-pulse" />
                      Audio File
                    </Label>
                    {audioFile ? (
                      <div className="relative border-2 border-violet-500/50 rounded-lg p-4 bg-violet-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                              <Music className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold">{audioFile.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveAudio}
                            disabled={isUploading}
                            className="h-8 w-8 p-0 hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => audioInputRef.current?.click()}
                        className="relative border-2 border-dashed border-border hover:border-violet-500/50 rounded-lg p-6 transition-all duration-300 hover:bg-violet-500/5 cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                          <p className="text-sm text-muted-foreground">Click to upload audio</p>
                          <p className="text-xs text-muted-foreground">MP3, WAV, AAC, OGG (max 15 seconds)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prompt/Description */}
                  <div className="space-y-3 group">
                    <Label className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Wand2 className="w-4 h-4 text-violet-500 group-hover:animate-pulse" />
                      Prompt / Description
                    </Label>
                    <div className="relative" style={{ height: promptHeight }}>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the person and scene, e.g., 'A young woman with long dark hair talking on a podcast.'"
                        disabled={isUploading}
                        maxLength={5000}
                        className="h-full text-base resize-none transition-all duration-300 focus:ring-2 focus:ring-violet-500/30 border-2 hover:border-violet-500/50"
                      />
                      <ResizeHandle 
                        onResizeStart={handlePromptResizeStart} 
                        isResizing={isPromptResizing}
                        variant="subtle"
                      />
                      {isPromptResizing && <div className="fixed inset-0 cursor-nwse-resize z-50" />}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Describe how the character should appear and behave
                      </span>
                      <span className="text-xs">{prompt.length}/5000</span>
                    </p>
                  </div>

                  {/* Resolution */}
                  <div className="space-y-3 group">
                    <Label className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Film className="w-4 h-4 text-violet-500 group-hover:animate-pulse" />
                      Video Resolution
                    </Label>
                    <Select value={resolution} onValueChange={(v) => setResolution(v as '480p' | '720p')} disabled={isUploading}>
                      <SelectTrigger className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-violet-500/30 border-2 hover:border-violet-500/50 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-2 border-border shadow-xl z-[100]">
                        <SelectItem value="480p" className="cursor-pointer hover:bg-accent">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">480p</span>
                            <span className="text-xs text-muted-foreground">- Faster generation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="720p" className="cursor-pointer hover:bg-accent">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">720p</span>
                            <span className="text-xs text-muted-foreground">- Higher quality</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full h-14 text-lg font-bold shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 gap-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        Generate Talking Video
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InfinityTalk;
