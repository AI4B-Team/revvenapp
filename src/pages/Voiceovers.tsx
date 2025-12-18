import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Play, Pause, Loader2, Download, 
  Volume2, ChevronDown, Copy, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VoiceRecord {
  id: string;
  name: string;
  url: string;
  prompt: string | null;
  status: string;
  created_at: string;
  type: string;
}

const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'Female' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'Male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'Female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'Male' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'Male' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'Male' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', gender: 'Neutral' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'Male' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'Female' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'Female' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'Female' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', gender: 'Male' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'Female' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', gender: 'Male' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'Male' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'Male' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'Male' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'Female' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'Male' },
];

export default function Voiceovers() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<VoiceRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [stability, setStability] = useState([0.5]);
  const [similarity, setSimilarity] = useState([0.75]);
  const [speed, setSpeed] = useState([1.0]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch usage history
  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_voices')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'voiceover')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setUsageHistory(data);
      }
    };

    fetchHistory();
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call the generate-voiceover edge function
      const { data, error } = await supabase.functions.invoke('generate-voiceover', {
        body: {
          text: text.trim(),
          voice: selectedVoice.id,
          voiceName: selectedVoice.name,
          stability: stability[0],
          similarity_boost: similarity[0],
          speed: speed[0]
        }
      });

      if (error) throw error;

      const voiceRecordId = data.id;
      toast.info('Generating voiceover...');

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: voiceRecord } = await supabase
          .from('user_voices')
          .select('*')
          .eq('id', voiceRecordId)
          .single();

        if (voiceRecord?.status === 'completed' && voiceRecord?.url) {
          setOutputUrl(voiceRecord.url);
          
          toast.success('Voiceover generated!');

          // Refresh history from user_voices
          const { data: history } = await supabase
            .from('user_voices')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'voiceover')
            .order('created_at', { ascending: false })
            .limit(20);

          if (history) setUsageHistory(history);
          break;
        } else if (voiceRecord?.status === 'error') {
          throw new Error('Voice generation failed');
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Voice generation timed out');
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to generate voiceover');
    } finally {
      setIsGenerating(false);
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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Voiceovers</h1>
                  <p className="text-muted-foreground">Generate professional voiceovers with AI</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              {/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Text to Convert</label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-[150px] bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {text.length} characters
                </p>
              </div>

              {/* Voice Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Voice</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full p-4 bg-secondary rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{selectedVoice.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedVoice.gender}</p>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="max-h-64 overflow-y-auto">
                      {VOICES.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice)}
                          className={`w-full p-4 text-left hover:bg-secondary transition-colors flex items-center gap-3 ${
                            selectedVoice.id === voice.id ? 'bg-secondary' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Volume2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{voice.name}</p>
                            <p className="text-sm text-muted-foreground">{voice.gender}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Voice Settings */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Stability: {stability[0].toFixed(2)}</label>
                  <Slider
                    value={stability}
                    onValueChange={setStability}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Clarity: {similarity[0].toFixed(2)}</label>
                  <Slider
                    value={similarity}
                    onValueChange={setSimilarity}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Speed: {speed[0].toFixed(2)}x</label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0.7}
                    max={1.2}
                    step={0.01}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Voiceover
                  </>
                )}
              </Button>

              {/* Output */}
              {outputUrl && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-sm font-medium text-green-500 mb-2">Generated Voiceover</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => playAudio(outputUrl)}
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"
                    >
                      {isPlaying === outputUrl ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm">{selectedVoice.name}</p>
                    </div>
                    <a
                      href={outputUrl}
                      download="voiceover.mp3"
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
              <h2 className="text-xl font-semibold mb-4">Recent Voiceovers</h2>
              {usageHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No voiceovers yet</p>
              ) : (
                <div className="space-y-3">
                  {usageHistory.map((record) => (
                    <div key={record.id} className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${
                        record.status === 'completed' ? 'bg-green-500' : record.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {record.prompt?.substring(0, 50) || record.name}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      {record.url && record.status === 'completed' && (
                        <button
                          onClick={() => playAudio(record.url)}
                          className="p-2 rounded-lg hover:bg-background/50"
                        >
                          {isPlaying === record.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      )}
                      {record.status === 'processing' && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
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