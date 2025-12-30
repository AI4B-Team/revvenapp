import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Upload, Mic, Sparkles, ArrowLeft, BookOpen, Headphones, Presentation
} from 'lucide-react';
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVimeo, FaGoogleDrive } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Rss } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface NewBookData {
  title: string;
  topic: string;
  audience: string;
  tone: string;
  chapters: number;
  wordsPerChapter: number;
  includeImages: boolean;
  sourceType: string;
  sourceContent: string;
}

const PLATFORMS = [
  { name: 'Blog', icon: Rss, color: '#F97316' },
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { name: 'X', icon: FaXTwitter, color: '#000000' },
  { name: 'Vimeo', icon: FaVimeo, color: '#1AB7EA' },
  { name: 'Google Drive', icon: FaGoogleDrive, color: '#4285F4' },
];

const CONTENT_TYPES = [
  { id: 'ebook', label: 'Ebook', icon: BookOpen },
  { id: 'audiobook', label: 'AudioBook', icon: Headphones },
  { id: 'presentation', label: 'Presentation', icon: Presentation },
];

const LANGUAGES = [
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

const CREATIVES = [
  { id: 'default', name: 'Default' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'modern', name: 'Modern' },
  { id: 'classic', name: 'Classic' },
  { id: 'bold', name: 'Bold' },
  { id: 'elegant', name: 'Elegant' },
];

const sourceLabels: Record<string, string> = { 
  'ai-generate': 'AI Generate', 
  'upload': 'Upload', 
  'url': 'URL', 
  'voice': 'Voice' 
};

const NewEbook = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [contentType, setContentType] = useState('ebook');
  const [language, setLanguage] = useState('en');
  const [creative, setCreative] = useState('default');

  const initialSource = searchParams.get('source') || 'ai-generate';

  const [newBookData, setNewBookData] = useState<NewBookData>({
    title: '', topic: '', audience: '', tone: 'professional', chapters: 8, wordsPerChapter: 2000, includeImages: true, sourceType: initialSource, sourceContent: ''
  });

  const simulateGeneration = async () => {
    if (!newBookData.title && !newBookData.topic) {
      toast.error('Please enter a title or topic');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          toast.success(`${CONTENT_TYPES.find(t => t.id === contentType)?.label} generated successfully!`);
          navigate('/ebook-creator');
          return 100;
        }
        return Math.min(prev + Math.random() * 15, 100);
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar onCollapseChange={(collapsed) => setSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button 
              onClick={() => navigate('/ebook-creator')} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back To Projects</span>
            </button>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Project</h1>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Generating your {CONTENT_TYPES.find(t => t.id === contentType)?.label?.toLowerCase()}...</h3>
                    <p className="text-sm text-gray-500">{Math.round(generationProgress)}% complete</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${generationProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Configure Your Project Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Configure Your Project</h2>
              <p className="text-sm text-gray-500 mb-6">Set up the basic details for your project. You'll be able to review and refine the generated content before finalizing.</p>
              
              <div className="space-y-6">
                {/* What Would You Like To Create? */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What Would You Like To Create?</h3>
                  <div className="flex gap-3">
                    {CONTENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all ${
                          contentType === type.id 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <type.icon className="w-5 h-5" />
                        <span className="font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Name */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Project Name<span className="text-red-500">*</span></h3>
                  <p className="text-sm text-gray-500 mb-3">This is for your reference only and won't affect the generated content.</p>
                  <Input 
                    type="text" 
                    value={newBookData.title} 
                    onChange={(e) => setNewBookData(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="e.g., The Ultimate Guide to Digital Marketing" 
                    className="w-full max-w-lg" 
                  />
                </div>

                {/* Language & Creative Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Language</h3>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Creative</h3>
                    <select
                      value={creative}
                      onChange={(e) => setCreative(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                    >
                      {CREATIVES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Source Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Content Source</h2>
              <p className="text-sm text-gray-500 mb-6">Choose how you'd like to create your content.</p>

              {/* Source Type Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                {Object.entries(sourceLabels).map(([key, label]) => (
                  <button 
                    key={key} 
                    onClick={() => setNewBookData(prev => ({ ...prev, sourceType: key }))} 
                    className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${newBookData.sourceType === key ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Content based on source type */}
              {newBookData.sourceType === 'ai-generate' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Topic / Description</h3>
                    <Textarea 
                      value={newBookData.topic} 
                      onChange={(e) => setNewBookData(prev => ({ ...prev, topic: e.target.value }))} 
                      placeholder="Describe what your content should be about..." 
                      rows={4} 
                      className="w-full resize-none" 
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h3>
                    <Input 
                      type="text" 
                      value={newBookData.audience} 
                      onChange={(e) => setNewBookData(prev => ({ ...prev, audience: e.target.value }))} 
                      placeholder="e.g., Small business owners, beginners..." 
                      className="w-full" 
                    />
                  </div>
                </div>
              )}

              {newBookData.sourceType === 'upload' && (
                <div className="space-y-5">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-400 cursor-pointer transition-colors">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium text-gray-900 text-lg">Drag & Drop Your File Here</p>
                    <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                    <div className="flex justify-center gap-2 mt-6">
                      {['.pdf', '.docx', '.txt', '.md'].map(ext => (
                        <span key={ext} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg">{ext}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {newBookData.sourceType === 'url' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Website URL</h3>
                    <div className="flex gap-2">
                      <Input 
                        type="url" 
                        value={newBookData.sourceContent} 
                        onChange={(e) => setNewBookData(prev => ({ ...prev, sourceContent: e.target.value }))} 
                        placeholder="https://example.com/blog-post" 
                        className="flex-1" 
                      />
                      <Button variant="secondary">Fetch</Button>
                    </div>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                    <h4 className="font-medium text-emerald-800 mb-3">Supported Sources</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-emerald-700">
                      <span>• Blog posts</span>
                      <span>• Articles</span>
                      <span>• Documentation</span>
                      <span>• Medium articles</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {PLATFORMS.filter((p) =>
                      ['Blog', 'YouTube', 'TikTok', 'Instagram', 'Facebook'].includes(p.name)
                    ).map((platform, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                      +45
                    </div>
                  </div>
                </div>
              )}

              {newBookData.sourceType === 'voice' && (
                <div className="space-y-5 text-center py-12">
                  <button className="w-32 h-32 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30 hover:scale-105 transition-transform">
                    <Mic className="w-14 h-14 text-white" />
                  </button>
                  <p className="font-medium text-gray-900 text-lg">Click to Start Recording</p>
                  <p className="text-sm text-gray-500">Speak your ideas and we'll transcribe them</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-xs uppercase tracking-wide">Live</span>
                    Real-Time Transcription
                  </div>
                </div>
              )}
            </div>

            {/* Generation Options Section - Only for AI Generate */}
            {newBookData.sourceType === 'ai-generate' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Generation Options</h2>
                <p className="text-sm text-gray-500 mb-6">Customize the structure and style of your generated content.</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Writing Tone</h3>
                      <select 
                        value={newBookData.tone} 
                        onChange={(e) => setNewBookData(prev => ({ ...prev, tone: e.target.value }))} 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                      >
                        <option value="professional">Professional</option>
                        <option value="conversational">Conversational</option>
                        <option value="academic">Academic</option>
                        <option value="friendly">Friendly</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Number of Chapters</h3>
                      <select 
                        value={newBookData.chapters} 
                        onChange={(e) => setNewBookData(prev => ({ ...prev, chapters: parseInt(e.target.value) }))} 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                      >
                        {[5, 6, 7, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n} chapters</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Words per Chapter</h3>
                    <div className="flex gap-2">
                      {[1000, 1500, 2000, 2500, 3000].map(n => (
                        <button 
                          key={n} 
                          onClick={() => setNewBookData(prev => ({ ...prev, wordsPerChapter: n }))} 
                          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border ${newBookData.wordsPerChapter === n ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                          {(n / 1000).toFixed(1)}k
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Estimated total: ~{((newBookData.chapters * newBookData.wordsPerChapter) / 1000).toFixed(0)}k words</p>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="includeImages" 
                      checked={newBookData.includeImages} 
                      onChange={(e) => setNewBookData(prev => ({ ...prev, includeImages: e.target.checked }))} 
                      className="w-5 h-5 text-emerald-600 rounded accent-emerald-500" 
                    />
                    <label htmlFor="includeImages" className="text-sm text-gray-900">
                      <span className="font-medium">Generate AI images</span>
                      <span className="block text-gray-500 text-xs">Include illustrations for each chapter</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={() => navigate('/ebook-creator')}>
                Cancel
              </Button>
              <Button 
                onClick={simulateGeneration} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generating...' : `Generate ${CONTENT_TYPES.find(t => t.id === contentType)?.label}`}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewEbook;
