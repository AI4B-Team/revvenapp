import React, { useState } from 'react';
import { X, Search, Users, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
}

interface CharacterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (character: Character) => void;
}

const CharacterSelectorModal: React.FC<CharacterSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allCharacters: Character[] = [
    { id: 'luna', name: 'Luna', avatar: '👩', description: 'Creative storyteller' },
    { id: 'aurora', name: 'Aurora', avatar: '👩‍💼', description: 'Professional business expert' },
    { id: 'zara', name: 'Zara', avatar: '👩‍🦰', description: 'Fashion influencer' },
    { id: 'maya', name: 'Maya', avatar: '👩‍💻', description: 'Tech-savvy innovator' },
    { id: 'felix', name: 'Felix', avatar: '👨‍💼', description: 'Marketing strategist' },
    { id: 'jasper', name: 'Jasper', avatar: '👨', description: 'Fitness coach' },
    { id: 'aria', name: 'Aria', avatar: '👩‍🎨', description: 'Creative director' },
    { id: 'nova', name: 'Nova', avatar: '👩‍🔬', description: 'Science educator' },
    { id: 'stella', name: 'Stella', avatar: '👩‍🎤', description: 'Music artist' },
    { id: 'ivy', name: 'Ivy', avatar: '👩‍🌾', description: 'Sustainability expert' },
    { id: 'jade', name: 'Jade', avatar: '👩‍⚕️', description: 'Health professional' },
    { id: 'miles', name: 'Miles', avatar: '👨‍🎓', description: 'Education specialist' },
    { id: 'diego', name: 'Diego', avatar: '👨‍🍳', description: 'Culinary expert' },
    { id: 'river', name: 'River', avatar: '👨‍🎨', description: 'Digital artist' },
    { id: 'willow', name: 'Willow', avatar: '👩‍💼', description: 'Leadership coach' },
    { id: 'ruby', name: 'Ruby', avatar: '👩', description: 'Travel blogger' },
    { id: 'kai', name: 'Kai', avatar: '👨', description: 'Wellness guru' },
    { id: 'violet', name: 'Violet', avatar: '👩‍💻', description: 'Software engineer' },
    { id: 'phoenix', name: 'Phoenix', avatar: '👨‍💼', description: 'Entrepreneur' },
    { id: 'sage', name: 'Sage', avatar: '👩‍🏫', description: 'Life coach' },
    { id: 'atlas', name: 'Atlas', avatar: '👨‍🔬', description: 'Research scientist' },
    { id: 'finn', name: 'Finn', avatar: '👨', description: 'Photographer' },
    { id: 'skye', name: 'Skye', avatar: '👩', description: 'Adventure guide' },
    { id: 'echo', name: 'Echo', avatar: '👨‍🎤', description: 'Podcast host' },
  ];

  const myCharacters: Character[] = [];

  const displayCharacters = activeTab === 'all' ? allCharacters : myCharacters;
  const filteredCharacters = displayCharacters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-[#1a1d2e] border-0 p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold text-white">Characters</DialogTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0f1118] border-gray-700 text-white placeholder:text-gray-500 w-64"
                />
              </div>
              <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                + Create Character
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Users size={18} />
              Characters
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === 'my'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Star size={18} />
              My Characters
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {filteredCharacters.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {activeTab === 'my' ? 'No custom characters yet' : 'No characters found'}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => {
                    onSelect(character);
                    onClose();
                  }}
                  className="group relative bg-[#0f1118] rounded-xl overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl">
                    {character.avatar}
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-white font-medium text-sm">{character.name}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterSelectorModal;
