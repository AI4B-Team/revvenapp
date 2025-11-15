import React, { useState } from 'react';
import { Users, Plus, X, Check, Upload, Sparkles, User, Wand2 } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  voice?: string;
  personality?: string;
  ethnicity?: string;
  gender?: string;
  ageRange?: string;
}

interface CharactersPageProps {
  formData: {
    selectedCharacters: string[];
    defaultCharacter: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack?: boolean;
}

const CharactersPage: React.FC<CharactersPageProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
  canGoBack = true,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customCharacter, setCustomCharacter] = useState({
    name: '',
    description: '',
    voiceStyle: '',
    personality: '',
    ethnicity: '',
    gender: '',
    ageRange: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available pre-made characters
  const availableCharacters: Character[] = [
    {
      id: 'char1',
      name: 'Alex',
      avatar: '👨‍💼',
      description: 'Professional business expert',
      voice: 'Confident and authoritative',
      personality: 'Professional, knowledgeable',
      ethnicity: 'Caucasian',
      gender: 'Male',
      ageRange: '30-40',
    },
    {
      id: 'char2',
      name: 'Maya',
      avatar: '👩‍💻',
      description: 'Tech-savvy innovator',
      voice: 'Energetic and friendly',
      personality: 'Innovative, approachable',
      ethnicity: 'Asian',
      gender: 'Female',
      ageRange: '25-35',
    },
    {
      id: 'char3',
      name: 'Jordan',
      avatar: '🧑‍🎨',
      description: 'Creative storyteller',
      voice: 'Warm and engaging',
      personality: 'Creative, inspiring',
      ethnicity: 'African American',
      gender: 'Non-binary',
      ageRange: '28-38',
    },
    {
      id: 'char4',
      name: 'Sofia',
      avatar: '👩‍🏫',
      description: 'Educational expert',
      voice: 'Clear and informative',
      personality: 'Patient, educational',
      ethnicity: 'Hispanic',
      gender: 'Female',
      ageRange: '35-45',
    },
    {
      id: 'char5',
      name: 'Marcus',
      avatar: '👨‍🎤',
      description: 'Dynamic motivator',
      voice: 'Powerful and inspiring',
      personality: 'Motivational, energetic',
      ethnicity: 'African American',
      gender: 'Male',
      ageRange: '30-40',
    },
    {
      id: 'char6',
      name: 'Elena',
      avatar: '👩‍⚕️',
      description: 'Healthcare professional',
      voice: 'Caring and trustworthy',
      personality: 'Empathetic, professional',
      ethnicity: 'Middle Eastern',
      gender: 'Female',
      ageRange: '32-42',
    },
  ];

  const toggleCharacterSelection = (characterId: string) => {
    const currentSelected = formData.selectedCharacters || [];
    const newSelected = currentSelected.includes(characterId)
      ? currentSelected.filter(id => id !== characterId)
      : [...currentSelected, characterId];
    
    onUpdate({ selectedCharacters: newSelected });

    // If deselecting the default character, clear it
    if (!newSelected.includes(formData.defaultCharacter)) {
      onUpdate({ defaultCharacter: '' });
    }
  };

  const setAsDefault = (characterId: string) => {
    // First ensure the character is selected
    const currentSelected = formData.selectedCharacters || [];
    if (!currentSelected.includes(characterId)) {
      onUpdate({ 
        selectedCharacters: [...currentSelected, characterId],
        defaultCharacter: characterId 
      });
    } else {
      onUpdate({ defaultCharacter: characterId });
    }
  };

  const handleCreateCharacter = () => {
    const newErrors: Record<string, string> = {};

    if (!customCharacter.name.trim()) {
      newErrors.name = 'Character name is required';
    }
    if (!customCharacter.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create a new custom character
    const newCharacter: Character = {
      id: `custom_${Date.now()}`,
      name: customCharacter.name,
      avatar: '✨',
      description: customCharacter.description,
      voice: customCharacter.voiceStyle,
      personality: customCharacter.personality,
      ethnicity: customCharacter.ethnicity,
      gender: customCharacter.gender,
      ageRange: customCharacter.ageRange,
    };

    // Add to selected characters and set as default
    onUpdate({
      selectedCharacters: [...(formData.selectedCharacters || []), newCharacter.id],
      defaultCharacter: newCharacter.id,
    });

    // Reset modal
    setShowCreateModal(false);
    setCustomCharacter({
      name: '',
      description: '',
      voiceStyle: '',
      personality: '',
      ethnicity: '',
      gender: '',
      ageRange: '',
    });
    setErrors({});
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.defaultCharacter) {
      newErrors.defaultCharacter = 'Please select a default spokesperson';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Characters</h1>
            <p className="text-sm text-gray-600">Select your AI avatars and spokesperson</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Step 5 of 5</span>
            <span>100% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Instructions */}
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Your Brand's Voice & Face</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Select one or more AI characters to represent your brand across social media. 
                  Your <strong>default spokesperson</strong> will be used for automatic content creation. 
                  You can assign different characters to specific campaigns later.
                </p>
              </div>
            </div>
          </div>

          {/* Create Custom Character Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Available Characters</h2>
              <p className="text-sm text-gray-600">Select characters or create your own</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Create Custom Character
            </button>
          </div>

          {/* Character Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCharacters.map((character) => {
              const isSelected = (formData.selectedCharacters || []).includes(character.id);
              const isDefault = formData.defaultCharacter === character.id;

              return (
                <div
                  key={character.id}
                  className={`relative bg-white border-2 rounded-xl p-6 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 shadow-lg'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                  onClick={() => toggleCharacterSelection(character.id)}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}

                  {/* Default Badge */}
                  {isDefault && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      DEFAULT
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">{character.avatar}</div>
                    <h3 className="text-lg font-bold text-gray-900">{character.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{character.description}</p>
                  </div>

                  {/* Character Details */}
                  <div className="space-y-2 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Voice:</span>
                      <span>{character.voice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Personality:</span>
                      <span>{character.personality}</span>
                    </div>
                  </div>

                  {/* Set as Default Button */}
                  {isSelected && !isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAsDefault(character.id);
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-sm font-medium"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {errors.defaultCharacter && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <X size={16} />
                {errors.defaultCharacter}
              </p>
            </div>
          )}

          {/* Summary */}
          {formData.selectedCharacters.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Your Character Selection</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Default Spokesperson:</strong>{' '}
                      {formData.defaultCharacter
                        ? availableCharacters.find(c => c.id === formData.defaultCharacter)?.name
                        : 'Not selected'}
                    </p>
                    <p>
                      <strong>Total Characters:</strong> {formData.selectedCharacters.length}
                    </p>
                    <p className="text-gray-600">
                      Your default character will be used for automatic content creation. You can assign specific characters to different campaigns later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        {canGoBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
        )}
        
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleNext}
            disabled={!formData.defaultCharacter}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check size={18} />
            Review
          </button>
        </div>
      </div>

      {/* Create Custom Character Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Wand2 size={20} className="text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create Custom Character</h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setErrors({});
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              
              {/* Character Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customCharacter.name}
                  onChange={(e) => setCustomCharacter({ ...customCharacter, name: e.target.value })}
                  placeholder="e.g., Sarah, Michael, Alex"
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customCharacter.description}
                  onChange={(e) => setCustomCharacter({ ...customCharacter, description: e.target.value })}
                  placeholder="e.g., Energetic fitness coach who motivates and inspires"
                  rows={3}
                  className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Voice Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Style
                </label>
                <input
                  type="text"
                  value={customCharacter.voiceStyle}
                  onChange={(e) => setCustomCharacter({ ...customCharacter, voiceStyle: e.target.value })}
                  placeholder="e.g., Warm and friendly, Professional and clear"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Personality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personality Traits
                </label>
                <input
                  type="text"
                  value={customCharacter.personality}
                  onChange={(e) => setCustomCharacter({ ...customCharacter, personality: e.target.value })}
                  placeholder="e.g., Energetic, inspiring, positive"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={customCharacter.gender}
                    onChange={(e) => setCustomCharacter({ ...customCharacter, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Range
                  </label>
                  <select
                    value={customCharacter.ageRange}
                    onChange={(e) => setCustomCharacter({ ...customCharacter, ageRange: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select...</option>
                    <option value="18-25">18-25</option>
                    <option value="25-35">25-35</option>
                    <option value="35-45">35-45</option>
                    <option value="45-55">45-55</option>
                    <option value="55+">55+</option>
                  </select>
                </div>

                {/* Ethnicity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity
                  </label>
                  <select
                    value={customCharacter.ethnicity}
                    onChange={(e) => setCustomCharacter({ ...customCharacter, ethnicity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select...</option>
                    <option value="Caucasian">Caucasian</option>
                    <option value="African American">African American</option>
                    <option value="Asian">Asian</option>
                    <option value="Hispanic">Hispanic</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setErrors({});
                }}
                className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCharacter}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
              >
                <Plus size={16} />
                Create Character
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
