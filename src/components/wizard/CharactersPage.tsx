import React, { useState } from 'react';
import { Users, Plus, X, Check, Upload, Sparkles, User, Wand2, Mic } from 'lucide-react';
import TutorialModal from './TutorialModal';
import DigitalCharactersModal from '../dashboard/DigitalCharactersModal';
import VoiceSelectorModal from './VoiceSelectorModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  voice?: string;
  selectedVoice?: string;
  personality?: string;
  ethnicity?: string;
  gender?: string;
  ageRange?: string;
}

interface CharactersPageProps {
  formData: {
    selectedCharacters: string[];
    defaultCharacter: string;
    characterVoices?: Record<string, string>;
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
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTutorial, setShowTutorial] = useState(false);

  // Load custom characters from localStorage
  const getCustomCharacters = (): Character[] => {
    const saved = localStorage.getItem('customCharacters');
    return saved ? JSON.parse(saved) : [];
  };

  const [customCharacters, setCustomCharacters] = useState<Character[]>(getCustomCharacters());

  // Available voice options (Eleven Labs voices)
  const voiceOptions = [
    { id: 'aria', name: 'Aria' },
    { id: 'roger', name: 'Roger' },
    { id: 'sarah', name: 'Sarah' },
    { id: 'laura', name: 'Laura' },
    { id: 'charlie', name: 'Charlie' },
    { id: 'george', name: 'George' },
    { id: 'callum', name: 'Callum' },
    { id: 'river', name: 'River' },
    { id: 'liam', name: 'Liam' },
    { id: 'charlotte', name: 'Charlotte' },
    { id: 'alice', name: 'Alice' },
    { id: 'matilda', name: 'Matilda' },
    { id: 'will', name: 'Will' },
    { id: 'jessica', name: 'Jessica' },
    { id: 'eric', name: 'Eric' },
    { id: 'chris', name: 'Chris' },
    { id: 'brian', name: 'Brian' },
    { id: 'daniel', name: 'Daniel' },
    { id: 'lily', name: 'Lily' },
    { id: 'bill', name: 'Bill' },
  ];

  // Pre-made characters
  const premadeCharacters: Character[] = [
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

  // Combine pre-made and custom characters
  const handleCharacterSelect = (character: any) => {
    setSelectedCharacter(character);
    onUpdate({
      selectedCharacters: [character.id],
      defaultCharacter: character.id,
    });
  };

  const handleVoiceSelect = (voice: any) => {
    setSelectedVoice(voice);
    onUpdate({
      characterVoices: { [formData.defaultCharacter]: voice.id },
    });
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCharacter) {
      newErrors.character = 'Please add a spokesperson';
    }

    if (!selectedVoice) {
      newErrors.voice = 'Please add a voice';
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Characters</h1>
            <p className="text-sm text-gray-600">Select your AI character and voice</p>
          </div>
          <button 
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tutorial
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Step 5 of 5</span>
            <span>100% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
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
                <h3 className="font-semibold text-gray-900 mb-2">Choose Your Brand's Spokesperson</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Select an AI character to represent your brand across social media. Your selection automatically becomes your default spokesperson.
                </p>
              </div>
            </div>
          </div>

          {/* Choose Spokesperson Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">CHOOSE SPOKESPERSON</h2>
            
            <button
              onClick={() => setShowCharacterModal(true)}
              className="group relative w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-cyan-500 hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
            >
              {selectedCharacter ? (
                <div className="text-center">
                  <div className="text-6xl mb-2">{selectedCharacter.avatar}</div>
                  <p className="text-sm font-medium text-gray-900">{selectedCharacter.name}</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-cyan-50 transition-colors">
                    <Plus size={32} className="text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Add Character</p>
                </>
              )}
            </button>

            {errors.character && (
              <div className="mt-2 text-sm text-red-600">{errors.character}</div>
            )}
          </div>

          {/* Choose Voice Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">CHOOSE VOICE</h2>
            
            <button
              onClick={() => setShowVoiceModal(true)}
              className="group relative w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-cyan-500 hover:bg-gray-50 transition-all flex flex-col items-center justify-center"
            >
              {selectedVoice ? (
                <div className="text-center">
                  <div className="text-6xl mb-2">{selectedVoice.avatar}</div>
                  <p className="text-sm font-medium text-gray-900">{selectedVoice.name}</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-cyan-50 transition-colors">
                    <Plus size={32} className="text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Add Voice</p>
                </>
              )}
            </button>

            {errors.voice && (
              <div className="mt-2 text-sm text-red-600">{errors.voice}</div>
            )}
          </div>

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
            disabled={!selectedCharacter || !selectedVoice}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check size={18} />
            Review
          </button>
        </div>
      </div>

      {/* Character Selector Modal */}
      <DigitalCharactersModal
        isOpen={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
        onSelectCharacter={handleCharacterSelect}
      />

      {/* Voice Selector Modal */}
      <VoiceSelectorModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSelect={handleVoiceSelect}
      />

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Characters Tutorial"
      />
    </div>
  );
};

export default CharactersPage;
