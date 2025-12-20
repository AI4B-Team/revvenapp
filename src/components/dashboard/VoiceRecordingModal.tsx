import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, X, StopCircle, RotateCcw, Sparkles, Loader2, 
  FileText, Play, Pause, Type, ChevronLeft, ChevronRight,
  Volume2, Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioBlob: Blob, duration: number) => void;
  title?: string;
}

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Turkish', 'Polish', 'Vietnamese', 'Thai', 'Indonesian'
];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function VoiceRecordingModal({
  isOpen,
  onClose,
  onSave,
  title = 'Record Voiceover'
}: VoiceRecordingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveTranscriptionEnabled, setLiveTranscriptionEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  
  // Teleprompter state
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState('');
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(50);
  const [teleprompterFontSize, setTeleprompterFontSize] = useState(24);
  const [isTeleprompterPlaying, setIsTeleprompterPlaying] = useState(false);
  const [teleprompterPosition, setTeleprompterPosition] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const teleprompterIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (isOpen) getMics();
  }, [isOpen]);

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

  const handleStartRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      audioChunksRef.current = [];
      
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
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setIsTeleprompterPlaying(false);
  };

  const handleSave = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsSaving(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await onSave(audioBlob, recordingTime);
      handleClose();
    } catch (err) {
      console.error('Error saving recording:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setRecordingTime(0);
    setLiveTranscript('');
    audioChunksRef.current = [];
    setTeleprompterPosition(0);
  };

  const handleClose = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setRecordingTime(0);
    setLiveTranscript('');
    audioChunksRef.current = [];
    setShowTeleprompter(false);
    setTeleprompterPosition(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teleprompter Panel */}
        {showTeleprompter && (
          <div className="bg-gray-900 text-white">
            <div className="p-4">
              <div className="relative h-40 overflow-hidden rounded-lg bg-gray-800">
                {teleprompterText ? (
                  <div 
                    className="absolute inset-x-0 px-4 transition-transform duration-100 ease-linear"
                    style={{ 
                      transform: `translateY(-${teleprompterPosition * 2}px)`,
                      fontSize: `${teleprompterFontSize}px`,
                      lineHeight: 1.6
                    }}
                  >
                    {teleprompterText}
                  </div>
                ) : (
                  <textarea
                    placeholder="Paste your script here..."
                    value={teleprompterText}
                    onChange={(e) => setTeleprompterText(e.target.value)}
                    className="w-full h-full bg-transparent resize-none p-4 text-gray-300 placeholder-gray-500 focus:outline-none"
                    style={{ fontSize: `${teleprompterFontSize}px` }}
                  />
                )}
              </div>
              
              {/* Teleprompter Controls */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setTeleprompterPosition(Math.max(0, teleprompterPosition - 20))}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs text-gray-400">🐢</span>
                  <Slider
                    value={[teleprompterSpeed]}
                    onValueChange={(v) => setTeleprompterSpeed(v[0])}
                    min={10}
                    max={90}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400">🐇</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTeleprompterFontSize(Math.max(16, teleprompterFontSize - 2))}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    A
                  </button>
                  <button
                    onClick={() => setTeleprompterFontSize(Math.min(36, teleprompterFontSize + 2))}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg font-bold"
                  >
                    A
                  </button>
                </div>
                
                <button
                  onClick={() => setTeleprompterPosition(teleprompterPosition + 20)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsTeleprompterPlaying(!isTeleprompterPlaying)}
                  className="p-2 bg-primary hover:opacity-90 rounded-lg"
                >
                  {isTeleprompterPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6">
          {/* Recording Visualization */}
          <div className="flex flex-col items-center py-4">
            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
              isRecording ? 'bg-rose-500/20' : 'bg-gray-100'
            }`}>
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-rose-500/10 animate-pulse" />
                </>
              )}
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-rose-500 hover:bg-rose-400' 
                    : 'bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500'
                }`}
              >
                {isRecording ? (
                  <StopCircle className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500">Start Recording</span>
              <div className="text-3xl font-mono text-gray-900">
                {formatTime(recordingTime)}
              </div>
              <span className="text-xs text-gray-400">-----</span>
            </div>
            
            <p className="text-sm text-gray-500">
              {isRecording ? 'Recording...' : 'Click to start recording'}
            </p>

            {/* Live Waveform */}
            {isRecording && (
              <div className="flex items-center gap-1 mt-4">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-rose-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Microphone Selector */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <select
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
            >
              {availableMics.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Teleprompter Toggle Button */}
          <button
            onClick={() => setShowTeleprompter(!showTeleprompter)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors mb-4 ${
              showTeleprompter 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            {showTeleprompter ? 'Hide Teleprompter' : 'Open Teleprompter'}
          </button>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={handleReset}
              disabled={recordingTime === 0}
              className="px-5 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button 
              disabled={recordingTime === 0 || isRecording || isSaving || audioChunksRef.current.length === 0}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Recording'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
