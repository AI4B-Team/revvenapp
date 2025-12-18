import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Upload, Play, Pause, Trash2, 
  Loader2, Download, Volume2, VolumeX, Wand2,
  Waves, Sparkles, CheckCircle2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UsageRecord {
  id: string;
  app_name: string;
  input_audio_url: string | null;
  output_audio_url: string | null;
  settings: any;
  status: string;
  created_at: string;
}

export default function NoiseRemover() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [noiseReduction, setNoiseReduction] = useState([0.7]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'noise_remover')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setUsageHistory(data);
      }
    };

    fetchHistory();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please upload an audio file');
        return;
      }
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setOutputUrl(null);
    }
  };

  const handleRemoveNoise = async () => {
    if (!audioFile) {
      toast.error('Please upload an audio file');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('upload_preset', 'revven');

      const uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/dszt275xv/upload',
        { method: 'POST', body: formData }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) throw new Error('Upload failed');

      await new Promise(resolve => setTimeout(resolve, 3000));

      await supabase.from('audio_app_usage').insert({
        user_id: user.id,
        app_name: 'noise_remover',
        input_audio_url: uploadData.secure_url,
        output_audio_url: uploadData.secure_url,
        settings: { noise_reduction_level: noiseReduction[0] },
        status: 'completed'
      });

      setOutputUrl(uploadData.secure_url);
      toast.success('Noise removed successfully!');

      const { data: history } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'noise_remover')
        .order('created_at', { ascending: false })
        .limit(20);

      if (history) setUsageHistory(history);

    } catch (error: any) {
      toast.error(error.message || 'Failed to remove noise');
    } finally {
      setIsProcessing(false);
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
      
      <div className="flex-1 flex flex-col" style={{ marginLeft: isSidebarCollapsed ? '80px' : '256px' }}>
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Animated Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ marginLeft: isSidebarCollapsed ? '80px' : '256px' }}>
            <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/create')}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-all"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Create</span>
            </button>

            {/* Hero Header */}
            <div className="mb-10">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <VolumeX className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    AI Noise Remover
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Crystal-clear audio with AI-powered noise reduction
                  </p>
                </div>
              </div>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['Background Noise', 'Wind Removal', 'Echo Reduction', 'Hum Elimination'].map((feature) => (
                  <span key={feature} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Card */}
                <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Upload Audio</h2>
                      <p className="text-sm text-muted-foreground">Select an audio file to clean</p>
                    </div>
                  </div>
                  
                  {!audioUrl ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-10 border-2 border-dashed border-emerald-500/30 rounded-2xl hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Waves className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-lg font-medium text-foreground block">Drop audio here or click to upload</span>
                          <span className="text-sm text-muted-foreground">MP3, WAV, M4A up to 50MB</span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => playAudio(audioUrl)}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 hover:scale-105 transition-transform"
                        >
                          {isPlaying === audioUrl ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </button>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{audioFile?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {audioFile && `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setAudioFile(null);
                            setAudioUrl(null);
                            setOutputUrl(null);
                          }}
                          className="p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Waveform Visualization */}
                      <div className="mt-4 flex items-center justify-center gap-1 h-12">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full bg-emerald-400/60 ${isPlaying === audioUrl ? 'animate-pulse' : ''}`}
                            style={{ 
                              height: `${Math.random() * 100}%`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Settings Card */}
                <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Noise Reduction</h2>
                      <p className="text-sm text-muted-foreground">Adjust the intensity level</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reduction Level</span>
                      <span className="text-2xl font-bold text-emerald-400">{Math.round(noiseReduction[0] * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-4 py-2">
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                      <Slider
                        value={noiseReduction}
                        onValueChange={setNoiseReduction}
                        min={0.1}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <Volume2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-xs text-muted-foreground bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                      💡 Higher levels remove more noise but may slightly affect voice quality
                    </p>
                  </div>

                  <Button
                    onClick={handleRemoveNoise}
                    disabled={isProcessing || !audioFile}
                    className="w-full mt-6 h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-2xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Audio...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Remove Noise
                      </>
                    )}
                  </Button>
                </div>

                {/* Output Card */}
                {outputUrl && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl p-8 border border-emerald-500/30 shadow-xl animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-emerald-400">Clean Audio Ready</h2>
                        <p className="text-sm text-muted-foreground">Your processed audio is ready to download</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl">
                      <button
                        onClick={() => playAudio(outputUrl)}
                        className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white hover:scale-105 transition-transform"
                      >
                        {isPlaying === outputUrl ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold">Cleaned Audio</p>
                        <p className="text-sm text-muted-foreground">Noise removed at {Math.round(noiseReduction[0] * 100)}%</p>
                      </div>
                      <a
                        href={outputUrl}
                        download
                        className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* History Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-6 border border-border/50 shadow-xl sticky top-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <h2 className="text-lg font-semibold">Recent</h2>
                  </div>
                  
                  {usageHistory.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Waves className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">No processed audio yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {usageHistory.map((record) => (
                        <div key={record.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors group">
                          <div className={`w-2 h-2 rounded-full ${
                            record.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {Math.round((record.settings?.noise_reduction_level || 0.7) * 100)}% Reduction
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {record.output_audio_url && (
                            <button
                              onClick={() => playAudio(record.output_audio_url!)}
                              className="p-2 rounded-lg hover:bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {isPlaying === record.output_audio_url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      ))}
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
}
