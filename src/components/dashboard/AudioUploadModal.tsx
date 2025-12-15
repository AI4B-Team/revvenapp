import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Loader2,
  Clock,
  Calendar,
  ChevronDown,
  Filter,
  Copy,
  Upload,
  Wand2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================
// TYPES
// ============================================

export interface AudioFile {
  name: string;
  duration: number;
  url: string;
  type: 'uploaded' | 'recorded';
}

interface SavedVoice {
  id: string;
  name: string;
  duration: number;
  url: string;
  type: string;
  created_at: string;
  language?: string;
  accent?: string;
  gender?: string;
}

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAudio: (audio: AudioFile) => void;
  mode?: 'all' | 'clone'; // 'clone' shows only Clone tab
}

// Filter options
const LANGUAGES = ['All', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'];
const ACCENTS = ['All', 'American', 'British', 'Australian', 'Indian', 'Irish', 'Scottish', 'Canadian', 'South African', 'Neutral'];
const GENDERS = ['All', 'Male', 'Female', 'Neutral', 'Non-binary'];

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audio.url) {
      audioRef.current = new Audio(audio.url);
      audioRef.current.volume = volume / 100;
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audio.url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audio.duration > 0 ? (currentTime / audio.duration) * 100 : 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
      <button
        onClick={togglePlay}
        className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground min-w-[40px]">
            {formatTime(currentTime)}
          </span>

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

      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <div className="w-16">
          <Slider value={volume} onChange={setVolume} />
        </div>
      </div>

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
// VOICE CARD COMPONENT
// ============================================

const VoiceCard: React.FC<{
  voice: SavedVoice;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}> = ({ voice, onSelect, onDelete, isDeleting }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!audioRef.current) {
      audioRef.current = new Audio(voice.url);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div 
      onClick={onSelect}
      className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors group border border-transparent hover:border-emerald-500/30"
    >
      <button
        onClick={togglePlay}
        className="w-10 h-10 bg-emerald-500/20 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-colors flex-shrink-0 group-hover:bg-emerald-500"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-emerald-500 group-hover:text-white" />
        ) : (
          <Play className="w-4 h-4 text-emerald-500 group-hover:text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{voice.name}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(voice.duration)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(voice.created_at)}
          </span>
          <span className="capitalize px-1.5 py-0.5 bg-muted rounded text-[10px]">
            {voice.type}
          </span>
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        )}
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
  mode = 'all',
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'voices' | 'upload' | 'record' | 'clone'>(mode === 'clone' ? 'clone' : 'voices');
  const [uploadedAudio, setUploadedAudio] = useState<AudioFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // My Voices state
  const [savedVoices, setSavedVoices] = useState<SavedVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [deletingVoiceId, setDeletingVoiceId] = useState<string | null>(null);
  
  // Filter state
  const [languageFilter, setLanguageFilter] = useState('All');
  const [accentFilter, setAccentFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  
  // Filtered voices
  const filteredVoices = useMemo(() => {
    return savedVoices.filter(voice => {
      const matchesLanguage = languageFilter === 'All' || voice.language === languageFilter;
      const matchesAccent = accentFilter === 'All' || voice.accent === accentFilter;
      const matchesGender = genderFilter === 'All' || voice.gender === genderFilter;
      return matchesLanguage && matchesAccent && matchesGender;
    });
  }, [savedVoices, languageFilter, accentFilter, genderFilter]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clone voice state
  const [cloneVoiceName, setCloneVoiceName] = useState('');
  const [cloneAudioFile, setCloneAudioFile] = useState<File | null>(null);
  const [cloneAudioUrl, setCloneAudioUrl] = useState<string | null>(null);
  const [cloneAudioDuration, setCloneAudioDuration] = useState<number>(0);
  const [cloneRemoveNoise, setCloneRemoveNoise] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [isPlayingClonePreview, setIsPlayingClonePreview] = useState(false);
  const [cloneInputMode, setCloneInputMode] = useState<'upload' | 'record'>('upload');
  const [isCloneRecording, setIsCloneRecording] = useState(false);
  const [cloneRecordingTime, setCloneRecordingTime] = useState(0);
  const [cloneRecordedBlob, setCloneRecordedBlob] = useState<Blob | null>(null);
  const cloneFileInputRef = useRef<HTMLInputElement>(null);
  const cloneAudioRef = useRef<HTMLAudioElement | null>(null);
  const cloneMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cloneAudioChunksRef = useRef<Blob[]>([]);
  const cloneRecordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved voices when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSavedVoices();
    }
  }, [isOpen]);

  const loadSavedVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_voices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enhancedVoices: SavedVoice[] = (data || []).map((voice: any) => ({
        ...voice,
        language: voice.language ?? 'English',
        accent: voice.accent ?? 'Neutral',
        gender: voice.gender ?? 'Neutral',
      }));

      setSavedVoices(enhancedVoices);
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const saveVoiceToDatabase = async (audio: AudioFile, cloudinaryPublicId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_voices')
        .insert({
          user_id: user.id,
          name: audio.name,
          duration: audio.duration,
          url: audio.url,
          type: audio.type,
          cloudinary_public_id: cloudinaryPublicId || null,
        });

      if (error) throw error;
      
      // Refresh the voices list
      await loadSavedVoices();
      
      toast({
        title: "Voice saved",
        description: "Your voice has been saved to My Voices.",
      });
    } catch (error) {
      console.error('Error saving voice:', error);
      toast({
        title: "Save failed",
        description: "Failed to save voice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteVoice = async (voiceId: string) => {
    setDeletingVoiceId(voiceId);
    try {
      const { error } = await supabase
        .from('user_voices')
        .delete()
        .eq('id', voiceId);

      if (error) throw error;
      
      setSavedVoices(prev => prev.filter(v => v.id !== voiceId));
      
      toast({
        title: "Voice deleted",
        description: "The voice has been removed.",
      });
    } catch (error) {
      console.error('Error deleting voice:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingVoiceId(null);
    }
  };

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
      setRecordedBlob(null);
      setRecordedUrl(null);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTime >= 5) {
      setHasRecording(true);
    }
  };

  const playRecordedAudio = () => {
    if (!recordedUrl) return;
    
    if (isPlayingRecording && recordedAudioRef.current) {
      recordedAudioRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      recordedAudioRef.current = new Audio(recordedUrl);
      recordedAudioRef.current.onended = () => setIsPlayingRecording(false);
      recordedAudioRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadToCloudinary = async (file: File | Blob, filename: string): Promise<{ audio: AudioFile; publicId?: string } | null> => {
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64Data = await base64Promise;
      
      let duration = 0;
      if (file instanceof File) {
        const tempAudio = new Audio(URL.createObjectURL(file));
        await new Promise<void>((resolve) => {
          tempAudio.onloadedmetadata = () => {
            duration = tempAudio.duration;
            resolve();
          };
          tempAudio.onerror = () => resolve();
        });
      } else {
        duration = recordingTime;
      }
      
      const { data, error } = await supabase.functions.invoke('upload-audio', {
        body: {
          audioData: base64Data,
          filename: filename,
          contentType: file.type || 'audio/webm',
        },
      });
      
      if (error) throw error;
      if (!data?.url) throw new Error('No URL returned from upload');
      
      console.log('Audio uploaded successfully:', data.url);
      
      return {
        audio: {
          name: filename,
          duration: data.duration || duration,
          url: data.url,
          type: file instanceof File ? 'uploaded' : 'recorded',
        },
        publicId: data.publicId,
      };
      
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload audio. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    const result = await uploadToCloudinary(file, file.name);
    if (result) {
      setUploadedAudio(result.audio);
      // Save to database
      setIsSaving(true);
      await saveVoiceToDatabase(result.audio, result.publicId);
      setIsSaving(false);
      toast({
        title: "Audio uploaded",
        description: "Your audio file has been uploaded and saved.",
      });
    }
  };

  const handleUseAudio = async () => {
    if (activeTab === 'upload' && uploadedAudio) {
      onUseAudio(uploadedAudio);
    } else if (activeTab === 'record' && hasRecording && recordedBlob) {
      setIsSaving(true);
      const result = await uploadToCloudinary(recordedBlob, `recording_${Date.now()}.webm`);
      if (result) {
        // Save to database
        await saveVoiceToDatabase(result.audio, result.publicId);
        onUseAudio(result.audio);
      }
      setIsSaving(false);
    }
    resetAndClose();
  };

  const handleSelectSavedVoice = (voice: SavedVoice) => {
    onUseAudio({
      name: voice.name,
      duration: voice.duration,
      url: voice.url,
      type: voice.type as 'uploaded' | 'recorded',
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setUploadedAudio(null);
    setIsRecording(false);
    setRecordingTime(0);
    setHasRecording(false);
    setIsPlayingRecording(false);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setActiveTab('voices');
    setCloneVoiceName('');
    setCloneAudioFile(null);
    setCloneAudioUrl(null);
    setCloneAudioDuration(0);
    setCloneRemoveNoise(true);
    setIsPlayingClonePreview(false);
    setCloneInputMode('upload');
    setIsCloneRecording(false);
    setCloneRecordingTime(0);
    setCloneRecordedBlob(null);
    
    if (cloneRecordingIntervalRef.current) {
      clearInterval(cloneRecordingIntervalRef.current);
      cloneRecordingIntervalRef.current = null;
    }
    
    if (cloneAudioRef.current) {
      cloneAudioRef.current.pause();
      cloneAudioRef.current = null;
    }
    
    if (recordedAudioRef.current) {
      recordedAudioRef.current.pause();
      recordedAudioRef.current = null;
    }
    
    onClose();
  };

  const handleCloneFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setCloneAudioFile(file);
      setCloneAudioUrl(url);
      
      // Get audio duration
      const tempAudio = new Audio(url);
      tempAudio.onloadedmetadata = () => {
        setCloneAudioDuration(tempAudio.duration);
      };
    }
  };

  const playClonePreview = () => {
    if (!cloneAudioUrl) return;
    
    if (isPlayingClonePreview && cloneAudioRef.current) {
      cloneAudioRef.current.pause();
      cloneAudioRef.current.currentTime = 0;
      setIsPlayingClonePreview(false);
    } else {
      cloneAudioRef.current = new Audio(cloneAudioUrl);
      cloneAudioRef.current.onended = () => setIsPlayingClonePreview(false);
      cloneAudioRef.current.play();
      setIsPlayingClonePreview(true);
    }
  };

  const stopClonePreview = () => {
    if (cloneAudioRef.current) {
      cloneAudioRef.current.pause();
      cloneAudioRef.current.currentTime = 0;
      setIsPlayingClonePreview(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCloneDurationValid = cloneAudioDuration >= 5 && cloneAudioDuration <= 300; // 5 sec to 5 min

  // Clone recording functions
  const startCloneRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      cloneMediaRecorderRef.current = mediaRecorder;
      cloneAudioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          cloneAudioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(cloneAudioChunksRef.current, { type: mediaRecorder.mimeType });
        setCloneRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setCloneAudioUrl(url);
        setCloneAudioDuration(cloneRecordingTime);
        
        // Create a File from the Blob for the clone API
        const file = new File([blob], `clone_recording_${Date.now()}.webm`, { type: blob.type });
        setCloneAudioFile(file);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000);
      setIsCloneRecording(true);
      setCloneRecordingTime(0);
      setCloneRecordedBlob(null);
      setCloneAudioFile(null);
      setCloneAudioUrl(null);
      setCloneAudioDuration(0);
      
      // Start timer
      cloneRecordingIntervalRef.current = setInterval(() => {
        setCloneRecordingTime((prev) => {
          if (prev >= 300) { // Max 5 minutes
            stopCloneRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting clone recording:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopCloneRecording = () => {
    if (cloneMediaRecorderRef.current && cloneMediaRecorderRef.current.state !== 'inactive') {
      cloneMediaRecorderRef.current.stop();
    }
    if (cloneRecordingIntervalRef.current) {
      clearInterval(cloneRecordingIntervalRef.current);
      cloneRecordingIntervalRef.current = null;
    }
    setIsCloneRecording(false);
  };

  const handleCloneVoice = async () => {
    if (!cloneAudioFile || !cloneVoiceName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name and upload or record an audio file.",
        variant: "destructive",
      });
      return;
    }

    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append('name', cloneVoiceName.trim());
      formData.append('description', `Cloned voice - ${cloneVoiceName.trim()}`);
      formData.append('audio', cloneAudioFile);
      formData.append('remove_background_noise', cloneRemoveNoise ? 'true' : 'false');

      // Use direct fetch for FormData file uploads (supabase.functions.invoke doesn't handle FormData properly)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clone-voice`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Clone failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.voice_id) throw new Error('Failed to clone voice - no voice ID returned');

      console.log('Voice cloned successfully:', data);

      // Upload the original audio to Cloudinary for storage
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(cloneAudioFile);
      });
      
      const base64Data = await base64Promise;
      
      // Use already captured duration
      const duration = cloneAudioDuration || 0;
      
      const uploadResult = await supabase.functions.invoke('upload-audio', {
        body: {
          audioData: base64Data,
          filename: `cloned_${cloneVoiceName.trim()}_${Date.now()}.mp3`,
          contentType: cloneAudioFile.type,
        },
      });

      if (uploadResult.error) throw uploadResult.error;

      // Save to user_voices with type 'cloned' and ElevenLabs voice_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('user_voices')
        .insert({
          user_id: user.id,
          name: cloneVoiceName.trim(),
          duration: duration,
          url: uploadResult.data?.url || cloneAudioUrl,
          type: 'cloned',
          cloudinary_public_id: uploadResult.data?.publicId || null,
          elevenlabs_voice_id: data.voice_id, // Store ElevenLabs voice ID for TTS
        } as any);

      toast({
        title: "Voice cloned!",
        description: `${cloneVoiceName} has been cloned and saved to My Voices.`,
      });

      // Reset and refresh
      setCloneVoiceName('');
      setCloneAudioFile(null);
      setCloneAudioUrl(null);
      setActiveTab('voices');
      await loadSavedVoices();

    } catch (error) {
      console.error('Error cloning voice:', error);
      toast({
        title: "Clone failed",
        description: error instanceof Error ? error.message : "Failed to clone voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
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
            <h2 className="text-lg font-semibold text-foreground">Audio</h2>
            <button
              onClick={resetAndClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs - hide entirely in clone mode */}
          {mode !== 'clone' && (
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('voices')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'voices'
                    ? 'text-foreground border-b-2 border-emerald-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Voices
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'text-foreground border-b-2 border-emerald-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab('record')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'record'
                    ? 'text-foreground border-b-2 border-emerald-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Record
              </button>
              <button
                onClick={() => setActiveTab('clone')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'clone'
                    ? 'text-foreground border-b-2 border-violet-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Clone
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[400px] overflow-y-auto">
            {activeTab === 'voices' ? (
              <>
                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang} className="text-xs">
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={accentFilter} onValueChange={setAccentFilter}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Accent" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCENTS.map(accent => (
                        <SelectItem key={accent} value={accent} className="text-xs">
                          {accent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map(gender => (
                        <SelectItem key={gender} value={gender} className="text-xs">
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {(languageFilter !== 'All' || accentFilter !== 'All' || genderFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setLanguageFilter('All');
                        setAccentFilter('All');
                        setGenderFilter('All');
                      }}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                {isLoadingVoices ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading voices...</p>
                  </div>
                ) : filteredVoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Mic className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-medium text-foreground mb-1">
                      {savedVoices.length === 0 ? 'No saved voices' : 'No voices match filters'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {savedVoices.length === 0 
                        ? 'Upload or record your first voice to get started'
                        : 'Try adjusting your filter criteria'}
                    </p>
                    {savedVoices.length === 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab('upload')}
                          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium text-foreground transition-colors"
                        >
                          Upload
                        </button>
                        <button
                          onClick={() => setActiveTab('record')}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                          Record
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredVoices.map((voice) => (
                      <VoiceCard
                        key={voice.id}
                        voice={voice}
                        onSelect={() => handleSelectSavedVoice(voice)}
                        onDelete={() => deleteVoice(voice.id)}
                        isDeleting={deletingVoiceId === voice.id}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === 'upload' ? (
              <>
                {isUploading || isSaving ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {isSaving ? 'Saving voice...' : 'Uploading audio...'}
                    </p>
                  </div>
                ) : uploadedAudio ? (
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
                      Audio: MP3, WAV, WebM Up to 20MB
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Drag and drop or click to browse
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            ) : activeTab === 'record' ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Please record in a quiet environment. Your Avatar will perfectly match your accent, pitch, and emotions.
                </p>

                <div className="bg-muted/50 rounded-xl p-8 flex flex-col items-center w-full">
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isUploading || isSaving}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    } disabled:opacity-50`}
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
                        onClick={playRecordedAudio}
                        disabled={isUploading || isSaving}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors mx-auto disabled:opacity-50"
                      >
                        {isPlayingRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlayingRecording ? 'Pause' : 'Play'} preview
                      </button>
                      <button
                        onClick={() => {
                          setHasRecording(false);
                          setRecordingTime(0);
                          setRecordedBlob(null);
                          setRecordedUrl(null);
                        }}
                        disabled={isUploading || isSaving}
                        className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto disabled:opacity-50"
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
            ) : activeTab === 'clone' ? (
              <div className="flex flex-col">
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-full mb-3">
                    <Wand2 className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-medium text-violet-500">AI Voice Cloning</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a voice sample (1-5 minutes recommended) and we'll clone it using AI.
                  </p>
                </div>

                {/* Voice Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Voice Name
                  </label>
                  <input
                    type="text"
                    value={cloneVoiceName}
                    onChange={(e) => setCloneVoiceName(e.target.value)}
                    placeholder="e.g., My Voice Clone"
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                    maxLength={50}
                  />
                </div>

                {/* Upload/Record Toggle */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Voice Sample <span className="text-muted-foreground font-normal">(1-5 minutes)</span>
                  </label>
                  
                  {/* Mode Toggle */}
                  {!cloneAudioFile && !isCloneRecording && (
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setCloneInputMode('upload')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          cloneInputMode === 'upload'
                            ? 'bg-violet-500 text-white'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      <button
                        onClick={() => setCloneInputMode('record')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          cloneInputMode === 'record'
                            ? 'bg-violet-500 text-white'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        Record
                      </button>
                    </div>
                  )}
                  
                  {cloneAudioFile ? (
                    <div className="bg-muted/50 rounded-xl border border-border overflow-hidden">
                      {/* Audio info and controls */}
                      <div className="flex items-center gap-3 p-3">
                        <button
                          onClick={playClonePreview}
                          className="w-10 h-10 bg-violet-500 hover:bg-violet-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          {isPlayingClonePreview ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {cloneRecordedBlob ? 'Recorded Audio' : cloneAudioFile.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{(cloneAudioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className={cloneAudioDuration > 0 ? (isCloneDurationValid ? 'text-emerald-500' : 'text-amber-500') : ''}>
                              {cloneAudioDuration > 0 ? formatDuration(cloneAudioDuration) : 'Loading...'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            stopClonePreview();
                            setCloneAudioFile(null);
                            setCloneAudioUrl(null);
                            setCloneAudioDuration(0);
                            setCloneRecordedBlob(null);
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                      
                      {/* Duration warning */}
                      {cloneAudioDuration > 0 && !isCloneDurationValid && (
                        <div className="px-3 pb-3">
                          <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg px-3 py-2">
                            <Clock className="w-3.5 h-3.5" />
                            {cloneAudioDuration < 5 
                              ? 'Audio too short. Minimum 5 seconds required for best results.'
                              : 'Audio exceeds 5 minutes. Consider trimming for optimal cloning.'}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isCloneRecording ? (
                    /* Recording UI */
                    <div className="bg-muted/50 rounded-xl p-6 flex flex-col items-center">
                      <motion.button
                        onClick={stopCloneRecording}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <Square className="w-6 h-6 text-white fill-white" />
                      </motion.button>
                      
                      <div className="mt-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-red-500 rounded-full"
                          />
                          <span className="text-lg font-medium text-foreground">
                            {formatDuration(cloneRecordingTime)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Recording... Click to stop</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {cloneRecordingTime < 60 ? 'Keep going! 1-5 minutes recommended.' : 'Good duration for cloning.'}
                        </p>
                      </div>
                    </div>
                  ) : cloneInputMode === 'record' ? (
                    /* Start Recording UI */
                    <div className="bg-muted/50 rounded-xl p-6 flex flex-col items-center">
                      <motion.button
                        onClick={startCloneRecording}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-violet-500 hover:bg-violet-600 transition-colors"
                      >
                        <Mic className="w-7 h-7 text-white" />
                      </motion.button>
                      
                      <div className="mt-4 text-center">
                        <p className="text-sm font-medium text-foreground">Start recording</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Record 1-5 minutes of clear speech
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Upload UI */
                    <div
                      onClick={() => cloneFileInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-border hover:border-violet-500/50 rounded-xl p-6 flex flex-col items-center transition-colors"
                    >
                      <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-violet-500" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Upload Voice Sample</p>
                      <p className="text-xs text-muted-foreground mt-1">MP3, WAV, WebM • 1-5 minutes recommended</p>
                    </div>
                  )}

                  <input
                    ref={cloneFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleCloneFileChange}
                    className="hidden"
                  />
                </div>

                {/* Noise Removal Toggle */}
                <div className="mb-4 flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Remove Background Noise</p>
                    <p className="text-xs text-muted-foreground">AI will isolate your voice from background sounds</p>
                  </div>
                  <button
                    onClick={() => setCloneRemoveNoise(!cloneRemoveNoise)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      cloneRemoveNoise ? 'bg-violet-500' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        cloneRemoveNoise ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Tips */}
                <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Tips for best results:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Use a clear recording with minimal background noise</li>
                    <li>Speak naturally at a consistent volume</li>
                    <li>1-5 minutes of audio works best for accurate cloning</li>
                    <li>Avoid music or other voices in the background</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer - show for upload/record/clone tabs */}
          {(activeTab === 'upload' || activeTab === 'record' || activeTab === 'clone') && (
            <div className="px-6 pb-6">
              {activeTab === 'clone' ? (
                <>
                  <button
                    onClick={handleCloneVoice}
                    disabled={isCloning || !cloneAudioFile || !cloneVoiceName.trim() || (cloneAudioDuration > 0 && cloneAudioDuration < 5)}
                    className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      !isCloning && cloneAudioFile && cloneVoiceName.trim() && (cloneAudioDuration === 0 || cloneAudioDuration >= 5)
                        ? 'bg-violet-500 hover:bg-violet-600 text-white'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {isCloning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cloning Voice...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Clone Voice
                      </>
                    )}
                  </button>
                  {cloneAudioDuration > 0 && cloneAudioDuration < 5 && (
                    <p className="text-xs text-amber-500 text-center mt-2">
                      Audio must be at least 5 seconds long
                    </p>
                  )}
                </>
              ) : (
                <button
                  onClick={handleUseAudio}
                  disabled={
                    isUploading ||
                    isSaving ||
                    (activeTab === 'upload' && !uploadedAudio) ||
                    (activeTab === 'record' && !hasRecording)
                  }
                  className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    !isUploading && !isSaving && (
                      (activeTab === 'upload' && uploadedAudio) ||
                      (activeTab === 'record' && hasRecording)
                    )
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isUploading || isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isSaving ? 'Saving...' : 'Uploading...'}
                    </>
                  ) : (
                    'Use This Audio'
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioUploadModal;
