import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Image as ImageIcon, Music, Sparkles, Loader2, Play, Download, X, AlertCircle, ArrowLeft, Upload, Film, ChevronDown, Check, User, Mic, RatioIcon, LayoutGrid, Pause } from 'lucide-react';
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
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const [isHoveringAudioIcon, setIsHoveringAudioIcon] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const { height: promptHeight, isResizing: isPromptResizing, handleResizeStart: handlePromptResizeStart } = useResizableTextarea({
    minHeight: 100,
    maxHeight: 300,
    initialHeight: 120,
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
      toast.success('Image uploaded');
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
        toast.success('Audio uploaded');
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
    audioPreviewRef.current?.pause();
    setIsPlayingAudioPreview(false);
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

            {/* Main Prompt Box - Same Style as Video in Create Page */}
            {!resultVideoUrl && taskState !== 'error' && !isGenerating && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
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

                {/* Attachments Above Textarea */}
                {(imagePreview || audioFile) && (
                  <div className="px-4 pt-4 flex items-center gap-3 flex-wrap">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-violet-500 bg-muted">
                          <img src={imagePreview} alt="Face" className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Audio Preview */}
                    {audioFile && (
                      <div 
                        className="flex items-center gap-2 bg-secondary/80 rounded-xl px-3 py-1.5 group"
                        onMouseEnter={() => setIsHoveringAudioIcon(true)}
                        onMouseLeave={() => setIsHoveringAudioIcon(false)}
                      >
                        <div 
                          className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden flex-shrink-0"
                          onClick={() => {
                            if (isPlayingAudioPreview) {
                              audioPreviewRef.current?.pause();
                              setIsPlayingAudioPreview(false);
                            } else {
                              if (!audioPreviewRef.current && audioUrl) {
                                audioPreviewRef.current = new Audio(audioUrl);
                                audioPreviewRef.current.onended = () => setIsPlayingAudioPreview(false);
                              }
                              audioPreviewRef.current?.play();
                              setIsPlayingAudioPreview(true);
                            }
                          }}
                        >
                          <Music size={14} className={`text-white transition ${isHoveringAudioIcon ? 'opacity-30' : 'opacity-100'}`} />
                          <div className={`absolute inset-0 flex items-center justify-center transition ${isHoveringAudioIcon ? 'opacity-100' : 'opacity-0'}`}>
                            {isPlayingAudioPreview ? (
                              <Pause size={12} className="text-white" />
                            ) : (
                              <Play size={12} className="text-white ml-0.5" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-foreground max-w-32 truncate">
                          {audioFile.name}
                        </span>
                        <button
                          onClick={handleRemoveAudio}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} className="text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Textarea */}
                <div className="px-4 pt-4 relative" style={{ height: promptHeight }}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the person and scene, e.g., 'A young woman with long dark hair talking on a podcast.'"
                    disabled={isUploading}
                    maxLength={5000}
                    className="w-full h-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none"
                  />
                  <ResizeHandle 
                    onResizeStart={handlePromptResizeStart} 
                    isResizing={isPromptResizing}
                    variant="subtle"
                  />
                  {isPromptResizing && <div className="fixed inset-0 cursor-nwse-resize z-50" />}
                </div>

                {/* Bottom Controls Bar */}
                <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TooltipProvider delayDuration={100}>
                      {/* Face Image Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => imageInputRef.current?.click()}
                            disabled={isUploading}
                            className={`p-2 rounded-lg text-sm transition flex items-center gap-2 whitespace-nowrap hover:brightness-90 ${
                              imageUrl ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400' : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            <User size={16} />
                            {imageUrl && <span className="text-xs">Face</span>}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Face Image</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Audio Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => audioInputRef.current?.click()}
                            disabled={isUploading}
                            className={`p-2 rounded-lg text-sm transition flex items-center gap-2 whitespace-nowrap hover:brightness-90 ${
                              audioUrl ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400' : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            <Mic size={16} />
                            {audioUrl && <span className="text-xs">Audio</span>}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Audio (max 15s)</p>
                        </TooltipContent>
                      </Tooltip>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Resolution Dropdown */}
                      <Popover>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <button className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 whitespace-nowrap hover:brightness-90 ${
                                resolution !== '480p' ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400' : 'bg-secondary text-muted-foreground'
                              }`}>
                                <RatioIcon size={16} />
                                {resolution}
                                <ChevronDown size={14} />
                              </button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Resolution</p>
                          </TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-48 bg-background border-border z-50 p-2" align="start">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setResolution('480p')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${
                                resolution === '480p' ? 'bg-secondary' : ''
                              }`}
                            >
                              <span>480p <span className="text-xs text-muted-foreground">- Faster</span></span>
                              {resolution === '480p' && <Check size={14} className="text-violet-500" />}
                            </button>
                            <button 
                              onClick={() => setResolution('720p')}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary rounded-md transition flex items-center justify-between ${
                                resolution === '720p' ? 'bg-secondary' : ''
                              }`}
                            >
                              <span>720p <span className="text-xs text-muted-foreground">- Higher quality</span></span>
                              {resolution === '720p' && <Check size={14} className="text-violet-500" />}
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipProvider>
                  </div>

                  {/* Right Side - Character count and Generate Button */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{prompt.length}/5000</span>
                    <Button
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      size="sm"
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Helper text when missing inputs */}
                {(!imageUrl || !audioUrl) && (
                  <div className="px-4 pb-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-3">
                    <AlertCircle className="w-3 h-3" />
                    {!imageUrl && !audioUrl ? 'Add a face image and audio (max 15s) to generate' : 
                     !imageUrl ? 'Add a face image to continue' : 'Add audio (max 15 seconds) to continue'}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InfinityTalk;