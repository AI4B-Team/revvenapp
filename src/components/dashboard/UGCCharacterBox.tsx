import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AudioLines,
  ChevronDown,
  MoreVertical,
  Trash2,
  Play,
  X,
  Search,
  Bookmark,
  Plus,
  MessageSquare,
  RotateCcw,
  Info,
  Check,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Voice {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  age: 'Adult' | 'Young' | 'Child';
  accent: string;
  avatar?: string;
}

interface VoiceSettings {
  speed: number;
  stability: number;
  clarity: number;
  styleExaggeration: number;
  speakerBoost: boolean;
}

interface UGCCharacterBoxProps {
  character: {
    id: string;
    name: string;
    image_url?: string;
    image?: string;
  };
  script: string;
  onDelete: () => void;
}

// ============================================
// SAMPLE DATA
// ============================================

const voiceLibrary: Voice[] = [
  { id: 'aria', name: 'Aria', gender: 'Female', age: 'Adult', accent: 'American English accent' },
  { id: 'emily', name: 'Emily', gender: 'Female', age: 'Adult', accent: 'American English accent' },
  { id: 'adrian', name: 'Adrian', gender: 'Male', age: 'Adult', accent: 'American English accent' },
  { id: 'oscar', name: 'Oscar', gender: 'Male', age: 'Adult', accent: 'Oscar accent' },
  { id: 'emily-au', name: 'Emily', gender: 'Female', age: 'Adult', accent: 'Australian English accent' },
  { id: 'juan', name: 'Juan', gender: 'Male', age: 'Adult', accent: 'American English accent' },
  { id: 'fabian', name: 'Fabian', gender: 'Male', age: 'Adult', accent: 'American English accent' },
  { id: 'cecilia', name: 'Cecilia', gender: 'Female', age: 'Adult', accent: 'American English accent' },
  { id: 'emily-uk', name: 'Emily', gender: 'Female', age: 'Adult', accent: 'British English accent' },
  { id: 'aria-2', name: 'Aria', gender: 'Female', age: 'Adult', accent: 'American English accent' },
  { id: 'aria-3', name: 'Aria', gender: 'Female', age: 'Adult', accent: 'American English accent' },
  { id: 'owen', name: 'Owen', gender: 'Male', age: 'Adult', accent: 'American English accent' },
];

// ============================================
// SLIDER COMPONENT
// ============================================

const Slider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
}> = ({ value, onChange, min = 0, max = 100, leftLabel, rightLabel }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e);
  };

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newValue = (x / rect.width) * (max - min) + min;
    onChange(Math.round(newValue));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updateValue(e);
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div
        ref={sliderRef}
        className="relative h-2 bg-slate-200 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute h-full bg-emerald-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{leftLabel}</span>
          <span className="text-xs text-muted-foreground">{rightLabel}</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// VOICE SETTINGS POPUP
// ============================================

