import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, X, StopCircle, RotateCcw, Sparkles, Loader2,
  FileText, Play, Pause, ChevronLeft, ChevronRight,
  Video, Monitor, MonitorPlay, Headphones, Settings,
  Camera, Globe, Volume2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioBlob: Blob, duration: number, transcript?: string) => void;
  title?: string;
}

type RecordingType = 'voiceover' | 'camera' | 'screen' | 'screen-camera' | null;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'ita', label: 'Italian' },
  { code: 'por', label: 'Portuguese' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'kor', label: 'Korean' },
  { code: 'cmn', label: 'Chinese' },
  { code: 'ara', label: 'Arabic' },
  { code: 'hin', label: 'Hindi' },
  { code: 'rus', label: 'Russian' },
];

const AUDIO_QUALITIES = [
  { value: 'high', label: 'High Quality' },
  { value: 'medium', label: 'Medium Quality' },
  { value: 'low', label: 'Low Quality' },
];

export default function RecordModal({
  isOpen,
  onClose,
  onSave,
  title = 'Record'
}: RecordModalProps) {
  const [selectedType, setSelectedType] = useState<RecordingType>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);

  // Real-time transcription state
  const [enableTranscription, setEnableTranscription] = useState(true);
  const [language, setLanguage] = useState('eng');
  const [audioQuality, setAudioQuality] = useState('high');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const transcriptChunksRef = useRef<string[]>([]);

  // Teleprompter state
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState('');
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(50);
  const [teleprompterFontSize, setTeleprompterFontSize] = useState(24);
  const [isTeleprompterPlaying, setIsTeleprompterPlaying] = useState(false);
  const [teleprompterPosition, setTeleprompterPosition] = useState(0);

  // Audio visualization
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(40).fill(10));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const teleprompterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get available microphones
  useEffect(() => {
    const getMics = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === 'audioinput');
        setAvailableMics(mics);
        if (mics.length > 0 && !selectedMic) {
          setSelectedMic(mics[0].deviceId);
        }
      } catch (err) {
        console.log('Could not enumerate devices');
      }
    };
    if (isOpen && selectedType) getMics();
  }, [isOpen, selectedType]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Audio visualization
  useEffect(() => {
    if (isRecording && analyserRef.current) {
      const updateLevels = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const levels: number[] = [];
        const sliceWidth = Math.floor(dataArray.length / 40);
        for (let i = 0; i < 40; i++) {
          const start = i * sliceWidth;
          const end = start + sliceWidth;
          const slice = dataArray.slice(start, end);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          levels.push(Math.max(10, (avg / 255) * 80));
        }
        setAudioLevels(levels);
        
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevels(Array(40).fill(10));
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // Teleprompter auto-scroll
  useEffect(() => {
    if (isTeleprompterPlaying && showTeleprompter) {
      teleprompterIntervalRef.current = setInterval(() => {
        setTeleprompterPosition(prev => prev + 1);
      }, 100 - teleprompterSpeed);
    } else {
      if (teleprompterIntervalRef.current) {
        clearInterval(teleprompterIntervalRef.current);
      }
    }
    return () => {
      if (teleprompterIntervalRef.current) {
        clearInterval(teleprompterIntervalRef.current);
      }
    };
  }, [isTeleprompterPlaying, showTeleprompter, teleprompterSpeed]);

  // Start/stop teleprompter with recording
  useEffect(() => {
    if (isRecording && showTeleprompter && teleprompterText) {
      setIsTeleprompterPlaying(true);
    }
    if (!isRecording) {
      setIsTeleprompterPlaying(false);
    }
  }, [isRecording, showTeleprompter, teleprompterText]);

  // Periodic transcription during recording
  useEffect(() => {
    if (isRecording && enableTranscription) {
      // Transcribe every 5 seconds
      transcriptionIntervalRef.current = setInterval(async () => {
        if (audioChunksRef.current.length > 0) {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            await transcribeAudioChunk(audioBlob);
          } catch (err) {
            console.error('Error transcribing chunk:', err);
          }
        }
      }, 5000);
    }
    
    return () => {
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
      }
    };
  }, [isRecording, enableTranscription]);

  const transcribeAudioChunk = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1] || base64);
        };
        reader.readAsDataURL(audioBlob);
      });
      
      const base64Audio = await base64Promise;
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          audioBase64: base64Audio,
          filename: 'recording.webm',
          contentType: 'audio/webm',
        },
      });

      if (error) throw error;
      
      if (data?.text) {
        setLiveTranscript(data.text);
      }
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      audioChunksRef.current = [];
      setLiveTranscript('');
      transcriptChunksRef.current = [];

      // Set up audio analyser for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      setTeleprompterPosition(0);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (transcriptionIntervalRef.current) {
      clearInterval(transcriptionIntervalRef.current);
    }
    setIsRecording(false);
    setIsTeleprompterPlaying(false);
    analyserRef.current = null;
  };

  const handleSaveAndTranscribe = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsSaving(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Final transcription if enabled
      let finalTranscript = liveTranscript;
      if (enableTranscription && !finalTranscript) {
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1] || base64);
            };
            reader.readAsDataURL(audioBlob);
          });
          
          const base64Audio = await base64Promise;
          
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: {
              audioBase64: base64Audio,
              filename: 'recording.webm',
              contentType: 'audio/webm',
            },
          });

          if (!error && data?.text) {
            finalTranscript = data.text;
          }
        } catch (err) {
          console.error('Final transcription error:', err);
        }
      }
      
      await onSave(audioBlob, recordingTime, finalTranscript);
      toast.success('Recording saved with transcript');
      handleClose();
    } catch (err) {
      console.error('Error saving recording:', err);
      toast.error('Failed to save recording');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setRecordingTime(0);
    audioChunksRef.current = [];
    setLiveTranscript('');
    setTeleprompterPosition(0);
  };

  const handleClose = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setRecordingTime(0);
    audioChunksRef.current = [];
    setShowTeleprompter(false);
    setTeleprompterPosition(0);
    setSelectedType(null);
    setLiveTranscript('');
    onClose();
  };

  const handleBack = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setRecordingTime(0);
    audioChunksRef.current = [];
    setShowTeleprompter(false);
    setTeleprompterPosition(0);
    setSelectedType(null);
    setLiveTranscript('');
  };

  const recordingOptions = [
    {
      id: 'voiceover' as const,
      label: 'Voiceover',
      icon: Headphones,
      description: 'Record audio narration',
      gradient: 'from-violet-500/10 to-violet-600/10',
      hoverGradient: 'from-violet-500/20 to-violet-600/20',
      iconColor: 'text-violet-500',
      visual: (
        <div className="flex items-center justify-center gap-0.5">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-violet-400 rounded-full"
              style={{ height: `${Math.random() * 20 + 8}px` }}
            />
          ))}
        </div>
      )
    },
    {
      id: 'camera' as const,
      label: 'Camera',
      icon: Video,
      description: 'Record from webcam',
      gradient: 'from-blue-500/10 to-blue-600/10',
      hoverGradient: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-500',
      visual: (
        <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
      )
    },
    {
      id: 'screen' as const,
      label: 'Screen',
      icon: Monitor,
      description: 'Record your screen',
      gradient: 'from-emerald-500/10 to-emerald-600/10',
      hoverGradient: 'from-emerald-500/20 to-emerald-600/20',
      iconColor: 'text-emerald-500',
      visual: (
        <div className="w-16 h-10 rounded-md border border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
          <div className="w-10 h-6 rounded-sm bg-white border border-emerald-200 flex items-center justify-center">
            <div className="w-6 h-3 bg-emerald-300/50 rounded-sm" />
          </div>
        </div>
      )
    },
    {
      id: 'screen-camera' as const,
      label: 'Screen & Camera',
      icon: MonitorPlay,
      description: 'Record both at once',
      gradient: 'from-amber-500/10 to-amber-600/10',
      hoverGradient: 'from-amber-500/20 to-amber-600/20',
      iconColor: 'text-amber-500',
      visual: (
        <div className="relative w-16 h-10">
          <div className="w-14 h-9 rounded-md border border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
            <div className="w-8 h-5 rounded-sm bg-white border border-amber-200" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-white flex items-center justify-center">
            <Camera className="w-3 h-3 text-white" />
          </div>
        </div>
      )
    }
  ];

  // Render type selection view
  if (!selectedType) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-4xl p-0 overflow-hidden [&>button]:hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold text-gray-900 whitespace-nowrap">Choose Recording Mode</DialogTitle>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recordingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedType(option.id)}
                  className={`group relative p-6 rounded-2xl border-2 border-dashed transition-all duration-300 border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-white`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 bg-gradient-to-br ${option.gradient} group-hover:${option.hoverGradient}`}>
                      {option.visual}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Unified recording view for all types
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-5xl p-0 overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-b from-violet-500 via-purple-500 to-blue-500">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 z-10 p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Handle/Drawer indicator */}
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-white/30" />
          </div>

          {/* Main content area - audio waves and timer only */}
          <div className="flex flex-col items-center justify-center px-8 py-10">
            {showTeleprompter ? (
              <div className="w-full max-w-2xl">
                {/* Teleprompter content */}
                <div className="relative h-48 overflow-hidden rounded-lg mb-6">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400 rounded-full" />
                  {teleprompterText ? (
                    <div
                      className="absolute inset-x-0 px-6 transition-transform duration-100 ease-linear text-white/90"
                      style={{
                        transform: `translateY(-${teleprompterPosition * 2}px)`,
                        fontSize: `${teleprompterFontSize}px`,
                        lineHeight: 1.8
                      }}
                    >
                      {teleprompterText}
                    </div>
                  ) : (
                    <textarea
                      placeholder="Start typing or paste text here..."
                      value={teleprompterText}
                      onChange={(e) => setTeleprompterText(e.target.value)}
                      className="w-full h-full bg-transparent resize-none px-6 py-4 text-white/80 placeholder-white/40 focus:outline-none"
                      style={{ fontSize: `${teleprompterFontSize}px` }}
                    />
                  )}
                </div>

                {/* Waveform visualization */}
                <div className="flex items-center justify-center gap-0.5 h-16">
                  {audioLevels.map((level, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${isRecording ? 'bg-white' : 'bg-white/30'}`}
                      style={{ height: `${isRecording ? level : 10}px` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Waveform visualization - only show animated when recording */}
                <div className="flex items-center justify-center gap-1 h-24 mb-6">
                  {audioLevels.map((level, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-75 ${isRecording ? 'bg-white' : 'bg-white/30'}`}
                      style={{ height: `${isRecording ? level : 10}px` }}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-5xl font-mono font-light text-white mb-2">
                  {formatTime(recordingTime)}
                </div>

                <p className="text-white/70 text-sm">
                  {isRecording ? 'Recording...' : 'Click Record To Start'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-center gap-6">
            {/* Record button - FIRST */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-gray-900 hover:bg-gray-800'
                  : 'bg-rose-500 hover:bg-rose-400'
              }`}>
                {isRecording ? (
                  <StopCircle className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </div>
              <span className={`text-xs ${isRecording ? 'text-gray-900' : 'text-rose-500'}`}>
                {isRecording ? 'Stop' : 'Record'}
              </span>
            </button>

            {/* Camera */}
            <button 
              onClick={() => {
                if (selectedType === 'voiceover') {
                  setSelectedType('camera');
                } else if (selectedType === 'screen') {
                  setSelectedType('screen-camera');
                } else if (selectedType === 'screen-camera') {
                  setSelectedType('screen');
                } else {
                  setSelectedType('voiceover');
                }
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                selectedType === 'camera' || selectedType === 'screen-camera' 
                  ? 'text-blue-500' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedType === 'camera' || selectedType === 'screen-camera'
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}>
                <Video className="w-5 h-5" />
              </div>
              <span className="text-xs">Camera</span>
            </button>

            {/* Screen */}
            <button 
              onClick={() => {
                if (selectedType === 'voiceover' || selectedType === 'camera') {
                  setSelectedType('screen');
                } else if (selectedType === 'screen') {
                  setSelectedType('voiceover');
                } else if (selectedType === 'screen-camera') {
                  setSelectedType('camera');
                }
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${
                selectedType === 'screen' || selectedType === 'screen-camera' 
                  ? 'text-emerald-500' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedType === 'screen' || selectedType === 'screen-camera'
                  ? 'bg-emerald-100'
                  : 'bg-gray-100'
              }`}>
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-xs">Screen</span>
            </button>

            {/* Size */}
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
                <Monitor className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 text-[8px] bg-violet-500 text-white px-1 rounded">16:9</span>
              </div>
              <span className="text-xs">Size</span>
            </button>

            {/* Background */}
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-white" />
              </div>
              <span className="text-xs">Background</span>
            </button>

            {/* Prompter */}
            <button
              onClick={() => setShowTeleprompter(!showTeleprompter)}
              className={`flex flex-col items-center gap-1 transition-colors ${showTeleprompter ? 'text-violet-500' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showTeleprompter ? 'bg-violet-100' : 'bg-gray-100'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs">Prompter</span>
            </button>

            {/* Settings */}
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>

        {/* Transcription options - BELOW controls bar */}
        {!showTeleprompter && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            {/* Real-time transcription toggle */}
            <div className="w-full max-w-md mx-auto bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${enableTranscription ? 'text-emerald-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Real-Time Transcription</span>
                </div>
                <Switch
                  checked={enableTranscription}
                  onCheckedChange={setEnableTranscription}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                {isRecording && enableTranscription && liveTranscript 
                  ? liveTranscript.slice(-100) + (liveTranscript.length > 100 ? '...' : '')
                  : 'Start recording to see your words appear'}
              </p>
              {isTranscribing && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                  <span className="text-xs text-emerald-500">Transcribing...</span>
                </div>
              )}
            </div>

            {/* Language and Quality selectors */}
            <div className="flex gap-4 w-full max-w-md mx-auto">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-gray-900 hover:bg-gray-100">
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Audio Quality</label>
                <Select value={audioQuality} onValueChange={setAudioQuality}>
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {AUDIO_QUALITIES.map((quality) => (
                      <SelectItem key={quality.value} value={quality.value} className="text-gray-900 hover:bg-gray-100">
                        {quality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Teleprompter Controls (when showing) */}
        {showTeleprompter && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <button
                onClick={() => setTeleprompterPosition(Math.max(0, teleprompterPosition - 20))}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsTeleprompterPlaying(!isTeleprompterPlaying)}
                className="p-2 bg-violet-500 hover:bg-violet-400 rounded-lg text-white"
              >
                {isTeleprompterPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setTeleprompterPosition(teleprompterPosition + 20)}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {recordingTime > 0 && !isRecording && (
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                disabled={isSaving || audioChunksRef.current.length === 0}
                onClick={handleSaveAndTranscribe}
                className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save & Transcribe'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
