import { useState } from 'react';
import { X, Search, Plus, Users, Bookmark, Flame } from 'lucide-react';

interface DigitalCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (character: any) => void;
}

const DigitalCharactersModal = ({ isOpen, onClose, onSelectCharacter }: DigitalCharactersModalProps) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const characters = [
    { id: 'ref', name: 'Reference Image', isReference: true },
    { id: 1, name: '@Kat', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop', verified: true },
    { id: 2, name: '@Helena', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop', verified: true },
    { id: 3, name: '@Mei', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop', verified: true },
    { id: 4, name: '@Camile', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop', verified: true },
    { id: 5, name: '@Rafael', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop', verified: true },
    { id: 6, name: '@rohan', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', verified: true },
    { id: 7, name: '@aanya', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop', verified: true },
    { id: 8, name: '@noa', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop', verified: true },
    { id: 9, name: '@lucia', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop', verified: true },
    { id: 10, name: '@sophia', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop', verified: true },
    { id: 11, name: '@sia', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop', verified: true },
    { id: 12, name: '@samuel', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop', verified: true },
    { id: 13, name: '@alvaro', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop', verified: true },
    { id: 14, name: '@aideen', image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=300&h=300&fit=crop', verified: true },
    { id: 15, name: '@larissa', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop', verified: true },
    { id: 16, name: '@gabby', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop', verified: true },
    { id: 17, name: '@kenji', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&h=300&fit=crop', verified: true },
    { id: 18, name: '@marcia', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop', verified: true },
    { id: 19, name: '@alejandro', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop', verified: true },
    { id: 20, name: '@freja', image: 'https://images.unsplash.com/photo-1512310604669-443f26c35f52?w=300&h=300&fit=crop', verified: true },
    { id: 21, name: '@alex', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop', verified: true },
    { id: 22, name: '@jonas', image: 'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=300&h=300&fit=crop', verified: true },
    { id: 23, name: '@sara', image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&h=300&fit=crop', verified: true },
    { id: 24, name: '@john', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop', verified: true },
    { id: 25, name: '@mary', image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=300&h=300&fit=crop', verified: true },
    { id: 26, name: '@emily', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop', verified: true },
    { id: 27, name: '@belinda', image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=300&h=300&fit=crop', verified: true },
    { id: 28, name: '@jackson', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=300&h=300&fit=crop', verified: true },
    { id: 29, name: '@kevin', image: 'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=300&h=300&fit=crop', verified: true },
    { id: 30, name: '@laura', image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&h=300&fit=crop', verified: true },
    { id: 31, name: '@bella', image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=300&fit=crop', verified: true }
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                <span>New character</span>
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
              <Bookmark size={18} />
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
                      /* Reference Image Card */
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-gray-300 transition-colors">
                        <svg 
                          width="48" 
                          height="48" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.5"
                          className="mb-2"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M14.526 12.621 6 21l6.5-6.5 4.5 4.5" />
                        </svg>
                      </div>
                    ) : (
                      /* Character Portrait */
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Character Name */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-gray-300 text-sm font-medium truncate">
                      {character.name}
                    </span>
                    {character.verified && (
                      <Flame size={14} className="text-orange-500 shrink-0" />
                    )}
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
