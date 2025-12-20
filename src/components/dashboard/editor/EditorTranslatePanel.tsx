import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, ChevronLeft, FileText, Sparkles, Plus, Settings, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];

const EditorTranslatePanel: React.FC = () => {
  const [hasVideo, setHasVideo] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<Language>(languages[0]);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [voiceOption, setVoiceOption] = useState<'clone' | 'stock'>('clone');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setHasVideo(true);
      toast.success('Video uploaded successfully');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDubVideo = () => {
    if (!targetLanguage) {
      toast.error('Please select a target language');
      return;
    }
    toast.success('Starting video dubbing...');
  };

  // Empty state - no video
  if (!hasVideo) {
    return (
      <div className="flex flex-col h-full">
        <div 
          className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Choose a video</h3>
          <p className="text-sm text-gray-500">Upload a video with speech to get started!</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    );
  }

  // Video uploaded - show translation options
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Back button */}
      <button 
        onClick={() => setHasVideo(false)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* Original Language */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-900">Original language</label>
          <button className="text-xs text-primary flex items-center gap-1 hover:underline">
            <FileText className="w-3 h-3" />
            Upload SRT / VTT
          </button>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>{sourceLanguage.flag}</span>
              <span>{sourceLanguage.name}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {showSourceDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSourceLanguage(lang);
                    setShowSourceDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-left"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {sourceLanguage.code === lang.code && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Target Language */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-900">Translate to</label>
          <button className="text-xs text-primary flex items-center gap-1 hover:underline">
            <FileText className="w-3 h-3" />
            Upload SRT / VTT
          </button>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTargetDropdown(!showTargetDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              {targetLanguage ? (
                <>
                  <span>{targetLanguage.flag}</span>
                  <span>{targetLanguage.name}</span>
                </>
              ) : (
                <span className="text-gray-500">Select language</span>
              )}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {showTargetDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {languages.filter(l => l.code !== 'auto').map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setTargetLanguage(lang);
                    setShowTargetDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-left"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {targetLanguage?.code === lang.code && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Options */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-900 mb-2 block">Voice</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVoiceOption('clone')}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              voiceOption === 'clone'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Clone original voice(s)
          </button>
          <button
            onClick={() => setVoiceOption('stock')}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              voiceOption === 'stock'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Use a stock voice
          </button>
        </div>
        {voiceOption === 'clone' && (
          <p className="text-xs text-gray-500 mt-2">
            By selecting this option you confirm that you have obtained explicit permission to clone the voice(s) featured in your video.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Advanced Settings */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-900"
      >
        <span className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Advanced settings
        </span>
        <Plus className={`w-4 h-4 text-gray-500 transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
      </button>
      <p className="text-xs text-gray-500 mb-4">Options to adjust timing and translation rules</p>

      {showAdvanced && (
        <div className="p-4 bg-gray-50 rounded-xl mb-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Speed adjustment</label>
            <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
              <option>Normal (1x)</option>
              <option>Slightly faster (1.1x)</option>
              <option>Faster (1.2x)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Lip sync</label>
            <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>
      )}

      {/* Review Translation Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors mb-3">
        Review translation before dubbing
        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        <Sparkles className="w-4 h-4 text-yellow-500" />
      </button>

      {/* Dub Video Button */}
      <button
        onClick={handleDubVideo}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-brand-green text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        Dub Video
        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
      </button>

      {/* Cost indicator */}
      <p className="text-xs text-center text-gray-500 mt-3">
        Cost: <span className="text-gray-700">6 / 10 credits</span>{' '}
        <button className="text-primary hover:underline">Get more</button>
      </p>
    </div>
  );
};

export default EditorTranslatePanel;
