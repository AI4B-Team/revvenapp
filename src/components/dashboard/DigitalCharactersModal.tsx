import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface DigitalCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (character: any) => void;
}

const DigitalCharactersModal = ({ isOpen, onClose, onSelectCharacter }: DigitalCharactersModalProps) => {
  const [characters, setCharacters] = useState([
    {
      id: 1,
      name: 'Untitled character',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400'
    },
    {
      id: 2,
      name: 'Business Professional',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
    },
    {
      id: 3,
      name: 'Fashion Model',
      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400'
    }
  ]);

  if (!isOpen) return null;

  const handleNewCharacter = () => {
    // Handle creating a new character
    console.log('Create new character');
  };

  const handleSelectCharacter = (character: any) => {
    if (onSelectCharacter) {
      onSelectCharacter(character);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">Digital Characters</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-88px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* New Character Card */}
              <button
                onClick={handleNewCharacter}
                className="aspect-[3/4] bg-gray-100 hover:bg-gray-200 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all group border-2 border-dashed border-gray-300 hover:border-gray-400"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Plus size={32} className="text-gray-600" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-semibold text-gray-700">New Character</span>
              </button>

              {/* Existing Character Cards */}
              {characters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => handleSelectCharacter(character)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden group hover:ring-4 hover:ring-blue-500 transition-all"
                >
                  {/* Character Image */}
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Character Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">
                      {character.name}
                    </h3>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalCharactersModal;
