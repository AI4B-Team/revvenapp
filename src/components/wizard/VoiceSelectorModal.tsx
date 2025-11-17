import React, { useState } from 'react';
import { Play, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const voices: Voice[] = [
    { id: 'clyde', name: 'Clyde', gender: 'male', avatar: '👨' },
    { id: 'roger', name: 'Roger', gender: 'male', avatar: '👨‍💼' },
    { id: 'sarah', name: 'Sarah', gender: 'female', avatar: '👩' },
    { id: 'laura', name: 'Laura', gender: 'female', avatar: '👩‍💼' },
    { id: 'charlie', name: 'Charlie', gender: 'male', avatar: '👨‍🦰' },
    { id: 'george', name: 'George', gender: 'male', avatar: '👨‍🦳' },
    { id: 'callum', name: 'Callum', gender: 'male', avatar: '👨' },
    { id: 'river', name: 'River', gender: 'neutral', avatar: '🧑' },
    { id: 'harry', name: 'Harry', gender: 'male', avatar: '👨‍🎓' },
    { id: 'liam', name: 'Liam', gender: 'male', avatar: '👨‍💻' },
    { id: 'alice', name: 'Alice', gender: 'female', avatar: '👩‍🔬' },
    { id: 'matilda', name: 'Matilda', gender: 'female', avatar: '👩‍🏫' },
    { id: 'will', name: 'Will', gender: 'male', avatar: '👨‍🎤' },
    { id: 'jessica', name: 'Jessica', gender: 'female', avatar: '👩‍🎨' },
    { id: 'eric', name: 'Eric', gender: 'male', avatar: '👨‍🍳' },
    { id: 'chris', name: 'Chris', gender: 'male', avatar: '👨‍🔧' },
    { id: 'brian', name: 'Brian', gender: 'male', avatar: '👨‍⚕️' },
    { id: 'daniel', name: 'Daniel', gender: 'male', avatar: '👨‍✈️' },
    { id: 'lily', name: 'Lily', gender: 'female', avatar: '👩‍🌾' },
    { id: 'bill', name: 'Bill', gender: 'male', avatar: '👨‍🏫' },
  ];

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice.id);
    onSelect(voice);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-black border-0 p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
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
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Voice Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-250px)]">
          <div className="grid grid-cols-2 gap-3">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleSelectVoice(voice)}
                className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 hover:border-cyan-500"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-2xl">
                  {voice.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium text-sm">{voice.name}</div>
                  <div className="text-gray-400 text-xs capitalize">{voice.gender}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Play voice preview
                  }}
                  className="p-2 bg-gray-800 rounded-full hover:bg-cyan-600 transition-colors"
                >
                  <Play size={14} className="text-white" />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Select
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSelectorModal;
