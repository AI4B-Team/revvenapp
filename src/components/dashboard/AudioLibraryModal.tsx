import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, Clock, Calendar, X, Mic, Loader2, Pencil, Trash2, Square, Check, FileAudio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Social Media Brand Icons as SVG components
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <defs>
      <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.022.855-.71 2.024-1.146 3.39-1.264.944-.082 1.894-.048 2.821.1.007-.378.009-.753-.009-1.119-.064-1.318-.282-2.276-1.03-2.883-.587-.476-1.47-.678-2.79-.64-1.2.035-2.126.337-2.756.9-.547.49-.871 1.126-.986 2.008l-2.063-.292c.165-1.294.698-2.332 1.584-3.089 1.054-.9 2.49-1.374 4.271-1.413h.09c1.77.03 3.134.488 4.054 1.362 1.19 1.128 1.47 2.671 1.548 4.27.018.375.016.795.003 1.235.756.376 1.412.858 1.947 1.432 1.062 1.142 1.59 2.6 1.535 4.23-.055 1.64-.681 3.096-1.812 4.212-1.733 1.708-4.096 2.58-7.027 2.595z"/>
    <path d="M13.893 13.99c-.834-.086-1.623-.053-2.344.027-.952.106-1.724.369-2.232.762-.455.352-.665.777-.625 1.264.04.486.317.9.782 1.17.542.315 1.278.472 2.066.43 1.054-.057 1.876-.454 2.447-1.182.387-.494.657-1.165.791-1.984-.295-.165-.58-.325-.885-.487z"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const VimeoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1AB7EA">
    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 003.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
  </svg>
);

const BlueskyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0085FF">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
  </svg>
);

// Tab icons
const CreationsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9"/>
  </svg>
);

const StockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18M3 9h18" strokeLinecap="round"/>
  </svg>
);

const CommunityIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// Upload icon (waveform style) - GREEN
const UploadAudioIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Cloud download icon for Online File - BLUE
const OnlineFileIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 16V8M12 16l-3-3M12 16l3-3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface AudioFile {
  id: string;
  name: string;
  duration: number;
  url: string;
  created_at: string;
  type: string;
}

type TabType = 'creations' | 'stock' | 'community';

interface AudioLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (audio: { name: string; duration: number; url: string; base64?: string }) => void;
}

interface SelectedFile {
  name: string;
  duration: number;
  url: string;
  source: 'upload' | 'record' | 'media' | 'library';
  id?: string;
}

