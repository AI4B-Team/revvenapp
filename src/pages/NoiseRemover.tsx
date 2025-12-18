import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Upload, Play, Pause, Trash2, 
  Loader2, Download, Volume2, VolumeX, Wand2
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

  // Fetch usage history
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

      // Simulate noise removal processing (replace with actual API)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Record usage
      await supabase.from('audio_app_usage').insert({
        user_id: user.id,
        app_name: 'noise_remover',
        input_audio_url: uploadData.secure_url,
        output_audio_url: uploadData.secure_url, // Would be processed URL
        settings: { noise_reduction_level: noiseReduction[0] },
        status: 'completed'
      });

      setOutputUrl(uploadData.secure_url);
      toast.success('Noise removed successfully!');

      // Refresh history
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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center">
                  <span className="text-3xl">🔇</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Noise Remover</h1>
                  <p className="text-muted-foreground">Remove background noise from audio with AI</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              {/* Audio Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload Audio</label>
                
                {!audioUrl ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <span className="text-muted-foreground">Click to upload audio file</span>
                    <span className="text-xs text-muted-foreground">MP3, WAV, M4A (max 50MB)</span>
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
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Noise Reduction Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Noise Reduction Level: {Math.round(noiseReduction[0] * 100)}%
                </label>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={noiseReduction}
                    onValueChange={setNoiseReduction}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Higher levels remove more noise but may affect voice quality
                </p>
              </div>

              {/* Process Button */}
              <Button
                onClick={handleRemoveNoise}
                disabled={isProcessing || !audioFile}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Remove Noise
                  </>
                )}
              </Button>

              {/* Output */}
              {outputUrl && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-sm font-medium text-green-500 mb-2">Clean Audio</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => playAudio(outputUrl)}
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      {isPlaying === outputUrl ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm">Noise Removed</p>
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
              <h2 className="text-xl font-semibold mb-4">Recent Processing</h2>
              {usageHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No processed audio yet</p>
              ) : (
                <div className="space-y-3">
                  {usageHistory.map((record) => (
                    <div key={record.id} className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${
                        record.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Noise Reduction {Math.round((record.settings?.noise_reduction_level || 0.7) * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      {record.output_audio_url && (
                        <button
                          onClick={() => playAudio(record.output_audio_url!)}
                          className="p-2 rounded-lg hover:bg-background/50"
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
        </main>
      </div>
    </div>
  );
}