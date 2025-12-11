import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mic,
  Play,
  Pause,
  Square,
  Trash2,
  FileAudio,
  Volume2,
  RotateCcw,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AudioFile {
  name: string;
  duration: number;
  url: string;
  type: 'uploaded' | 'recorded';
}

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAudio: (audio: AudioFile) => void;
}

// ============================================
// SLIDER COMPONENT
// ============================================

const Slider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}> = ({ value, onChange, min = 0, max = 100 }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e);
  };

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newValue = (x / rect.width) * (max - min) + min;
    onChange(Math.round(newValue));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updateValue(e);
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div
        ref={sliderRef}
        className="relative h-2 bg-muted rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute h-full bg-emerald-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};

// ============================================
// AUDIO PLAYER
// ============================================

const AudioPlayer: React.FC<{
  audio: AudioFile;
  onRemove: () => void;
}> = ({ audio, onRemove }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / audio.duration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= audio.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audio.duration]);

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>

      {/* Waveform / Progress */}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground min-w-[40px]">
            {formatTime(currentTime)}
          </span>

          {/* Waveform Visualization */}
          <div className="flex-1 h-10 flex items-center gap-[2px] relative">
            {Array.from({ length: 50 }).map((_, i) => {
              const height = Math.sin(i * 0.3) * 12 + 16;
              const isActive = (i / 50) * 100 <= progress;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-colors ${
                    isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          <span className="text-xs text-muted-foreground min-w-[40px]">
            {formatTime(audio.duration)}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <FileAudio className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{audio.name}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <div className="w-16">
          <Slider value={volume} onChange={setVolume} />
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
      >
        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
      </button>
    </div>
  );
};

// ============================================
// MAIN AUDIO UPLOAD MODAL
// ============================================

const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  isOpen,
  onClose,
  onUseAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [uploadedAudio, setUploadedAudio] = useState<AudioFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 300) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setHasRecording(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTime >= 5) {
      setHasRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    // Create audio file object
    const audio: AudioFile = {
      name: file.name,
      duration: 60, // Would be calculated from actual file
      url: URL.createObjectURL(file),
      type: 'uploaded',
    };
    setUploadedAudio(audio);
  };

  const handleUseAudio = () => {
    if (activeTab === 'upload' && uploadedAudio) {
      onUseAudio(uploadedAudio);
    } else if (activeTab === 'record' && hasRecording) {
      onUseAudio({
        name: 'Recorded Audio',
        duration: recordingTime,
        url: 'recorded-audio-url',
        type: 'recorded',
      });
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setUploadedAudio(null);
    setIsRecording(false);
    setRecordingTime(0);
    setHasRecording(false);
    setIsPlayingRecording(false);
    setActiveTab('upload');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Upload Audio</h2>
            <button
              onClick={resetAndClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-foreground border-b-2 border-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'record'
                  ? 'text-foreground border-b-2 border-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Record Audio
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'upload' ? (
              <>
                {uploadedAudio ? (
                  <AudioPlayer
                    audio={uploadedAudio}
                    onRemove={() => setUploadedAudio(null)}
                  />
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer transition-all border-2 border-dashed rounded-xl p-8 flex flex-col items-center ${
                      isDragOver
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-[1.02]'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-20 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <div className="absolute top-0 right-0 w-6 h-6 bg-muted-foreground/20 rounded-bl-lg" />
                        <div className="flex items-center gap-0.5">
                          {[3, 5, 7, 5, 8, 4, 6, 5, 3].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-emerald-500 rounded-full"
                              style={{ height: `${h * 3}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      Upload Speech Audio
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Audio: MP3, WAV Up to 20MB
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Drag and drop or click to browse
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Please record in a quiet environment. Your Avatar will perfectly match your accent, pitch, and emotions.
                </p>

                <div className="bg-muted/50 rounded-xl p-8 flex flex-col items-center w-full">
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {isRecording ? (
                      <Square className="w-6 h-6 text-white fill-white" />
                    ) : (
                      <Mic className="w-7 h-7 text-white" />
                    )}
                  </motion.button>

                  {isRecording ? (
                    <div className="mt-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-red-500 rounded-full"
                        />
                        <span className="text-lg font-medium text-foreground">
                          {formatTime(recordingTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Recording...</p>
                    </div>
                  ) : hasRecording ? (
                    <div className="mt-4 text-center">
                      <p className="text-sm font-medium text-foreground">Recording complete</p>
                      <p className="text-sm text-muted-foreground">{formatTime(recordingTime)}</p>
                      <button
                        onClick={() => setIsPlayingRecording(!isPlayingRecording)}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors mx-auto"
                      >
                        {isPlayingRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlayingRecording ? 'Pause' : 'Play'} preview
                      </button>
                      <button
                        onClick={() => {
                          setHasRecording(false);
                          setRecordingTime(0);
                        }}
                        className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Record again
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <p className="text-sm font-medium text-foreground">Start recording</p>
                      <p className="text-sm text-muted-foreground">
                        Duration should be between 5 and 300 seconds
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={handleUseAudio}
              disabled={
                (activeTab === 'upload' && !uploadedAudio) ||
                (activeTab === 'record' && !hasRecording)
              }
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                (activeTab === 'upload' && uploadedAudio) ||
                (activeTab === 'record' && hasRecording)
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Use This Audio
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioUploadModal;
