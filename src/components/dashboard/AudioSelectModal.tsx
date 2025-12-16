import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  X,
  Upload,
  Mic,
  Search,
  History,
  Image as ImageIcon,
  Users,
  Play,
  Pause,
  Trash2,
  Loader2,
  AudioLines,
  RefreshCw,
  Clock,
  Calendar,
  Square,
  FileAudio,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AudioItem {
  id: string;
  name: string;
  duration: number;
  url: string;
  type: string;
  created_at: string;
}

interface AudioSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAudio: (audio: { name: string; duration: number; url: string; base64?: string }) => void;
}

// Sample audio files
const SAMPLE_AUDIO = [
  { id: 'sample-1', name: '100% Life.mp3', duration: 8, url: '' },
  { id: 'sample-2', name: 'Power of Ideas.mp3', duration: 10, url: '' },
  { id: 'sample-3', name: 'Then.mp3', duration: 8, url: '' },
];

const AudioSelectModal: React.FC<AudioSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectAudio,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'creations' | 'stock' | 'community'>('creations');
  const [searchQuery, setSearchQuery] = useState('');
  const [audioHistory, setAudioHistory] = useState<AudioItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [deletingAudioId, setDeletingAudioId] = useState<string | null>(null);
  
  // Right panel state
  const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ file: File; url: string; name: string; duration: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAudioHistory();
      // Reset state
      setSelectedAudio(null);
      setUploadedFile(null);
      setRecordedBlob(null);
      setRecordedUrl(null);
    }
  }, [isOpen]);

  const loadAudioHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_voices')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['uploaded', 'recorded', 'voiceover', 'transcription'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudioHistory(data || []);
    } catch (error) {
      console.error('Error loading audio history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4'];
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP3, WAV, or similar audio files",
        variant: "destructive",
      });
      return;
    }

    // Get duration
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    
    audio.onloadedmetadata = () => {
      setUploadedFile({
        file,
        url: audioUrl,
        name: file.name,
        duration: Math.round(audio.duration),
      });
      setSelectedAudio(null);
      setRecordedBlob(null);
      setRecordedUrl(null);
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType =
        MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : MediaRecorder.isTypeSupported('audio/ogg')
            ? 'audio/ogg'
            : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType: preferredMimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || preferredMimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedBlob(audioBlob);
        setRecordedUrl(audioUrl);
        setUploadedFile(null);
        setSelectedAudio(null);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePlayAudio = (audio: AudioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudioId === audio.id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audio.url);
      audioRef.current.onended = () => setPlayingAudioId(null);
      audioRef.current.play();
      setPlayingAudioId(audio.id);
    }
  };

  const handleDeleteAudio = async (audioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingAudioId(audioId);
    try {
      const { error } = await supabase
        .from('user_voices')
        .delete()
        .eq('id', audioId);

      if (error) throw error;
      
      setAudioHistory(prev => prev.filter(a => a.id !== audioId));
      if (selectedAudio?.id === audioId) {
        setSelectedAudio(null);
      }
      toast({ title: "Audio deleted" });
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast({
        title: "Failed to delete",
        variant: "destructive",
      });
    } finally {
      setDeletingAudioId(null);
    }
  };

  const handleSelectFromHistory = (audio: AudioItem) => {
    setSelectedAudio(audio);
    setUploadedFile(null);
    setRecordedBlob(null);
    setRecordedUrl(null);
  };

  const handleUseAudio = async () => {
    if (selectedAudio) {
      onSelectAudio({
        name: selectedAudio.name,
        duration: selectedAudio.duration,
        url: selectedAudio.url,
      });
      onClose();
    } else if (uploadedFile) {
      // Upload to Cloudinary first
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(uploadedFile.file);
        
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        const { data, error } = await supabase.functions.invoke('upload-audio', {
          body: {
            audioData: base64,
            filename: uploadedFile.name,
            contentType: uploadedFile.file.type,
          }
        });

        if (error) throw error;

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_voices').insert({
            user_id: user.id,
            name: uploadedFile.name,
            duration: uploadedFile.duration,
            url: data.url,
            type: 'uploaded',
          });
        }

        onSelectAudio({
          name: uploadedFile.name,
          duration: uploadedFile.duration,
          url: data.url,
          base64,
        });
        onClose();
      } catch (error) {
        console.error('Error uploading audio:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload audio file",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } else if (recordedBlob && recordedUrl) {
      // Upload recorded audio
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(recordedBlob);
        
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        const filename = `Recording_${Date.now()}.webm`;

        const { data, error } = await supabase.functions.invoke('upload-audio', {
          body: {
            audioData: base64,
            filename,
            contentType: recordedBlob.type,
          }
        });

        if (error) throw error;

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_voices').insert({
            user_id: user.id,
            name: filename,
            duration: recordingTime,
            url: data.url,
            type: 'recorded',
          });
        }

        onSelectAudio({
          name: filename,
          duration: recordingTime,
          url: data.url,
          base64,
        });
        onClose();
      } catch (error) {
        console.error('Error uploading recording:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload recording",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleReupload = () => {
    setUploadedFile(null);
    setSelectedAudio(null);
    setRecordedBlob(null);
    setRecordedUrl(null);
  };

  const hasSelection = selectedAudio || uploadedFile || (recordedBlob && recordedUrl);

  const filteredHistory = audioHistory.filter(audio =>
    audio.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 bg-[hsl(215,28%,17%)] border-0 rounded-2xl overflow-hidden h-[80vh] max-h-[700px]">
        <div className="flex h-full">
          {/* Left Panel - Audio Library */}
          <div className="flex-1 flex flex-col border-r border-border/30">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Audio Library</h2>
                  <p className="text-sm text-gray-400 mt-1">Upload or Select Audio</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Audio"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('creations')}
                  className={`pb-3 text-sm font-medium flex items-center gap-2 transition border-b-2 ${
                    activeTab === 'creations'
                      ? 'text-white border-white'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  <History size={16} />
                  Creations
                </button>
                <button
                  onClick={() => setActiveTab('stock')}
                  className={`pb-3 text-sm font-medium flex items-center gap-2 transition border-b-2 ${
                    activeTab === 'stock'
                      ? 'text-white border-white'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  <ImageIcon size={16} />
                  Stock
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`pb-3 text-sm font-medium flex items-center gap-2 transition border-b-2 ${
                    activeTab === 'community'
                      ? 'text-white border-white'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  <Users size={16} />
                  Community
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : filteredHistory.length > 0 ? (
                <div className="space-y-2">
                  {filteredHistory.map((audio) => (
                    <div
                      key={audio.id}
                      onClick={() => handleSelectFromHistory(audio)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition group ${
                        selectedAudio?.id === audio.id
                          ? 'bg-blue-500/20 border border-blue-500'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <button
                        onClick={(e) => handlePlayAudio(audio, e)}
                        className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500 rounded-full flex items-center justify-center transition flex-shrink-0"
                      >
                        {playingAudioId === audio.id ? (
                          <Pause size={16} className="text-blue-400 group-hover:text-white" />
                        ) : (
                          <Play size={16} className="text-blue-400 group-hover:text-white ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{audio.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTime(audio.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(audio.created_at)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteAudio(audio.id, e)}
                        disabled={deletingAudioId === audio.id}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition"
                      >
                        {deletingAudioId === audio.id ? (
                          <Loader2 size={14} className="text-gray-400 animate-spin" />
                        ) : (
                          <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AudioLines size={32} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400">No audio files yet</p>
                  <p className="text-sm text-gray-500 mt-1">Upload or record to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Upload/Record/Preview */}
          <div className="w-80 flex flex-col bg-gray-50 dark:bg-[hsl(215,28%,14%)]">
            <div className="flex-1 p-6 flex flex-col">
              {hasSelection ? (
                // Preview selected/uploaded/recorded audio
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-blue-500 rounded-xl flex items-center justify-center mb-4 relative">
                    <AudioLines size={40} className="text-white" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <FileAudio size={12} className="text-blue-500" />
                    </div>
                  </div>
                  
                  <p className="font-medium text-gray-900 dark:text-white text-center mb-1">
                    {selectedAudio?.name || uploadedFile?.name || `Recording_${Date.now()}.webm`}
                  </p>
                  
                  <button
                    onClick={handleReupload}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mt-2"
                  >
                    <RefreshCw size={14} />
                    Reupload
                  </button>
                </div>
              ) : (
                // Upload or Record options
                <div className="flex-1 flex flex-col gap-4">
                  {/* Upload Box */}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition group">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition">
                      <AudioLines size={28} className="text-blue-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">Upload Audio</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Audio: MP3, WAV Up to 20MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <div className="text-center text-sm text-gray-400">- or -</div>

                  {/* Record Box */}
                  <div
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition group ${
                      isRecording
                        ? 'border-red-400 bg-red-50/50 dark:bg-red-500/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-3 transition ${
                      isRecording
                        ? 'bg-red-100 dark:bg-red-500/20 animate-pulse'
                        : 'bg-blue-100 dark:bg-blue-500/20 group-hover:scale-105'
                    }`}>
                      {isRecording ? (
                        <Square size={28} className="text-red-500" />
                      ) : (
                        <Mic size={28} className="text-blue-500" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {isRecording ? 'Stop Recording' : 'Record Audio'}
                    </p>
                    {isRecording && (
                      <p className="text-sm text-red-500 mt-1 font-mono">
                        {formatTime(recordingTime)}
                      </p>
                    )}
                    {!isRecording && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Click to start recording
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Upload
              </Button>
              <Button
                onClick={handleUseAudio}
                disabled={!hasSelection || isUploading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Use'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioSelectModal;
