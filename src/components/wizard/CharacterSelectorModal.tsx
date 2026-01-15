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

  // Characters with real photo URLs from Unsplash
  const allCharacters: Character[] = [
    { id: 'luna', name: 'Luna', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', description: 'Creative storyteller' },
    { id: 'aurora', name: 'Aurora', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', description: 'Professional business expert' },
    { id: 'zara', name: 'Zara', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', description: 'Fashion influencer' },
    { id: 'maya', name: 'Maya', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', description: 'Tech-savvy innovator' },
    { id: 'felix', name: 'Felix', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', description: 'Marketing strategist' },
    { id: 'jasper', name: 'Jasper', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', description: 'Fitness coach' },
    { id: 'aria', name: 'Aria', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop', description: 'Creative director' },
    { id: 'nova', name: 'Nova', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', description: 'Science educator' },
    { id: 'stella', name: 'Stella', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop', description: 'Music artist' },
    { id: 'ivy', name: 'Ivy', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop', description: 'Sustainability expert' },
    { id: 'jade', name: 'Jade', avatar: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=400&fit=crop', description: 'Health professional' },
    { id: 'miles', name: 'Miles', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', description: 'Education specialist' },
    { id: 'diego', name: 'Diego', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', description: 'Culinary expert' },
    { id: 'river', name: 'River', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop', description: 'Digital artist' },
    { id: 'willow', name: 'Willow', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop', description: 'Leadership coach' },
    { id: 'ruby', name: 'Ruby', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop', description: 'Travel blogger' },
    { id: 'kai', name: 'Kai', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop', description: 'Wellness guru' },
    { id: 'violet', name: 'Violet', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop', description: 'Software engineer' },
    { id: 'phoenix', name: 'Phoenix', avatar: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop', description: 'Entrepreneur' },
    { id: 'sage', name: 'Sage', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop', description: 'Life coach' },
    { id: 'atlas', name: 'Atlas', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop', description: 'Research scientist' },
    { id: 'finn', name: 'Finn', avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop', description: 'Photographer' },
    { id: 'skye', name: 'Skye', avatar: 'https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=400&h=400&fit=crop', description: 'Adventure guide' },
    { id: 'echo', name: 'Echo', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop', description: 'Podcast host' },
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
            <div className="grid grid-cols-8 gap-4">
              {filteredCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => {
                    onSelect(character);
                    onClose();
                  }}
                  className="group relative bg-[#0f1118] rounded-xl overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all"
                >
                  <div className="aspect-square">
                    <img 
                      src={character.avatar} 
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 text-center">
                    <h3 className="text-white font-medium text-sm truncate">{character.name}</h3>
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
