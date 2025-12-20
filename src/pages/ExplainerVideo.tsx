import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Link, Loader2, FileVideo, Trash2, Eye, Clock, CheckCircle, AlertCircle, X, Play, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { User } from '@supabase/supabase-js';

interface ExplainerVideo {
  id: string;
  title: string;
  source_type: 'upload' | 'link';
  source_url: string | null;
  transcript: string | null;
  explanation: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function ExplainerVideoPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [sourceType, setSourceType] = useState<'upload' | 'link'>('link');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [history, setHistory] = useState<ExplainerVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<ExplainerVideo | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('explainer_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory((data as ExplainerVideo[]) || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        toast.error('Please upload a video or audio file');
        return;
      }
      setUploadedFile(file);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const processExplainerVideo = async () => {
    if (sourceType === 'link' && !videoUrl) {
      toast.error('Please enter a video URL');
      return;
    }
    if (sourceType === 'upload' && !uploadedFile) {
      toast.error('Please upload a video file');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('Creating record...');

    try {
      // Step 1: Create record
      const { data: createData, error: createError } = await supabase.functions.invoke('process-explainer-video', {
        body: {
          action: 'create',
          sourceType,
          sourceUrl: sourceType === 'link' ? videoUrl : null,
          title: videoTitle || 'Untitled Video'
        }
      });

      if (createError || !createData?.record) {
        throw new Error(createError?.message || 'Failed to create record');
      }

      const recordId = createData.record.id;
      console.log('Created record:', recordId);

      let audioBase64: string | null = null;
      let audioUrl: string | null = null;

      if (sourceType === 'link') {
        // Step 2: Download video from link
        setCurrentStep('Downloading video...');
        const { data: downloadData, error: downloadError } = await supabase.functions.invoke('process-explainer-video', {
          body: {
            action: 'download',
            recordId,
            sourceUrl: videoUrl
          }
        });

        if (downloadError) {
          throw new Error(downloadError?.message || 'Failed to download video');
        }

        audioUrl = downloadData?.audioUrl || downloadData?.videoUrl;
        if (!audioUrl) {
          throw new Error('No audio URL found in the video');
        }

        console.log('Audio URL:', audioUrl);
      } else {
        // Convert uploaded file to base64
        setCurrentStep('Processing uploaded file...');
        const reader = new FileReader();
        audioBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(uploadedFile!);
        });
      }

      // Step 3: Transcribe audio
      setCurrentStep('Transcribing audio...');
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('process-explainer-video', {
        body: {
          action: 'transcribe',
          recordId,
          sourceUrl: audioUrl,
          audioBase64
        }
      });

      if (transcribeError || !transcribeData?.transcript) {
        throw new Error(transcribeError?.message || 'Failed to transcribe audio');
      }

      console.log('Transcript:', transcribeData.transcript.substring(0, 100));

      // Step 4: Generate explanation
      setCurrentStep('Generating explanation...');
      const { data: explainData, error: explainError } = await supabase.functions.invoke('process-explainer-video', {
        body: {
          action: 'explain',
          recordId,
          transcript: transcribeData.transcript
        }
      });

      if (explainError) {
        throw new Error(explainError?.message || 'Failed to generate explanation');
      }

      toast.success('Explainer video processed successfully!');
      await fetchHistory();
      
      // Show the result
      const { data: completedRecord } = await supabase
        .from('explainer_videos')
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (completedRecord) {
        setSelectedVideo(completedRecord as ExplainerVideo);
        setActiveTab('history');
      }

      // Reset form
      setVideoUrl('');
      setVideoTitle('');
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Error processing video:', error);
      toast.error(error.message || 'Failed to process video');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-explainer-video', {
        body: { action: 'delete', recordId: id }
      });

      if (error) throw error;
      
      toast.success('Video deleted');
      setHistory(prev => prev.filter(v => v.id !== id));
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab="Video"
        onTabChange={() => {}}
        onCharactersClick={() => {}}
        onIdentityClick={() => {}}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/create')}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <FileVideo className="w-8 h-8 text-primary" />
                  Explainer Video
                </h1>
                <p className="text-muted-foreground mt-1">
                  Transform any video into a comprehensive explanation
                </p>
              </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'history')} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="history">History ({history.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Form */}
                  <div className="space-y-6">
                    {/* Source Type Selection */}
                    <div className="flex gap-4">
                      <Button
                        variant={sourceType === 'link' ? 'default' : 'outline'}
                        onClick={() => setSourceType('link')}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Video Link
                      </Button>
                      <Button
                        variant={sourceType === 'upload' ? 'default' : 'outline'}
                        onClick={() => setSourceType('upload')}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </div>

                    {/* Link Input */}
                    {sourceType === 'link' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Video URL</label>
                        <Input
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          disabled={isProcessing}
                          className="h-12"
                        />
                        <p className="text-xs text-muted-foreground">
                          Supports YouTube, TikTok, Instagram, Facebook, and more
                        </p>
                      </div>
                    )}

                    {/* File Upload */}
                    {sourceType === 'upload' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Video/Audio File</label>
                        <div
                          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                            uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadedFile ? (
                            <div className="flex items-center justify-center gap-2">
                              <FileVideo className="w-6 h-6 text-green-600" />
                              <span className="text-green-600 font-medium">{uploadedFile.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFile(null);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                              <p className="text-gray-600 font-medium">Click to upload a video or audio file</p>
                              <p className="text-xs text-gray-400 mt-1">MP4, MOV, MP3, WAV, WebM</p>
                            </>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*,audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    )}

                    {/* Title Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title (Optional)</label>
                      <Input
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Enter a title for this explainer"
                        disabled={isProcessing}
                        className="h-12"
                      />
                    </div>

                    {/* Process Button */}
                    <Button
                      onClick={processExplainerVideo}
                      disabled={isProcessing || (sourceType === 'link' ? !videoUrl : !uploadedFile)}
                      className="w-full h-14 text-lg"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {currentStep}
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Generate Explanation
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Right Column - How it works */}
                  <div className="bg-muted/30 rounded-2xl p-8">
                    <h3 className="text-xl font-semibold mb-6">How it works</h3>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Provide Video</h4>
                          <p className="text-sm text-muted-foreground">
                            Paste a video link or upload a video/audio file
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Extract Audio</h4>
                          <p className="text-sm text-muted-foreground">
                            We download and extract audio from the video
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Transcribe</h4>
                          <p className="text-sm text-muted-foreground">
                            AI transcribes all spoken content
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Generate Explanation</h4>
                          <p className="text-sm text-muted-foreground">
                            AI creates a comprehensive explanation of the topic
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="flex gap-6 min-h-[600px]">
                  {/* History List */}
                  <div className="w-80 border rounded-xl p-4 bg-muted/20">
                    <h3 className="font-semibold mb-4">Your Explainer Videos</h3>
                    <ScrollArea className="h-[550px]">
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileVideo className="w-10 h-10 mx-auto mb-3 opacity-50" />
                          <p>No explainer videos yet</p>
                          <p className="text-sm mt-1">Create your first one!</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {history.map((video) => (
                            <div
                              key={video.id}
                              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                selectedVideo?.id === video.id
                                  ? 'bg-primary/10 border-2 border-primary'
                                  : 'bg-background hover:bg-muted border border-transparent'
                              }`}
                              onClick={() => setSelectedVideo(video)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(video.status)}
                                    <span className="font-medium text-sm truncate">
                                      {video.title || 'Untitled'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDate(video.created_at)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteVideo(video.id);
                                  }}
                                  className="opacity-50 hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Selected Video Details */}
                  <div className="flex-1 border rounded-xl p-6 bg-background">
                    {selectedVideo ? (
                      <ScrollArea className="h-[550px] pr-4">
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-2xl font-bold">{selectedVideo.title || 'Untitled'}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(selectedVideo.created_at)} • {selectedVideo.source_type === 'link' ? 'From Link' : 'Uploaded'}
                            </p>
                            {selectedVideo.source_url && (
                              <a
                                href={selectedVideo.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline break-all inline-block mt-2"
                              >
                                {selectedVideo.source_url}
                              </a>
                            )}
                          </div>

                          {selectedVideo.status === 'failed' && selectedVideo.error_message && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <p className="text-sm text-red-600">{selectedVideo.error_message}</p>
                            </div>
                          )}

                          {selectedVideo.transcript && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <FileVideo className="w-4 h-4" />
                                Transcript
                              </h4>
                              <div className="bg-muted/50 rounded-xl p-4 text-sm max-h-48 overflow-auto">
                                {selectedVideo.transcript}
                              </div>
                            </div>
                          )}

                          {selectedVideo.explanation && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Explanation
                              </h4>
                              <div className="bg-muted/50 rounded-xl p-4 text-sm whitespace-pre-wrap">
                                {selectedVideo.explanation}
                              </div>
                            </div>
                          )}

                          {selectedVideo.status !== 'completed' && selectedVideo.status !== 'failed' && (
                            <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted/30 rounded-lg">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="capitalize">{selectedVideo.status}...</span>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-lg">Select a video to view details</p>
                          <p className="text-sm mt-1">Or create a new explainer video</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
