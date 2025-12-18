import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Upload, Play, Pause, Trash2, 
  Loader2, Download, Languages, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UsageRecord {
  id: string;
  name: string;
  url: string;
  status: string;
  created_at: string;
}

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export default function AudioDubber() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch usage history from user_voices where type='revoice'
  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_voices')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'revoice')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setUsageHistory(data);
    }
  };

  useEffect(() => {
    fetchHistory();

    // Subscribe to realtime updates for revoice records
    const channel = supabase
      .channel('revoice-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_voices',
          filter: 'type=eq.revoice'
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
        toast.error('Please upload an audio or video file');
        return;
      }
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setOutputUrl(null);
    }
  };

  const handleDub = async () => {
    if (!audioFile) {
      toast.error('Please upload an audio file');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload audio to Cloudinary
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('upload_preset', 'revven');

      const uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/dszt275xv/upload',
        { method: 'POST', body: formData }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) throw new Error('Upload failed');

      // Call the revoice-audio edge function for dubbing (runs async in background)
      const { error } = await supabase.functions.invoke('revoice-audio', {
        body: {
          audioUrl: uploadData.secure_url,
          targetLanguage: targetLanguage.code,
          name: audioFile.name.replace(/\.[^/.]+$/, '')
        }
      });

      if (error) throw error;

      toast.success('Dubbing started! It will appear in history when complete.');
      setAudioFile(null);
      setAudioUrl(null);
      setOutputUrl(null);

    } catch (error: any) {
      toast.error(error.message || 'Failed to start dubbing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('user_voices').delete().eq('id', id);
      if (error) throw error;
      setUsageHistory(prev => prev.filter(r => r.id !== id));
      toast.success('Deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete');
    }
  };

  const playAudio = (url: string) => {
    if (isPlaying === url) {
      audioRef.current?.pause();
      setIsPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      audioRef.current.onended = () => setIsPlaying(null);
      setIsPlaying(url);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Create</span>
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                  <span className="text-3xl">🎧</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Audio Dubber</h1>
                  <p className="text-muted-foreground">Translate and dub audio to any language</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              {/* Audio Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload Audio or Video</label>
                
                {!audioUrl ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <span className="text-muted-foreground">Click to upload audio or video</span>
                    <span className="text-xs text-muted-foreground">MP3, WAV, MP4, MOV (max 100MB)</span>
                  </button>
                ) : (
                  <div className="p-4 bg-secondary rounded-xl flex items-center gap-4">
                    <button
                      onClick={() => playAudio(audioUrl)}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                    >
                      {isPlaying === audioUrl ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{audioFile?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {audioFile && `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAudioFile(null);
                        setAudioUrl(null);
                        setOutputUrl(null);
                      }}
                      className="p-2 rounded-lg hover:bg-background/50 text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Target Language */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Target Language</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full p-4 bg-secondary rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Languages className="w-5 h-5 text-primary" />
                        <span className="font-medium">{targetLanguage.name}</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="max-h-64 overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setTargetLanguage(lang)}
                          className={`w-full p-3 text-left hover:bg-secondary transition-colors ${
                            targetLanguage.code === lang.code ? 'bg-secondary' : ''
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Dub Button */}
              <Button
                onClick={handleDub}
                disabled={isProcessing || !audioFile}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Dubbing...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Dub to {targetLanguage.name}
                  </>
                )}
              </Button>

              {/* Output */}
              {outputUrl && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-sm font-medium text-green-500 mb-2">Dubbed Audio</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => playAudio(outputUrl)}
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      {isPlaying === outputUrl ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm">{targetLanguage.name} Version</p>
                    </div>
                    <a
                      href={outputUrl}
                      download
                      className="p-2 rounded-lg hover:bg-background/50 text-muted-foreground"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Usage History */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Recent Dubs</h2>
              {usageHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No dubbed audio yet</p>
              ) : (
                <div className="space-y-3">
                  {usageHistory.map((record) => (
                    <div key={record.id} className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${
                        record.status === 'completed' ? 'bg-green-500' : 
                        record.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{record.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      {record.status === 'processing' && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      {record.status === 'completed' && record.url && record.url !== 'processing' && (
                        <>
                          <button
                            onClick={() => playAudio(record.url)}
                            className="p-2 rounded-lg hover:bg-background/50"
                          >
                            {isPlaying === record.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <a
                            href={record.url}
                            download
                            className="p-2 rounded-lg hover:bg-background/50 text-muted-foreground"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}