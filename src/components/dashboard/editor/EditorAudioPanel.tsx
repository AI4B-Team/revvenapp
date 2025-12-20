import React, { useState, useRef } from 'react';
import { 
  Search, 
  Mic, 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  Upload, 
  Check,
  MoreHorizontal 
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

const soundEffects: AudioTrack[] = [
  { id: '1', name: 'Large Crowd Medium Ovation', duration: '0:10' },
  { id: '2', name: 'Forest Bird Singing (Nature, Quiet...)', duration: '2:13' },
  { id: '3', name: 'Tune Fm Radio', duration: '0:03' },
  { id: '4', name: 'Fail Error Mistake Out of Time So...', duration: '0:02' },
  { id: '5', name: 'Mouse Click Computer', duration: '0:00' },
];

const musicCategories = ['All', 'Ambient', 'Chill', 'Happy'];
const sfxCategories = ['All', 'Cartoon', 'Clicks', 'Magic'];

const EditorAudioPanel: React.FC<EditorAudioPanelProps> = ({ onSelectVoice, onSelectTrack }) => {
  const [audioSubTab, setAudioSubTab] = useState<'voices' | 'music' | 'effects'>('voices');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
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
      // Simulate stopping after a preview
      setTimeout(() => setPlayingVoice(null), 3000);
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
          {/* Voice action buttons */}
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

          {/* Voice search */}
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

          {/* Voice list */}
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
          {/* Music search */}
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

          {/* Music categories */}
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

          {/* Music list */}
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
          {/* SFX search */}
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

          {/* SFX categories */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {sfxCategories.map((cat) => (
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

          {/* SFX list */}
          <div className="space-y-2">
            {soundEffects.map((sfx) => (
              <div 
                key={sfx.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{sfx.name}</p>
                  <p className="text-xs text-gray-500">{sfx.duration}</p>
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