const VoiceSettingsPopup: React.FC<{
  settings: VoiceSettings;
  onChange: (settings: VoiceSettings) => void;
  onClose: () => void;
}> = ({ settings, onChange, onClose }) => {
  const handleReset = () => {
    onChange({
      speed: 75,
      stability: 60,
      clarity: 85,
      styleExaggeration: 25,
      speakerBoost: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      className="absolute left-full top-0 ml-2 w-72 bg-background rounded-xl shadow-2xl border border-border p-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-base font-semibold text-foreground mb-4">Voice Settings</h3>

      <div className="space-y-4">
        {/* Speed */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Speed</label>
          <Slider
            value={settings.speed}
            onChange={(v) => onChange({ ...settings, speed: v })}
            leftLabel="Slow"
            rightLabel="Fast"
          />
        </div>

        {/* Stability */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-sm font-medium text-foreground">Stability</label>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <Slider
            value={settings.stability}
            onChange={(v) => onChange({ ...settings, stability: v })}
            leftLabel="More variable"
            rightLabel="More stable"
          />
        </div>

        {/* Clarity + Similarity */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-sm font-medium text-foreground">Clarity + Similarity</label>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <Slider
            value={settings.clarity}
            onChange={(v) => onChange({ ...settings, clarity: v })}
            leftLabel="More variable"
            rightLabel="More stable"
          />
        </div>

        {/* Style Exaggeration */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-sm font-medium text-foreground">Style Exaggeration</label>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <Slider
            value={settings.styleExaggeration}
            onChange={(v) => onChange({ ...settings, styleExaggeration: v })}
            leftLabel="None"
            rightLabel="Exaggerated"
          />
        </div>

        {/* Speaker Boost */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">Speaker Boost</span>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <button
            onClick={() => onChange({ ...settings, speakerBoost: !settings.speakerBoost })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.speakerBoost ? 'bg-emerald-500' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.speakerBoost ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Values
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// VOICE LIBRARY MODAL
// ============================================

const VoiceLibraryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
  characterAvatar?: string;
}> = ({ isOpen, onClose, currentVoice, onSelectVoice, characterAvatar }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'my' | 'imported'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(currentVoice);
  const [languageFilter, setLanguageFilter] = useState('English');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const filteredVoices = voiceLibrary.filter(voice => {
    if (searchQuery && !voice.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleUseVoice = () => {
    onSelectVoice(selectedVoice);
    onClose();
  };

  const playVoicePreview = (voiceId: string) => {
    if (isPlaying === voiceId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(voiceId);
      setTimeout(() => setIsPlaying(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Choose Voice</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all">
                <Plus className="w-4 h-4" />
                New Voice
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(85vh-140px)]">
            {/* Left Panel - Avatar Preview */}
            <div className="w-80 border-r border-border p-6">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden">
                <div className="absolute top-3 right-3 px-2 py-1 bg-background/80 text-foreground text-xs font-medium rounded">
                  AVATAR
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {characterAvatar ? (
                    <img src={characterAvatar} alt="Character" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-8xl">👩</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Voice Selection */}
            <div className="flex-1 flex flex-col">
              {/* Tabs */}
              <div className="flex items-center gap-6 px-6 pt-4 border-b border-border">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'library'
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Voice Library
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'my'
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Voices
                </button>
                <button
                  onClick={() => setActiveTab('imported')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'imported'
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Imported
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 px-6 py-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>

                <button className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/80 transition-colors">
                  {languageFilter}
                  <ChevronDown className="w-4 h-4" />
                </button>

                <button className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/80 transition-colors">
                  Accents
                  <ChevronDown className="w-4 h-4" />
                </button>

                <button className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/80 transition-colors">
                  Gender
                  <ChevronDown className="w-4 h-4" />
                </button>

                <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Bookmark className="w-4 h-4" />
                  Saved
                </button>
              </div>

              {/* Voice Grid */}
              <div className="flex-1 overflow-auto px-6 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  {filteredVoices.map((voice) => (
                    <motion.button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        selectedVoice.id === voice.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                          : 'border-border hover:border-muted-foreground bg-background'
                      }`}
                    >
                      {selectedVoice.id === voice.id && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Selected
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playVoicePreview(voice.id);
                          }}
                          className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                          {isPlaying === voice.id ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ height: [8, 16, 8] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                  className="w-1 bg-emerald-500 rounded-full"
                                />
                              ))}
                            </div>
                          ) : (
                            <AudioLines className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground">{voice.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {voice.gender}
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {voice.age}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{voice.accent}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <button className="p-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                    <Play className="w-4 h-4 text-emerald-500" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {currentVoice.name}
                    <span className="text-muted-foreground/60 ml-2">Current voice</span>
                  </span>
                  <span className="text-muted-foreground/40">→</span>
                  <span className="text-sm text-muted-foreground/60">Please select a new voice</span>
                </div>

                <button
                  onClick={handleUseVoice}
                  disabled={selectedVoice.id === currentVoice.id}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                    selectedVoice.id === currentVoice.id
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  Use This Voice
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MAIN CHARACTER BOX COMPONENT
// ============================================

const UGCCharacterBox: React.FC<UGCCharacterBoxProps> = ({
  character,
  script,
  onDelete,
}) => {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showVoiceLibrary, setShowVoiceLibrary] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(voiceLibrary[0]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    speed: 75,
    stability: 60,
    clarity: 85,
    styleExaggeration: 25,
    speakerBoost: true,
  });

  const handlePlayAudio = async () => {
    if (!script.trim()) return;
    
    setIsGeneratingAudio(true);
    // Simulate audio generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsGeneratingAudio(false);
    setIsPlayingPreview(true);
    
    // Simulate audio playback duration
    setTimeout(() => {
      setIsPlayingPreview(false);
    }, 3000);
  };

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
  };

  const characterImage = character.image_url || character.image;

  return (
    <>
      <div className="flex items-center gap-2 mt-4 mb-2">
        <div className="relative flex items-center gap-3 px-3 py-2.5 bg-background border-2 border-slate-400 dark:border-slate-500 rounded-xl min-w-[280px]">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 flex items-center justify-center overflow-hidden flex-shrink-0">
            {characterImage ? (
              <img src={characterImage} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👩</span>
            )}
          </div>

          {/* Voice Selector with darker background */}
          <button
            onClick={() => setShowVoiceLibrary(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted/70 hover:bg-muted rounded-md transition-colors"
          >
            <AudioLines className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{selectedVoice.name}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-destructive/10 rounded-md transition-colors group"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
            </button>
          </div>

          {/* Voice Settings Popup */}
          <AnimatePresence>
            {showVoiceSettings && (
              <VoiceSettingsPopup
                settings={voiceSettings}
                onChange={setVoiceSettings}
                onClose={() => setShowVoiceSettings(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Play Button - Shows when script has content */}
        <AnimatePresence>
          {script.trim() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handlePlayAudio}
              disabled={isGeneratingAudio}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all flex-shrink-0 ${
                isGeneratingAudio || isPlayingPreview
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isGeneratingAudio ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"
                />
              ) : isPlayingPreview ? (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-emerald-600 rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Library Modal */}
      <VoiceLibraryModal
        isOpen={showVoiceLibrary}
        onClose={() => setShowVoiceLibrary(false)}
        currentVoice={selectedVoice}
        onSelectVoice={handleVoiceSelect}
        characterAvatar={characterImage}
      />

      {/* Click outside to close settings */}
      {showVoiceSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowVoiceSettings(false)}
        />
      )}
    </>
  );
};

export default UGCCharacterBox;
