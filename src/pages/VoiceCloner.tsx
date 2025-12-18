import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Upload, Mic, Play, Pause, Trash2, 
  Clock, FileAudio, Loader2, Check, Copy, Download,
  StopCircle, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export default function VoiceCloner() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedVoices, setClonedVoices] = useState<any[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [testText, setTestText] = useState('Hello! This is a test of my cloned voice.');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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
        .eq('app_name', 'voice_cloner')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setUsageHistory(data);
      }
    };

    fetchHistory();
  }, []);

  // Fetch cloned voices
  useEffect(() => {
    const fetchClonedVoices = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_voices')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'cloned')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClonedVoices(data);
      }
    };

    fetchClonedVoices();
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
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recorded-audio.webm', { type: 'audio/webm' });
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorderRef.current.onstart = () => {
        (mediaRecorderRef.current as any).intervalId = interval;
      };
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      clearInterval((mediaRecorderRef.current as any).intervalId);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCloneVoice = async () => {
    if (!audioFile || !voiceName.trim()) {
      toast.error('Please provide a voice name and audio sample');
      return;
    }

    setIsCloning(true);

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

      // Call clone-voice edge function
      const { data, error } = await supabase.functions.invoke('clone-voice', {
        body: { 
          audioUrl: uploadData.secure_url, 
          voiceName: voiceName.trim() 
        }
      });

      if (error) throw error;

      // Record usage
      await supabase.from('audio_app_usage').insert({
        user_id: user.id,
        app_name: 'voice_cloner',
        input_audio_url: uploadData.secure_url,
        settings: { voice_name: voiceName },
        status: 'completed'
      });

      toast.success('Voice cloned successfully!');
      setVoiceName('');
      setAudioFile(null);
      setAudioUrl(null);

      // Refresh cloned voices
      const { data: voices } = await supabase
        .from('user_voices')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'cloned')
        .order('created_at', { ascending: false });

      if (voices) setClonedVoices(voices);

    } catch (error: any) {
      toast.error(error.message || 'Failed to clone voice');
      
      // Record failed attempt
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audio_app_usage').insert({
          user_id: user.id,
          app_name: 'voice_cloner',
          settings: { voice_name: voiceName },
          status: 'error',
          error_message: error.message
        });
      }
    } finally {
      setIsCloning(false);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col" style={{ marginLeft: isSidebarCollapsed ? '80px' : '256px' }}>
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                  <span className="text-3xl">🎤</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Voice Cloner</h1>
                  <p className="text-muted-foreground">Clone any voice with just a few seconds of audio</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Clone Voice Section */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-semibold mb-4">Clone a New Voice</h2>
                
                {/* Voice Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Voice Name</label>
                  <Input
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="Enter a name for this voice"
                    className="bg-background"
                  />
                </div>

                {/* Audio Upload/Record */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Voice Sample (10-30 seconds recommended)</label>
                  
                  {!audioUrl ? (
                    <div className="space-y-4">
                      {/* Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload audio file</span>
                        <span className="text-xs text-muted-foreground">MP3, WAV, M4A (max 10MB)</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* Record Button */}
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full p-6 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                          isRecording 
                            ? 'bg-red-500/10 border-2 border-red-500' 
                            : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <StopCircle className="w-8 h-8 text-red-500 animate-pulse" />
                            <span className="text-sm font-medium text-red-500">Recording... {formatTime(recordingTime)}</span>
                            <span className="text-xs text-muted-foreground">Click to stop</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to record</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-secondary rounded-xl flex items-center gap-4">
                      <button
                        onClick={() => playAudio(audioUrl)}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                      >
                        {isPlaying === audioUrl ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{audioFile?.name || 'Recorded Audio'}</p>
                        <p className="text-xs text-muted-foreground">
                          {audioFile && `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setAudioFile(null);
                          setAudioUrl(null);
                        }}
                        className="p-2 rounded-lg hover:bg-background/50 text-muted-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Clone Button */}
                <Button
                  onClick={handleCloneVoice}
                  disabled={isCloning || !audioFile || !voiceName.trim()}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                >
                  {isCloning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cloning Voice...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Clone Voice
                    </>
                  )}
                </Button>
              </div>

              {/* Cloned Voices List */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-semibold mb-4">Your Cloned Voices</h2>
                
                {clonedVoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No cloned voices yet</p>
                    <p className="text-sm">Clone your first voice to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clonedVoices.map((voice) => (
                      <div key={voice.id} className="p-4 bg-secondary rounded-xl flex items-center gap-4">
                        <button
                          onClick={() => voice.url && playAudio(voice.url)}
                          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                        >
                          {isPlaying === voice.url ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <div className="flex-1">
                          <p className="font-medium">{voice.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(voice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          className="p-2 rounded-lg hover:bg-background/50 text-muted-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(voice.elevenlabs_voice_id || '');
                            toast.success('Voice ID copied');
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Usage History */}
            <div className="mt-8 bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              {usageHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {usageHistory.map((record) => (
                    <div key={record.id} className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${
                        record.status === 'completed' ? 'bg-green-500' : 
                        record.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {record.settings?.voice_name || 'Voice Clone'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        record.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        record.status === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {record.status}
                      </span>
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