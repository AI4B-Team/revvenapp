import React, { useState, useRef } from 'react';
import { Play, Square, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  avatar: string;
}

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (voice: Voice) => void;
}

const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices: Voice[] = [
    { id: 'Rachel', name: 'Rachel', gender: 'female', avatar: '👩' },
    { id: 'Aria', name: 'Aria', gender: 'female', avatar: '👩‍🎤' },
    { id: 'Roger', name: 'Roger', gender: 'male', avatar: '👨‍💼' },
    { id: 'Sarah', name: 'Sarah', gender: 'female', avatar: '👩‍💻' },
    { id: 'Laura', name: 'Laura', gender: 'female', avatar: '👩‍💼' },
    { id: 'Charlie', name: 'Charlie', gender: 'male', avatar: '👨‍🦰' },
    { id: 'George', name: 'George', gender: 'male', avatar: '👨‍🦳' },
    { id: 'Callum', name: 'Callum', gender: 'male', avatar: '👨' },
    { id: 'River', name: 'River', gender: 'neutral', avatar: '🧑' },
    { id: 'Liam', name: 'Liam', gender: 'male', avatar: '👨‍💻' },
    { id: 'Charlotte', name: 'Charlotte', gender: 'female', avatar: '👩‍🎨' },
    { id: 'Alice', name: 'Alice', gender: 'female', avatar: '👩‍🔬' },
    { id: 'Matilda', name: 'Matilda', gender: 'female', avatar: '👩‍🏫' },
    { id: 'Will', name: 'Will', gender: 'male', avatar: '👨‍🎤' },
    { id: 'Jessica', name: 'Jessica', gender: 'female', avatar: '👩‍🎨' },
    { id: 'Eric', name: 'Eric', gender: 'male', avatar: '👨‍🍳' },
    { id: 'Chris', name: 'Chris', gender: 'male', avatar: '👨‍🔧' },
    { id: 'Brian', name: 'Brian', gender: 'male', avatar: '👨‍⚕️' },
    { id: 'Daniel', name: 'Daniel', gender: 'male', avatar: '👨‍✈️' },
    { id: 'Lily', name: 'Lily', gender: 'female', avatar: '👩‍🌾' },
    { id: 'Bill', name: 'Bill', gender: 'male', avatar: '👨‍🏫' },
  ];

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice.id);
  };

  const handlePlayPreview = async (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();

    // If already playing this voice, stop it
    if (playingVoice === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoice(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setLoadingVoice(voice.id);

    try {
      const previewText = `Hi, I'm ${voice.name}. This is how I sound when I speak.`;
      
      const { data, error } = await supabase.functions.invoke('generate-voice-preview', {
        body: { text: previewText, voice: voice.id }
      });

      if (error) throw error;

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setPlayingVoice(null);
          audioRef.current = null;
        };
        
        audio.onerror = () => {
          toast.error('Failed to play audio');
          setPlayingVoice(null);
          audioRef.current = null;
        };

        await audio.play();
        setPlayingVoice(voice.id);
      }
    } catch (error) {
      console.error('Error playing voice preview:', error);
      toast.error('Failed to generate voice preview');
    } finally {
      setLoadingVoice(null);
    }
  };

  const handleConfirmSelection = () => {
    const voice = voices.find(v => v.id === selectedVoice);
    if (voice) {
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      onSelect(voice);
      onClose();
    }
  };

  const handleClose = () => {
    // Stop any playing audio when closing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoice(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-black border-0 p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-white mb-4">
            Choose Voice
          </DialogTitle>

          {/* Language Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Language</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                <SelectItem value="english" className="text-white hover:bg-gray-800">English</SelectItem>
                <SelectItem value="spanish" className="text-white hover:bg-gray-800">Spanish</SelectItem>
                <SelectItem value="french" className="text-white hover:bg-gray-800">French</SelectItem>
                <SelectItem value="german" className="text-white hover:bg-gray-800">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Voice Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleSelectVoice(voice)}
                className={`flex items-center gap-3 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border ${
                  selectedVoice === voice.id 
                    ? 'border-green-500 ring-2 ring-green-500/50' 
                    : 'border-gray-800 hover:border-cyan-500'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-2xl">
                  {voice.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium text-sm">{voice.name}</div>
                  <div className="text-gray-400 text-xs capitalize">{voice.gender}</div>
                </div>
                <button
                  onClick={(e) => handlePlayPreview(e, voice)}
                  disabled={loadingVoice === voice.id}
                  className={`p-2 rounded-full transition-colors ${
                    playingVoice === voice.id 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-800 hover:bg-cyan-600'
                  }`}
                >
                  {loadingVoice === voice.id ? (
                    <Loader2 size={14} className="text-white animate-spin" />
                  ) : playingVoice === voice.id ? (
                    <Square size={14} className="text-white" />
                  ) : (
                    <Play size={14} className="text-white" />
                  )}
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedVoice}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Select
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSelectorModal;
