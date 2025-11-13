import { useState } from 'react';
import { X, Search, Plus, Users, Star } from 'lucide-react';

interface DigitalCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (character: any) => void;
}

const DigitalCharactersModal = ({ isOpen, onClose, onSelectCharacter }: DigitalCharactersModalProps) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const characters = [
    { id: 'new', name: 'New Character', isReference: true },
    { id: 1, name: 'Luna', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop' },
    { id: 2, name: 'Aurora', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop' },
    { id: 3, name: 'Zara', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop' },
    { id: 4, name: 'Maya', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop' },
    { id: 5, name: 'Felix', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop' },
    { id: 6, name: 'Jasper', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
    { id: 7, name: 'Aria', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop' },
    { id: 8, name: 'Nova', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop' },
    { id: 9, name: 'Stella', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop' },
    { id: 10, name: 'Ivy', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop' },
    { id: 11, name: 'Jade', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop' },
    { id: 12, name: 'Miles', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop' },
    { id: 13, name: 'Diego', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop' },
    { id: 14, name: 'River', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=300&h=300&fit=crop' },
    { id: 15, name: 'Willow', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop' },
    { id: 16, name: 'Ruby', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop' },
    { id: 17, name: 'Kai', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&h=300&fit=crop' },
    { id: 18, name: 'Violet', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop' },
    { id: 19, name: 'Phoenix', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop' },
    { id: 20, name: 'Sage', image: 'https://images.unsplash.com/photo-1512310604669-443f26c35f52?w=300&h=300&fit=crop' },
    { id: 21, name: 'Atlas', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop' },
    { id: 22, name: 'Finn', image: 'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=300&h=300&fit=crop' },
    { id: 23, name: 'Skye', image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&h=300&fit=crop' }
  ];

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleCharacterSelect = (character: any) => {
    if (onSelectCharacter) {
      onSelectCharacter(character);
    }
    onClose();
  };

  const handleNewCharacter = () => {
    console.log('Create new character');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Characters</h2>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* New Character Button */}
              <button
                onClick={handleNewCharacter}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                <span>New Character</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 px-8 py-4 border-b border-gray-800">
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Users size={18} />
              <span>All</span>
            </button>

            <button
              onClick={() => setSelectedTab('my-characters')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'my-characters'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Star size={18} />
              <span>My Characters</span>
            </button>
          </div>

          {/* Character Grid */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              
              {filteredCharacters.map((character) => (
                <div key={character.id} className="flex flex-col">
                  <button
                    onClick={() => handleCharacterSelect(character)}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all"
                  >
                    {character.isReference ? (
                      /* New Character Card */
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-200 transition-colors">
                        <Plus size={48} strokeWidth={1.5} />
                      </div>
                    ) : (
                      /* Character Portrait */
                      <>
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Create Button on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg">
                            Create
                          </div>
                        </div>
                      </>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Character Name */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-gray-300 text-sm font-medium truncate">
                      {character.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredCharacters.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No characters found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalCharactersModal;
