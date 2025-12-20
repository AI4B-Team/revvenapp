import React, { useState, useRef } from 'react';
import { 
  Search, 
  Mic, 
  Sparkles, 
  Play, 
  Pause, 
  Upload, 
  Check,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Voice {
  id: string;
  name: string;
  description: string;
  color: string;
  selected?: boolean;
}

interface AudioTrack {
  id: string;
  name: string;
  duration: string;
  thumbnail?: string;
}

interface SoundEffectCategory {
  name: string;
  effects: AudioTrack[];
}

interface EditorAudioPanelProps {
  onSelectVoice?: (voice: Voice) => void;
  onSelectTrack?: (track: AudioTrack) => void;
}

const voices: Voice[] = [
  { id: '1', name: 'Maya', description: 'feminine, young, chill', color: 'bg-gradient-to-r from-pink-400 to-purple-400' },
  { id: '2', name: 'Arjun', description: 'masculine, middle aged, intense', color: 'bg-gradient-to-r from-blue-400 to-indigo-400' },
  { id: '3', name: 'Serene', description: 'feminine, young, calm', color: 'bg-gradient-to-r from-teal-400 to-cyan-400' },
  { id: '4', name: 'Bernard', description: 'masculine, middle aged, confident', color: 'bg-gradient-to-r from-orange-400 to-amber-400' },
  { id: '5', name: 'Billy', description: 'masculine, middle aged, hyped', color: 'bg-gradient-to-r from-green-400 to-emerald-400' },
  { id: '6', name: 'Luna', description: 'feminine, young, energetic', color: 'bg-gradient-to-r from-violet-400 to-purple-400' },
];

const musicTracks: AudioTrack[] = [
  { id: '1', name: 'Synthwave Memories', duration: '2:56' },
  { id: '2', name: 'Lofi Background Vlog Hip Hop', duration: '2:01' },
  { id: '3', name: 'Deep House In Cafe', duration: '4:48' },
  { id: '4', name: 'King And Queens, New York', duration: '2:56' },
  { id: '5', name: 'Are U Ok', duration: '1:29' },
];

const sfxCategories: SoundEffectCategory[] = [
  {
    name: 'Transition',
    effects: [
      { id: 't1', name: 'Text Pop Up Sound Effect', duration: '0:11' },
      { id: 't2', name: 'Right Answer Sound Effect', duration: '0:06' },
      { id: 't3', name: 'Axe Swing Sound Effect', duration: '0:05' },
      { id: 't4', name: 'Cartoon Wink Sound Effect', duration: '0:04' },
      { id: 't5', name: 'Superhero Landing Sound Effect', duration: '0:07' },
    ]
  },
  {
    name: 'Animation',
    effects: [
      { id: 'a1', name: 'Whistle Sound Effect', duration: '0:06' },
      { id: 'a2', name: 'Text Pop Up Sound Effect', duration: '0:11' },
      { id: 'a3', name: 'Glass Breaking Explosion Sound Effect', duration: '0:07' },
      { id: 'a4', name: 'Poker Chips Sound Effect', duration: '0:12' },
    ]
  },
  {
    name: 'Gaming',
    effects: [
      { id: 'g1', name: 'Level Up Achievement', duration: '0:03' },
      { id: 'g2', name: 'Coin Collect Sound', duration: '0:02' },
      { id: 'g3', name: 'Game Over Jingle', duration: '0:05' },
      { id: 'g4', name: 'Power Up Sound', duration: '0:04' },
    ]
  },
  {
    name: 'Notifications',
    effects: [
      { id: 'n1', name: 'Message Received Ding', duration: '0:02' },
      { id: 'n2', name: 'Success Chime', duration: '0:03' },
      { id: 'n3', name: 'Error Alert Buzz', duration: '0:02' },
      { id: 'n4', name: 'Notification Pop', duration: '0:01' },
    ]
  },
  {
    name: 'Nature',
    effects: [
      { id: 'na1', name: 'Forest Bird Singing', duration: '2:13' },
      { id: 'na2', name: 'Rain on Window', duration: '3:00' },
      { id: 'na3', name: 'Thunder Rumble', duration: '0:08' },
      { id: 'na4', name: 'Ocean Waves', duration: '2:30' },
    ]
  },
];

const sfxCategoryTabs = ['All', 'Transition', 'Animation', 'Gaming', 'Meme', 'Win'];
const musicCategories = ['All', 'Ambient', 'Chill', 'Happy', 'Epic', 'Corporate'];

const EditorAudioPanel: React.FC<EditorAudioPanelProps> = ({ onSelectVoice, onSelectTrack }) => {
  const [audioSubTab, setAudioSubTab] = useState<'voices' | 'music' | 'effects'>('voices');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [playingEffect, setPlayingEffect] = useState<string | null>(null);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [sfxSearchQuery, setSfxSearchQuery] = useState('');
  const [activeMusicCat, setActiveMusicCat] = useState('All');
  const [activeSfxCat, setActiveSfxCat] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice.id);
    if (onSelectVoice) {
      onSelectVoice(voice);
    }
    toast.success(`Selected ${voice.name}`);
  };

  const handlePlayVoice = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voiceId);
      setTimeout(() => setPlayingVoice(null), 3000);
    }
  };

  const handlePlayEffect = (effectId: string) => {
    if (playingEffect === effectId) {
      setPlayingEffect(null);
    } else {
      setPlayingEffect(effectId);
      setTimeout(() => setPlayingEffect(null), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('audio/')) {
        toast.error(`${file.name} is not an audio file`);
        return;
      }
      toast.success(`Uploaded ${file.name}`);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredVoices = voices.filter(v => 
    v.name.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(voiceSearchQuery.toLowerCase())
  );

  const filteredSfxCategories = activeSfxCat === 'All' 
    ? sfxCategories 
    : sfxCategories.filter(cat => cat.name === activeSfxCat);

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
        {[
          { id: 'voices' as const, label: 'Voices' },
          { id: 'music' as const, label: 'Music' },
          { id: 'effects' as const, label: 'Sound Effects' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAudioSubTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              audioSubTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Voices Tab */}
      {audioSubTab === 'voices' && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              <Mic className="w-4 h-4" />
              Clone
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              <Sparkles className="w-4 h-4" />
              Voiceover
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={voiceSearchQuery}
              onChange={(e) => setVoiceSearchQuery(e.target.value)}
              placeholder="Choose a voice from below or search"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
            />
          </div>

          <div className="space-y-2">
            {filteredVoices.map((voice) => (
              <div
                key={voice.id}
                onClick={() => handleVoiceSelect(voice)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                  selectedVoice === voice.id 
                    ? 'bg-primary/5 border-primary' 
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVoice(voice.id);
                  }}
                  className={`w-10 h-10 rounded-full ${voice.color} flex items-center justify-center text-white`}
                >
                  {playingVoice === voice.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{voice.name}</p>
                  <p className="text-sm text-gray-500">{voice.description}</p>
                </div>
                {selectedVoice === voice.id && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Music Tab */}
      {audioSubTab === 'music' && (
        <div className="flex-1 overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={musicSearchQuery}
              onChange={(e) => setMusicSearchQuery(e.target.value)}
              placeholder="Search music..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
            />
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            {musicCategories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveMusicCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeMusicCat === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
            <button className="px-2 py-1.5 text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {musicTracks.map((track) => (
              <div 
                key={track.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{track.name}</p>
                  <p className="text-xs text-gray-500">{track.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sound Effects Tab */}
      {audioSubTab === 'effects' && (
        <div className="flex-1 overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={sfxSearchQuery}
              onChange={(e) => setSfxSearchQuery(e.target.value)}
              placeholder="Search sound effects..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border-0"
            />
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            {sfxCategoryTabs.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveSfxCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeSfxCat === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
            <button className="px-2 py-1.5 text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Categorized sound effects */}
          <div className="space-y-6">
            {filteredSfxCategories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {category.effects.map((sfx) => (
                    <div 
                      key={sfx.id} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
                    >
                      <button
                        onClick={() => handlePlayEffect(sfx.id)}
                        className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        {playingEffect === sfx.id ? (
                          <Pause className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{sfx.name}</p>
                        <p className="text-xs text-gray-500">{sfx.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorAudioPanel;
