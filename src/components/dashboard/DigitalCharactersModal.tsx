import { useState } from 'react';
import { X, Search, Plus, Users, Star, ChevronLeft, Upload, FileText, Image as ImageIcon, Camera, Check, AlertCircle, Wand2, Shuffle } from 'lucide-react';

interface DigitalCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (character: any) => void;
}

const DigitalCharactersModal = ({ isOpen, onClose, onSelectCharacter }: DigitalCharactersModalProps) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createTab, setCreateTab] = useState('upload');
  const [characterName, setCharacterName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('custom');

  const characters = [
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
    { id: 23, name: 'Skye', image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&h=300&fit=crop' },
    { id: 24, name: 'Echo', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=300&h=300&fit=crop' }
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
    setView('create');
  };

  const handleBackToList = () => {
    setView('list');
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: <Upload size={20} /> },
    { id: 'describe', label: 'Describe', icon: <FileText size={20} /> },
    { id: 'creations', label: 'Creations', icon: <ImageIcon size={20} /> },
    { id: 'camera', label: 'Camera', icon: <Camera size={20} /> }
  ];

  const goodPhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200'
  ];

  const badPhotos = [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=200'
  ];

  const styles = [
    { id: 'realistic', label: 'Realistic', image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150' },
    { id: 'cinematic', label: 'Cinematic', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150' },
    { id: 'anime', label: 'Anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150' },
    { id: '3d-cartoon', label: '3D Cartoon', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150' },
    { id: 'comic-book', label: 'Comic Book', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=150' },
    { id: 'pop-art', label: 'Pop Art', image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=150' },
    { id: 'fantasy-art', label: 'Fantasy Art', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150' },
    { id: 'vector-portrait', label: 'Vector Portrait', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' },
    { id: 'neon-punk', label: 'Neon Punk', image: 'https://images.unsplash.com/photo-1534294668821-28a3054f4256?w=150' },
    { id: 'cyberpunk', label: 'Cyberpunk', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150' },
    { id: 'studio-ghibli', label: 'Studio Ghibli', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150' },
    { id: 'pixar-studio', label: 'Pixar Studio', image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=150' },
    { id: 'vector-cartoon', label: 'Vector Cartoon', image: 'https://images.unsplash.com/photo-1604076984203-587c92ab2e58?w=150' },
    { id: 'pencil-art', label: 'Pencil Art', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150' },
    { id: 'charcoal-art', label: 'Charcoal Art', image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=150' },
    { id: 'graffiti', label: 'Graffiti', image: 'https://images.unsplash.com/photo-1556139943-4bdca53adf1e?w=150' },
    { id: 'simps', label: 'Simps', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150' },
    { id: 'ink-sketch', label: 'Ink Sketch', image: 'https://images.unsplash.com/photo-1516641051054-9df6a1aad654?w=150' },
    { id: 'isometric', label: 'Isometric', image: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=150' },
    { id: 'line-art', label: 'Line Art', image: 'https://images.unsplash.com/photo-1494698421193-39d593c66fd7?w=150' },
    { id: 'colored-line-art', label: 'Colored Line Art', image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=150' },
    { id: 'origami', label: 'Origami', image: 'https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=150' },
    { id: 'clay', label: 'Clay', image: 'https://images.unsplash.com/photo-1624821661129-e49ed0e1f3f7?w=150' },
    { id: 'low-poly', label: 'Low Poly', image: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=150' },
    { id: 'crayons', label: 'Crayons', image: 'https://images.unsplash.com/photo-1578926078760-58e9e4e55a5e?w=150' },
    { id: 'film-noir', label: 'Film Noir', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=150' },
    { id: 'vintage', label: 'Vintage', image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=150' },
    { id: 'black-and-white', label: 'Black And White', image: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=150' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
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
          className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          
          {view === 'list' ? (
            /* LIST VIEW */
            <>
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
                    <span>Create Character</span>
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
                  <span>Characters</span>
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
                  
                  {/* New Character Box - Only in My Characters tab */}
                  {selectedTab === 'my-characters' && (
                    <div className="flex flex-col">
                      <button
                        onClick={handleNewCharacter}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-200 transition-colors">
                          <Plus size={48} strokeWidth={1.5} />
                        </div>
                      </button>
                      <div className="mt-2 text-center text-sm text-white font-medium">
                        New Character
                      </div>
                    </div>
                  )}

                  {/* Show character images only if NOT on My Characters tab */}
                  {selectedTab !== 'my-characters' && filteredCharacters.map((character) => (
                    <div key={character.id} className="flex flex-col">
                      <button
                        onClick={() => handleCharacterSelect(character)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Create Button on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                            <span className="text-white font-semibold">Create</span>
                          </div>
                        </div>
                      </button>
                      
                      {/* Character Name */}
                      <div className="mt-2 text-center text-sm text-white font-medium">
                        {character.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* CREATE VIEW */
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft size={20} />
                  <span className="font-medium">Create Character</span>
                </button>

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Title */}
              <div className="text-center py-6">
                <h1 className="text-3xl font-bold text-white">Create Your Character</h1>
                <p className="text-sm text-gray-400 mt-2">Choose How You Want To Start</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-center gap-4 px-8 pb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCreateTab(tab.id)}
                    className={`flex flex-col items-center gap-2 px-8 py-4 rounded-xl transition-all ${
                      createTab === tab.id
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-850'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 px-8 pb-6 overflow-hidden">
                
                {/* UPLOAD TAB */}
                {createTab === 'upload' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto h-full overflow-hidden">
                    
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Name Input */}
                      <div>
                        <label className="block text-white font-medium mb-2">Name</label>
                        <input
                          type="text"
                          placeholder="You'll use this name in prompts later, like '@Zara is surfing'"
                          value={characterName}
                          onChange={(e) => setCharacterName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-white font-medium mb-2">Image</label>
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className="relative h-80 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center hover:border-gray-600 transition-colors cursor-pointer"
                        >
                          <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*"
                          />
                          
                          <div className="flex flex-col items-center gap-3 text-center px-8">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                              <ImageIcon size={32} className="text-gray-500" />
                            </div>
                            <p className="text-gray-400">
                              Drag and drop an image<br />
                              or <span className="text-blue-500">select a file</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      
                      {/* Good Photos */}
                      <div className="bg-gray-900 rounded-xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                            <Check size={16} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold mb-1">UPLOAD 20+ PHOTOS FOR BEST RESULTS</h3>
                            <p className="text-gray-400 text-sm">
                              Upload high-quality images of a single person. The first image is crucial. Choose one that clearly highlights your character's key features. For the rest, include a mix of angles and facial expressions to help the system capture a consistent, realistic identity.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                          {goodPhotos.map((photo, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DESCRIBE TAB */}
                {createTab === 'describe' && (
                  <div className="max-w-6xl mx-auto">
                    
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-8 mb-6">
                      <div className="flex items-center gap-2 text-blue-500">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          1
                        </div>
                        <span className="font-medium">Details</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          2
                        </div>
                        <span className="font-medium">Preview</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          3
                        </div>
                        <span className="font-medium">Create</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Name Input */}
                        <div>
                          <label className="block text-white font-medium mb-2">Name</label>
                          <input
                            type="text"
                            placeholder="You'll use this name in prompts later, like '@Zara is surfing'"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-white font-medium mb-2">Describe Your Character</label>
                          <div className="relative">
                            <textarea
                              placeholder="Describe the defining traits of your character that need to stay consistent across all visuals. This includes physical attributes, outfits, accessories, or specific characteristics like 'a tall pirate with a scar'."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={6}
                              className="w-full px-4 py-3 pb-14 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
                            />
                            
                            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                              <button className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 text-black rounded-lg text-sm font-medium transition-colors">
                                <Shuffle size={14} />
                                <span>Random</span>
                              </button>
                              <button className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 text-black rounded-lg text-sm font-medium transition-colors">
                                <Wand2 size={14} />
                                <span>Enhance</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Style Selector */}
                      <div>
                        <label className="block text-white font-medium mb-2">Style</label>

                        <div className="h-[340px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-200">
                          <div className="grid grid-cols-3 gap-3">
                            {styles.map((style) => (
                              <button
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                                  selectedStyle === style.id
                                    ? 'ring-2 ring-green-500'
                                    : 'hover:ring-2 hover:ring-gray-600'
                                }`}
                              >
                                <img 
                                  src={style.image} 
                                  alt={style.label} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                                  <span className="text-white text-sm font-medium p-3">
                                    {style.label}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CREATIONS TAB */}
                {createTab === 'creations' && (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 text-lg">Your created characters will appear here</p>
                  </div>
                )}

                {/* CAMERA TAB */}
                {createTab === 'camera' && (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 text-lg">Camera feature coming soon</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-800 flex justify-center">
                <button className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors">
                  Create Character
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DigitalCharactersModal;
