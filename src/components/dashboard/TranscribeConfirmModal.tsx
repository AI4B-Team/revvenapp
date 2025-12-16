import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Trash2, AudioLines, Loader2, Pencil, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TranscribeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioFile: {
    name: string;
    duration: number;
    url: string;
    base64?: string;
  } | null;
  onTranscribe: (numSpeakers: number, fileName?: string) => void;
  onRemoveAudio: () => void;
  onBackToLibrary?: () => void;
  isTranscribing?: boolean;
}

const TranscribeConfirmModal: React.FC<TranscribeConfirmModalProps> = ({
  isOpen,
  onClose,
  audioFile,
  onTranscribe,
  onRemoveAudio,
  onBackToLibrary,
  isTranscribing = false,
}) => {
  const [numSpeakers, setNumSpeakers] = useState(1);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (audioFile) {
      setEditedName(audioFile.name);
    }
  }, [audioFile]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (duration: number) => {
    // Rough estimation based on duration (assuming ~32kbps audio)
    const estimatedBytes = duration * 32 * 1000 / 8;
    if (estimatedBytes >= 1024 * 1024) {
      return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(estimatedBytes / 1024).toFixed(2)} KB`;
  };

  const handleSaveName = () => {
    setIsEditingName(false);
  };

  if (!audioFile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onRemoveAudio();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl p-0 bg-white dark:bg-background border-0 rounded-2xl overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">
                Transcribe Audio
              </h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                Instantly convert your recording into an accurate, AI-generated transcript.
              </p>
            </div>
            <button
              onClick={() => {
                onRemoveAudio();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-secondary rounded-full transition"
            >
              <X size={20} className="text-gray-500 dark:text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Audio File Preview */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-secondary/50 rounded-xl">
            {/* Waveform Icon */}
            <div className="w-24 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AudioLines size={32} className="text-blue-500" />
            </div>
            
            {/* File Info */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white dark:bg-background border border-gray-300 dark:border-border rounded text-sm font-medium text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setEditedName(audioFile.name);
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded transition"
                  >
                    <Check size={16} className="text-emerald-500" />
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(audioFile.name);
                      setIsEditingName(false);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-secondary rounded transition"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              ) : (
                <p className="font-medium text-gray-900 dark:text-foreground truncate">
                  {editedName}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                {formatFileSize(audioFile.duration)} - {formatDuration(audioFile.duration)}
              </p>
            </div>

            {/* Edit & Delete Buttons */}
            {!isEditingName && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-secondary rounded-lg transition"
                >
                  <Pencil size={18} className="text-gray-500 dark:text-muted-foreground" />
                </button>
                <button
                  onClick={() => {
                    onRemoveAudio();
                    onClose();
                    // Re-open the audio library modal
                    if (onBackToLibrary) {
                      setTimeout(() => onBackToLibrary(), 100);
                    }
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-secondary rounded-lg transition"
                >
                  <Trash2 size={18} className="text-gray-500 dark:text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Speakers Selector */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-foreground">
                How Many Speakers?
              </p>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                Automatically separates each voice into its own track for easier editing.
              </p>
            </div>
            <Select
              value={numSpeakers.toString()}
              onValueChange={(value) => setNumSpeakers(parseInt(value))}
            >
              <SelectTrigger className="w-36 bg-gray-100 dark:bg-secondary border-0 flex-shrink-0">
                <SelectValue placeholder="1 Speaker" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-background border-border">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Speaker{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add Audio Button */}
        <div className="px-6 pb-6">
          <Button
            onClick={() => onTranscribe(numSpeakers, editedName)}
            disabled={isTranscribing}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base rounded-xl"
          >
            {isTranscribing ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Audio'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranscribeConfirmModal;
