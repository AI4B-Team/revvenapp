import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image as ImageIcon, Music, Sparkles, Loader2, Play, Download, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface InfinityTalkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TaskState = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

const InfinityTalkModal: React.FC<InfinityTalkModalProps> = ({ open, onOpenChange }) => {
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

  // Cleanup polling on unmount
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

    // Check audio duration
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
      
      // Update progress based on state
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

      // Start polling for status
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Infinity Talk
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Result Video */}
          {resultVideoUrl && (
            <div className="space-y-3">
              <Label>Generated Video</Label>
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  src={resultVideoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(resultVideoUrl, '_blank')}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Open in New Tab
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
              <Button variant="ghost" onClick={handleReset} className="w-full">
                Create Another
              </Button>
            </div>
          )}

          {/* Error State */}
          {taskState === 'error' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Generation Failed</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="mt-2">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                <span className="text-sm text-muted-foreground">
                  Generating your talking video...
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                This may take 1-3 minutes. Please don't close this window.
              </p>
            </div>
          )}

          {/* Input Form */}
          {taskState !== 'success' && taskState !== 'error' && (
            <>
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Face Image</Label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setImageUrl('');
                        setImagePreview('');
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isGenerating}
                    className="w-full h-24 border-dashed flex flex-col gap-2"
                  >
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload face image (JPEG, PNG, WebP)</span>
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Max 10MB. Will be resized to match video aspect ratio.</p>
              </div>

              {/* Audio Upload */}
              <div className="space-y-2">
                <Label>Audio (max 15 seconds)</Label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/ogg"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                />
                {audioFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                    <Music className="w-5 h-5 text-violet-500" />
                    <span className="flex-1 text-sm truncate">{audioFile.name}</span>
                    <button
                      onClick={() => {
                        setAudioUrl('');
                        setAudioFile(null);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={isGenerating}
                    className="w-full h-24 border-dashed flex flex-col gap-2"
                  >
                    <Music className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload audio (MP3, WAV, AAC, OGG)</span>
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Audio duration must not exceed 15 seconds.</p>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the person and scene, e.g., 'A young woman with long dark hair talking on a podcast.'"
                  disabled={isGenerating}
                  className="min-h-[80px] resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground text-right">{prompt.length}/5000</p>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <Label>Resolution</Label>
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

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Talking Video
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfinityTalkModal;
