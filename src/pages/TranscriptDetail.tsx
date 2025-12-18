import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DigitalCharactersModal from '@/components/dashboard/DigitalCharactersModal';
import AIPersonaSidebar from '@/components/dashboard/AIPersonaSidebar';
import { 
  ArrowLeft, Play, Pause, FileText, Clock, Users, Globe,
  FileDown, Share2, ChevronDown, Copy, Edit3, Sparkles,
  Volume2, RotateCcw, TrendingUp, Zap, Languages, 
  MessageSquare, User, ChevronRight, Wand2, Download
} from 'lucide-react';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Turkish', 'Polish', 'Vietnamese', 'Thai', 'Indonesian'
];

const MOCK_TRANSCRIPT_CONTENT = [
  { speaker: 'Speaker 1', time: '00:00:05', text: "Welcome everyone to today's product strategy meeting. We have a lot to cover, so let's get started." },
  { speaker: 'Speaker 2', time: '00:00:15', text: "Thanks for organizing this. I've prepared the Q4 projections we discussed last week." },
  { speaker: 'Speaker 1', time: '00:00:25', text: "Perfect. Before we dive in, let's do a quick round of updates from each team." },
  { speaker: 'Speaker 3', time: '00:00:35', text: "The engineering team has completed the core features for the mobile app. We're now in the testing phase." },
  { speaker: 'Speaker 4', time: '00:00:48', text: "Marketing has finalized the launch campaign. We're targeting early January for the announcement." },
  { speaker: 'Speaker 2', time: '00:01:02', text: "Great progress. The numbers look promising - we're projecting a 40% increase in user engagement." },
  { speaker: 'Speaker 1', time: '00:01:15', text: "That's excellent news. Let's discuss the resource allocation for Q1..." },
];

const TranscriptDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [charactersModalOpen, setCharactersModalOpen] = useState(false);
  const [identitySidebarOpen, setIdentitySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Get transcript data from URL params
  const title = searchParams.get('title') || 'Untitled Transcript';
  const duration = searchParams.get('duration') || '00:00';
  const speakers = parseInt(searchParams.get('speakers') || '1');
  const language = searchParams.get('language') || 'English';
  const summary = searchParams.get('summary') || 'This meeting covered Q4 product strategy and launch planning.';

  const handleExport = (format: string) => {
    alert(`Exporting as ${format}...`);
    setShowExportMenu(false);
  };

  const handleShare = () => {
    alert('Sharing transcript...');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onCharactersClick={() => setCharactersModalOpen(true)}
        onIdentityClick={() => setIdentitySidebarOpen(true)}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/transcribe')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Transcripts</span>
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {speakers} speaker{speakers > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {language}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-white border border-gray-300 shadow-xl z-50">
                      {[
                        { format: 'TXT', desc: 'Plain Text' },
                        { format: 'DOCX', desc: 'Word Document' },
                        { format: 'PDF', desc: 'PDF Document' },
                        { format: 'SRT', desc: 'Subtitles' },
                        { format: 'VTT', desc: 'Web Subtitles' },
                        { format: 'JSON', desc: 'Raw Data' },
                      ].map(item => (
                        <button
                          key={item.format}
                          onClick={() => handleExport(item.format)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-between"
                        >
                          <span>{item.format}</span>
                          <span className="text-xs text-gray-400">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Audio
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-300 mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500 font-mono">00:00</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                    </div>
                    <span className="text-sm text-gray-500 font-mono">{duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <select 
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="px-2 py-1 rounded-lg bg-gray-100 border border-gray-300 text-xs text-gray-600 focus:outline-none"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">Click any text to jump to that moment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-300 pb-4">
              {[
                { id: 'transcript', label: 'Transcript', icon: FileText },
                { id: 'summary', label: 'AI Summary', icon: Sparkles },
                { id: 'speakers', label: 'Speakers', icon: Users },
                { id: 'chat', label: 'AI Chat', icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                    activeTab === tab.id 
                      ? 'bg-emerald-500/10 text-emerald-600' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
              {activeTab === 'transcript' && (
                <div className="space-y-3">
                  {MOCK_TRANSCRIPT_CONTENT.map((item, i) => (
                    <div key={i} className="group flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-shrink-0 w-20">
                        <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">
                          {item.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">{item.speaker}</p>
                        <p className="text-gray-900 leading-relaxed">{item.text}</p>
                      </div>
                      <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopy(item.text)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="max-w-3xl">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-semibold text-gray-900">AI-Generated Summary</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {summary}
                    </p>
                    <button className="text-sm text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Regenerate Summary
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-300">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Key Points
                      </h4>
                      <ul className="space-y-2">
                        {['Mobile app testing phase completed', 'Launch campaign targeting January', '40% projected user engagement increase'].map((point, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-300">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {['Finalize Q1 resource allocation', 'Schedule follow-up meeting', 'Review marketing materials'].map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-4 h-4 rounded border border-amber-500/50 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-gray-50 border border-gray-300">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Languages className="w-4 h-4 text-purple-500" />
                      Translate Summary
                    </h4>
                    <div className="flex items-center gap-3">
                      <select className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-emerald-500">
                        {LANGUAGES.map(lang => (
                          <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                        ))}
                      </select>
                      <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-600 text-sm font-medium hover:bg-purple-500/30 transition-colors">
                        Translate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'speakers' && (
                <div className="max-w-2xl">
                  <p className="text-gray-500 mb-6">Identify and label speakers for better organization</p>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((speaker) => (
                      <div key={speaker} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-300">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          ['bg-emerald-500/20 text-emerald-500', 'bg-blue-500/20 text-blue-500', 'bg-purple-500/20 text-purple-500', 'bg-amber-500/20 text-amber-500'][speaker - 1]
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            defaultValue={`Speaker ${speaker}`}
                            className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-0.5">Spoke for ~{Math.floor(Math.random() * 10 + 5)} minutes</p>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                          Identify Voice
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="max-w-3xl">
                  <div className="space-y-4 mb-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                      <p className="text-sm text-emerald-700">
                        Ask me anything about this transcript! I can help you find specific information, extract insights, or answer questions about what was discussed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Ask a question about this transcript..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                    <button className="px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors">
                      <Wand2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Try:</span>
                    {['What was decided?', 'Action items', 'Key metrics'].map((q, i) => (
                      <button key={i} className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-300 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <DigitalCharactersModal 
        isOpen={charactersModalOpen} 
        onClose={() => setCharactersModalOpen(false)}
      />
      
      <AIPersonaSidebar 
        isOpen={identitySidebarOpen} 
        onClose={() => setIdentitySidebarOpen(false)}
      />
    </div>
  );
};

export default TranscriptDetail;
