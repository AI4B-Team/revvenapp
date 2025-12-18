import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Upload, Mic, Play, Pause, Trash2, 
  Clock, FileAudio, Loader2, Download, StopCircle,
  Wand2, ChevronDown
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
  app_name: string;
  input_audio_url: string | null;
  output_audio_url: string | null;
  settings: any;
  status: string;
  created_at: string;
}

const VOICE_STYLES = [
  { id: 'deep', name: 'Deep Voice', description: 'Lower pitch, more resonant', hasReverb: false },
  { id: 'high', name: 'High Voice', description: 'Higher pitch, lighter tone', hasReverb: false },
  { id: 'robotic', name: 'Robotic', description: 'Mechanical, synthesized', hasReverb: false },
  { id: 'whisper', name: 'Female', description: 'Soft, hushed tone', hasReverb: false },
  { id: 'echo', name: 'Echo', description: 'Reverberating effect', hasReverb: true },
  { id: 'chipmunk', name: 'Chipmunk', description: 'High-pitched, fast', hasReverb: false },
];

// Apply reverb effect using Web Audio API
const applyReverbEffect = async (audioFile: File): Promise<File> => {
  const audioContext = new AudioContext();
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Create offline context for processing
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length + audioContext.sampleRate * 2, // Add 2 seconds for reverb tail
    audioBuffer.sampleRate
  );
  
  // Create source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  
  // Create convolver for reverb
  const convolver = offlineContext.createConvolver();
  
  // Generate impulse response for reverb effect
  const impulseLength = offlineContext.sampleRate * 2; // 2 second reverb
  const impulse = offlineContext.createBuffer(2, impulseLength, offlineContext.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < impulseLength; i++) {
      // Exponential decay with some randomness for natural reverb
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2.5);
    }
  }
  
  convolver.buffer = impulse;
  
  // Create gain nodes for dry/wet mix
  const dryGain = offlineContext.createGain();
  const wetGain = offlineContext.createGain();
  dryGain.gain.value = 0.6; // Original signal
  wetGain.gain.value = 0.5; // Reverb signal
  
  // Connect: source -> dry -> destination
  //          source -> convolver -> wet -> destination
  source.connect(dryGain);
  dryGain.connect(offlineContext.destination);
  
  source.connect(convolver);
  convolver.connect(wetGain);
  wetGain.connect(offlineContext.destination);
  
  source.start(0);
  
  // Render the audio
  const renderedBuffer = await offlineContext.startRendering();
  
  // Convert AudioBuffer to WAV file
  const wavBlob = audioBufferToWav(renderedBuffer);
  return new File([wavBlob], 'reverb-audio.wav', { type: 'audio/wav' });
};

// Convert AudioBuffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Interleave channels and write samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

export default function VoiceChanger() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(VOICE_STYLES[0]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

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
        .eq('app_name', 'voice_changer')
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
        setOutputUrl(null);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      (mediaRecorderRef.current as any).intervalId = interval;
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

  const handleChangeVoice = async () => {
    if (!audioFile) {
      toast.error('Please provide an audio file');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Apply reverb effect if the style has it
      let processedAudio = audioFile;
      if (selectedStyle.hasReverb) {
        toast.info('Applying reverb effect...');
        processedAudio = await applyReverbEffect(audioFile);
      }

      // Call ElevenLabs voice changer edge function
      const formData = new FormData();
      formData.append('audio', processedAudio);
      formData.append('style', selectedStyle.id);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/change-voice`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Voice transformation failed');
      }

      // Record usage
      await supabase.from('audio_app_usage').insert({
        user_id: user.id,
        app_name: 'voice_changer',
        input_audio_url: URL.createObjectURL(audioFile),
        output_audio_url: result.outputUrl,
        settings: { style: selectedStyle.id },
        status: 'completed'
      });

      setOutputUrl(result.outputUrl);
      toast.success('Voice transformed successfully!');

      // Refresh history
      const { data: history } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'voice_changer')
        .order('created_at', { ascending: false })
        .limit(20);

      if (history) setUsageHistory(history);

    } catch (error: any) {
      toast.error(error.message || 'Failed to change voice');
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

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('audio_app_usage')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      setUsageHistory(prev => prev.filter(r => r.id !== recordId));
      toast.success('Transformation deleted');
    } catch (error) {
      toast.error('Failed to delete');
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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
                  <span className="text-3xl">🎵</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Voice Changer</h1>
                  <p className="text-muted-foreground">Transform your voice with AI-powered effects</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              {/* Audio Upload/Record */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload or Record Audio</label>
                
                {!audioUrl ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload Audio</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-6 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                        isRecording 
                          ? 'bg-red-500/10 border-2 border-red-500' 
                          : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <StopCircle className="w-8 h-8 text-red-500 animate-pulse" />
                          <span className="text-sm text-red-500">{formatTime(recordingTime)}</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Record</span>
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
              </div>

              {/* Voice Style Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Voice Style</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full p-4 bg-secondary rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-medium text-left">{selectedStyle.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedStyle.description}</p>
                      </div>
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="max-h-64 overflow-y-auto">
                      {VOICE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style)}
                          className={`w-full p-4 text-left hover:bg-secondary transition-colors ${
                            selectedStyle.id === style.id ? 'bg-secondary' : ''
                          }`}
                        >
                          <p className="font-medium">{style.name}</p>
                          <p className="text-sm text-muted-foreground">{style.description}</p>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Transform Button */}
              <Button
                onClick={handleChangeVoice}
                disabled={isProcessing || !audioFile}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Transform Voice
                  </>
                )}
              </Button>

              {/* Output */}
              {outputUrl && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-sm font-medium text-green-500 mb-2">Transformed Audio</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => playAudio(outputUrl)}
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      {isPlaying === outputUrl ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm">Output ({selectedStyle.name})</p>
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

            {/* Usage History - Grouped by Voice Style */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Recent Transformations</h2>
              {usageHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transformations yet</p>
              ) : (
                <div className="space-y-6">
                  {VOICE_STYLES.map((style) => {
                    const styleRecords = usageHistory.filter(r => r.settings?.style === style.id);
                    if (styleRecords.length === 0) return null;
                    
                    return (
                      <div key={style.id}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">{style.name}</h3>
                        <div className="space-y-2">
                          {styleRecords.map((record) => (
                            <div key={record.id} className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                              <div className={`w-2 h-2 rounded-full ${
                                record.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <div className="flex-1">
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
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}