const AudioLibraryModal: React.FC<AudioLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('creations');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioHistory, setAudioHistory] = useState<AudioFile[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hoveredAudioId, setHoveredAudioId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // Selected file state for right panel display
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [editedFileName, setEditedFileName] = useState('');
  const [isPlayingSelected, setIsPlayingSelected] = useState(false);
  const [hoveredSelectedFile, setHoveredSelectedFile] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selectedAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  // Reordered: YouTube, Facebook, TikTok, Instagram, Threads, X, Reddit, Vimeo, Bluesky
  const socialPlatforms = [
    { icon: YouTubeIcon, name: 'YouTube' },
    { icon: FacebookIcon, name: 'Facebook' },
    { icon: TikTokIcon, name: 'TikTok' },
    { icon: InstagramIcon, name: 'Instagram' },
    { icon: ThreadsIcon, name: 'Threads' },
    { icon: XTwitterIcon, name: 'X' },
    { icon: RedditIcon, name: 'Reddit' },
    { icon: VimeoIcon, name: 'Vimeo' },
    { icon: BlueskyIcon, name: 'Bluesky' },
  ];

  const tabs = [
    { id: 'creations' as TabType, label: 'Creations', icon: CreationsIcon },
    { id: 'stock' as TabType, label: 'Stock', icon: StockIcon },
    { id: 'community' as TabType, label: 'Community', icon: CommunityIcon },
  ];

  useEffect(() => {
    if (isOpen) {
      loadAudioHistory();
      // Reset state
      setSelectedFile(null);
      setMediaUrl('');
      setIsEditingFileName(false);
      setEditedFileName('');
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

  const filteredAudioFiles = audioHistory.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePlayPause = (audio: AudioFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === audio.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audio.url);
      audioRef.current.onended = () => setPlayingId(null);
      audioRef.current.play();
      setPlayingId(audio.id);
    }
  };

  const handleSelectAudio = (audio: AudioFile) => {
    setSelectedFile({
      name: audio.name,
      duration: audio.duration,
      url: audio.url,
      source: 'library',
      id: audio.id,
    });
    setEditedFileName(audio.name);
    setMediaUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    // Get duration
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    
    audio.onloadedmetadata = async () => {
      const duration = Math.round(audio.duration);
      
      // Upload immediately and add to history
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        const { data, error } = await supabase.functions.invoke('upload-audio', {
          body: {
            audioData: base64,
            filename: file.name,
            contentType: file.type,
          }
        });

        if (error) throw error;

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: insertedData } = await supabase.from('user_voices').insert({
            user_id: user.id,
            name: file.name,
            duration: duration,
            url: data.url,
            type: 'uploaded',
          }).select().single();

          // Refresh history to show new file
          await loadAudioHistory();

          // Set as selected file
          setSelectedFile({
            name: file.name,
            duration: duration,
            url: data.url,
            source: 'upload',
            id: insertedData?.id,
          });
          setEditedFileName(file.name);
        }

        toast({
          title: "Upload successful",
          description: "Audio file has been added to your library",
        });
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
    };

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || preferredMimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        recordedBlobRef.current = audioBlob;
        const audioUrl = URL.createObjectURL(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        
        // Upload immediately
        setIsUploading(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });

          const filename = `Recording_${new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(/[,:\s]/g, '_')}.webm`;

          const { data, error } = await supabase.functions.invoke('upload-audio', {
            body: {
              audioData: base64,
              filename,
              contentType: audioBlob.type,
            }
          });

          if (error) throw error;

          // Save to database
          const { data: { user } } = await supabase.auth.getUser();
          const finalDuration = recordingTime;
          
          if (user) {
            const { data: insertedData } = await supabase.from('user_voices').insert({
              user_id: user.id,
              name: filename,
              duration: finalDuration,
              url: data.url,
              type: 'recorded',
            }).select().single();

            // Refresh history to show new file
            await loadAudioHistory();

            // Set as selected file
            setSelectedFile({
              name: filename,
              duration: finalDuration,
              url: data.url,
              source: 'record',
              id: insertedData?.id,
            });
            setEditedFileName(filename);
          }

          toast({
            title: "Recording saved",
            description: "Your recording has been added to your library",
          });
        } catch (error) {
          console.error('Error uploading recording:', error);
          toast({
            title: "Upload failed",
            description: "Failed to save recording",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

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

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleMediaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setMediaUrl(url);
    if (url) {
      setSelectedFile({
        name: url,
        duration: 0,
        url: url,
        source: 'media',
      });
      setEditedFileName(url);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDeleteAudio = async (audioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('user_voices')
        .delete()
        .eq('id', audioId);

      if (error) throw error;

      setAudioHistory(prev => prev.filter(a => a.id !== audioId));
      
      if (selectedFile?.id === audioId) {
        setSelectedFile(null);
      }

      toast({
        title: "Deleted",
        description: "Audio file removed from library",
      });
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete audio file",
        variant: "destructive",
      });
    }
  };

  const handleEditAudio = async (audioId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('user_voices')
        .update({ name: newName })
        .eq('id', audioId);

      if (error) throw error;

      setAudioHistory(prev => prev.map(a => 
        a.id === audioId ? { ...a, name: newName } : a
      ));
      
      if (selectedFile?.id === audioId) {
        setSelectedFile(prev => prev ? { ...prev, name: newName } : null);
      }

      setEditingId(null);
      toast({
        title: "Updated",
        description: "Audio name updated",
      });
    } catch (error) {
      console.error('Error updating audio:', error);
      toast({
        title: "Update failed",
        description: "Could not update audio name",
        variant: "destructive",
      });
    }
  };

  const handlePlaySelectedFile = () => {
    if (!selectedFile) return;
    
    if (isPlayingSelected) {
      selectedAudioRef.current?.pause();
      setIsPlayingSelected(false);
    } else {
      if (selectedAudioRef.current) {
        selectedAudioRef.current.pause();
      }
      selectedAudioRef.current = new Audio(selectedFile.url);
      selectedAudioRef.current.onended = () => setIsPlayingSelected(false);
      selectedAudioRef.current.play();
      setIsPlayingSelected(true);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setEditedFileName('');
    setIsEditingFileName(false);
    if (selectedAudioRef.current) {
      selectedAudioRef.current.pause();
      setIsPlayingSelected(false);
    }
  };

  const handleSaveFileName = async () => {
    if (selectedFile?.id && editedFileName !== selectedFile.name) {
      await handleEditAudio(selectedFile.id, editedFileName);
      setSelectedFile(prev => prev ? { ...prev, name: editedFileName } : null);
    }
    setIsEditingFileName(false);
  };

  const handleUse = () => {
    if (selectedFile) {
      onSelect({
        name: selectedFile.name,
        duration: selectedFile.duration,
        url: selectedFile.url,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Close Button - EXTERIOR of modal */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
        style={{ transform: 'translate(50%, -50%)' }}
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex relative">
        {/* Left Panel - Audio Library */}
        <div className="flex-1 border-r border-gray-100 flex flex-col">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Audio Library</h2>
                <p className="text-sm text-gray-500">Upload or Select Audio</p>
              </div>
              
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Audio"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-10 border-b border-gray-100">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center gap-2.5 pb-4 text-sm font-medium transition-colors relative
                    ${activeTab === id 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon />
                  {label}
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Audio List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredAudioFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <p className="text-sm">No audio files found</p>
              </div>
            ) : (
              filteredAudioFiles.map((audio) => (
                <div
                  key={audio.id}
                  onClick={() => handleSelectAudio(audio)}
                  onMouseEnter={() => setHoveredAudioId(audio.id)}
                  onMouseLeave={() => setHoveredAudioId(null)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer
                    ${selectedFile?.id === audio.id 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  {/* Play Button */}
                  <button
                    onClick={(e) => handlePlayPause(audio, e)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      transition-colors
                      ${playingId === audio.id 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }
                    `}
                  >
                    {playingId === audio.id ? (
                      <Pause className="w-4 h-4" fill="currentColor" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  {/* Audio Info */}
                  <div className="flex-1 text-left min-w-0">
                    {editingId === audio.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditAudio(audio.id, editingName)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium text-gray-900 text-sm truncate">{audio.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(audio.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(audio.created_at)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Edit/Delete Icons - Show on hover */}
                  {hoveredAudioId === audio.id && editingId !== audio.id && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(audio.id);
                          setEditingName(audio.name);
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAudio(audio.id, e)}
                        className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Upload Options */}
        <div className="w-96 p-6 flex flex-col gap-3 bg-gray-50/50 overflow-y-auto">
          {/* Show selected file if exists */}
          {selectedFile ? (
            <div className="mb-4">
              <div 
                className="relative flex items-center gap-3 p-4 bg-white border-2 border-emerald-300 rounded-xl"
                onMouseEnter={() => setHoveredSelectedFile(true)}
                onMouseLeave={() => setHoveredSelectedFile(false)}
              >
                {/* Audio Icon with Play overlay */}
                <div 
                  className="relative w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={handlePlaySelectedFile}
                >
                  <FileAudio className="w-6 h-6 text-blue-500" />
                  {hoveredSelectedFile && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                      {isPlayingSelected ? (
                        <Pause className="w-5 h-5 text-white" fill="white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      )}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  {isEditingFileName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedFileName}
                        onChange={(e) => setEditedFileName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveFileName}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingFileName(false);
                          setEditedFileName(selectedFile.name);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{selectedFile.name}</h4>
                      <button
                        onClick={() => setIsEditingFileName(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedFile.duration > 0 ? formatDuration(selectedFile.duration) : 'Duration unknown'}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={handleClearSelectedFile}
                  className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Audio Option - PASTEL GREEN */}
              <label
                className={`
                  relative flex flex-col items-center justify-center p-5 
                  border-2 border-dashed rounded-xl cursor-pointer
                  transition-all duration-200 bg-white
                  border-gray-200 hover:border-gray-300 hover:bg-gray-50
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.mp4"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-emerald-50">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  ) : (
                    <div className="text-emerald-400">
                      <UploadAudioIcon />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Upload Audio</h3>
                <p className="text-xs text-gray-500">Audio: MP3, WAV Up to 20MB</p>
              </label>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">- or -</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Record Audio Option - PASTEL RED */}
              <button
                onClick={handleRecordClick}
                disabled={isUploading}
                className={`
                  relative flex flex-col items-center justify-center p-5 
                  border-2 border-dashed rounded-xl cursor-pointer
                  transition-all duration-200 bg-white
                  ${isRecording
                    ? 'border-red-400 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-red-50 relative">
                  {isRecording ? (
                    <>
                      {/* Recording animation - pulsing rings */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-red-300/30 rounded-full animate-ping" />
                        <div className="absolute w-10 h-10 bg-red-300/50 rounded-full animate-pulse" />
                      </div>
                      {/* Stop icon overlay */}
                      <Square className="w-6 h-6 text-red-500 fill-red-500 relative z-10" />
                    </>
                  ) : (
                    <Mic className="w-8 h-8 text-red-300" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Record Audio</h3>
                <p className="text-xs text-gray-500">
                  {isRecording ? (
                    <span className="text-red-500 font-medium">Recording... {formatDuration(recordingTime)} - Click to Stop</span>
                  ) : (
                    'Click To Start Recording'
                  )}
                </p>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">- or -</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Online File URL Option - PASTEL BLUE */}
              <div
                className={`
                  relative flex flex-col items-center justify-center p-5 
                  border-2 border-dashed rounded-xl bg-white
                  transition-all duration-200
                  ${mediaUrl 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200'
                  }
                `}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-blue-50">
                  <div className="text-blue-300">
                    <OnlineFileIcon />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Online File</h3>
                <p className="text-xs text-gray-500 text-center mb-3">
                  Paste A Supported Media Link To Transcribe
                </p>

                {/* URL Input */}
                <div className="w-full mb-3">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={handleMediaUrlChange}
                    placeholder="youtube.com | facebook.com |"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Social Platform Icons - Faded */}
                <div className="flex items-center justify-center gap-2">
                  {socialPlatforms.map(({ icon: Icon, name }) => (
                    <div
                      key={name}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer opacity-50 hover:opacity-100"
                      title={name}
                    >
                      <Icon />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Use Button */}
          <button
            onClick={handleUse}
            disabled={!selectedFile || isUploading}
            className={`
              w-full py-3 rounded-xl font-semibold text-white mt-2
              transition-all duration-200 flex items-center justify-center gap-2
              ${selectedFile && !isUploading
                ? 'bg-emerald-400 hover:bg-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-400/30'
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Use'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioLibraryModal;
