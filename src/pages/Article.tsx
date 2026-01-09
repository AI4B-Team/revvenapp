import React, { useState } from 'react';
import { Sparkles, FileText, Zap, Wand2, BookOpen, Newspaper, TrendingUp, Target, Save, ChevronDown, Globe, Shuffle, Mic, Settings2, Copy, RotateCcw } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const articleTypes = [
  { id: 'blog', name: 'Blog Post', icon: FileText, description: 'Engaging content for your audience' },
  { id: 'guide', name: 'Comprehensive Guide', icon: BookOpen, description: 'In-depth coverage of a topic' },
  { id: 'listicle', name: 'Listicle', icon: TrendingUp, description: 'Numbered lists that convert' },
  { id: 'howto', name: 'How-To Tutorial', icon: Target, description: 'Step-by-step instructions' },
  { id: 'news', name: 'News Article', icon: Newspaper, description: 'Timely and informative' },
  { id: 'opinion', name: 'Opinion Piece', icon: Zap, description: 'Thought leadership content' },
];

const tones = ['Friendly', 'Formal', 'Assertive', 'Optimistic', 'Informative', 'Curious', 'Persuasive', 'Witty'];
const styles = ['Professional', 'Conversational', 'Humorous', 'Empathic', 'Simple', 'Academic', 'Creative', 'Bold'];
const lengths = ['Short (500-800)', 'Medium (1000-1500)', 'Long (2000-3000)', 'Epic (3000+)'];
const languages = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch'];

const promptTemplates: Record<string, string> = {
  blog: `Explore [TOPIC] in a comprehensive blog post that engages readers. Delve into details, stories, and insights for deep understanding. Include examples, trends, and tips. Use [TONE] and [STYLE] writing to connect. Deliver high-quality, well-researched content showcasing expertise. Optimize with SEO: title, meta, keywords. No direct audience address or 'welcome/get ready.' Target [LENGTH] words.`,
  guide: `Create an insightful [TOPIC] guide covering all aspects from basics to advanced techniques. Ensure accessibility and practicality for readers of varying knowledge levels. Use clear explanations, examples, and tips. Organize logically, providing comprehensive coverage and anticipating readers' needs. Generate an engaging headline incorporating relevant [TOPIC] keywords. Write in a [TONE] tone with a [STYLE] writing style. Target [LENGTH] words.`,
  listicle: `Create a compelling listicle about [TOPIC] with numbered items that hook readers instantly. Each item should provide unique value, actionable insights, and memorable takeaways. Use [TONE] and [STYLE] writing. Include brief explanations for each point. Craft a click-worthy headline with numbers. Target [LENGTH] words optimized for scanning.`,
  howto: `Write a detailed how-to tutorial on [TOPIC] with clear, sequential steps anyone can follow. Include prerequisites, materials needed, pro tips, and common mistakes to avoid. Use [TONE] and [STYLE] writing. Add practical examples and troubleshooting advice. Target [LENGTH] words with scannable formatting.`,
  news: `Write a timely news article about [TOPIC] following journalistic standards. Lead with the most important information, include relevant quotes and data, provide context and background. Maintain [TONE] and [STYLE] writing while staying objective. Include a compelling headline. Target [LENGTH] words.`,
  opinion: `Craft a thought-provoking opinion piece on [TOPIC] that establishes authority and sparks discussion. Present a clear thesis, support with evidence and examples, acknowledge counterarguments. Use [TONE] and [STYLE] writing to persuade. End with a strong call-to-action or memorable conclusion. Target [LENGTH] words.`,
};

export default function Article() {
  const [selectedType, setSelectedType] = useState('blog');
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState('Friendly');
  const [selectedStyle, setSelectedStyle] = useState('Professional');
  const [selectedLength, setSelectedLength] = useState('Medium (1000-1500)');
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getLivePrompt = () => {
    if (isEditing && customPrompt) return customPrompt;
    
    let prompt = promptTemplates[selectedType] || promptTemplates.blog;
    prompt = prompt.replace(/\[TOPIC\]/g, topic || '[TOPIC]');
    prompt = prompt.replace(/\[TONE\]/g, selectedTone.toLowerCase());
    prompt = prompt.replace(/\[STYLE\]/g, selectedStyle.toLowerCase());
    prompt = prompt.replace(/\[LENGTH\]/g, selectedLength.split(' ')[0].toLowerCase());
    return prompt;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleRandomize = () => {
    setSelectedTone(tones[Math.floor(Math.random() * tones.length)]);
    setSelectedStyle(styles[Math.floor(Math.random() * styles.length)]);
  };

  const currentType = articleTypes.find(t => t.id === selectedType);

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-auto bg-white">
          <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="text-foreground">Article</span>
                  <span className="text-emerald-500"> Studio</span>
                </h1>
                <p className="text-sm text-muted-foreground">Create publish-ready content in seconds</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Panel - Configuration */}
              <div className="space-y-6">
                {/* Article Type Selector */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                  <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4 block">
                    Article Type
                  </label>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-500/50 transition-all group"
                    >
                      {currentType && (
                        <>
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <currentType.icon className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-foreground">{currentType.name}</div>
                            <div className="text-sm text-muted-foreground">{currentType.description}</div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>

                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-20">
                        {articleTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => { setSelectedType(type.id); setShowTypeDropdown(false); }}
                            className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${selectedType === type.id ? 'bg-emerald-50' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedType === type.id ? 'bg-emerald-500/20' : 'bg-gray-100'}`}>
                              <type.icon className={`w-5 h-5 ${selectedType === type.id ? 'text-emerald-500' : 'text-gray-500'}`} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className={`font-medium ${selectedType === type.id ? 'text-emerald-600' : 'text-foreground'}`}>{type.name}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Topic Input */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                  <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4 block">
                    Topic
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Benefits of AI automation for small businesses"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-foreground placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                      <Mic className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Tone & Style */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-6">
                  {/* Tone */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        Tone
                      </label>
                      <button 
                        onClick={handleRandomize}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-500 transition-colors"
                      >
                        <Shuffle className="w-3 h-3" />
                        Randomize
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tones.map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setSelectedTone(tone)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTone === tone
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                              : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-foreground border border-gray-200'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4 block">
                      Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {styles.map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedStyle(style)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedStyle === style
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                              : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-foreground border border-gray-200'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Length & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                    <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3 block">
                      Length
                    </label>
                    <select
                      value={selectedLength}
                      onChange={(e) => setSelectedLength(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {lengths.map((length) => (
                        <option key={length} value={length}>{length}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                    <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3 block flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Panel - Live Prompt Preview */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-semibold text-emerald-600">Live Prompt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100 text-gray-500 hover:text-foreground'}`}
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(getLivePrompt())}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-foreground transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setCustomPrompt(''); }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prompt Content */}
                  <div className="flex-1 p-5 overflow-auto">
                    <p className="text-xs text-muted-foreground mb-3">
                      {isEditing ? 'Edit your prompt directly below' : 'Fill in the fields and watch your prompt update in real-time'}
                    </p>
                    
                    {isEditing ? (
                      <textarea
                        value={customPrompt || getLivePrompt()}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full h-64 bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600 leading-relaxed resize-none focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <div className="bg-white border border-gray-100 rounded-xl p-5">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {getLivePrompt().split(/(\[TOPIC\]|\[TONE\]|\[STYLE\]|\[LENGTH\])/).map((part, i) => {
                            if (['[TOPIC]', '[TONE]', '[STYLE]', '[LENGTH]'].includes(part)) {
                              return (
                                <span key={i} className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">
                                  {part}
                                </span>
                              );
                            }
                            return part;
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Summary Tags */}
                  <div className="px-5 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {topic && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full border border-emerald-200">
                          Topic: {topic.slice(0, 25)}{topic.length > 25 ? '...' : ''}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                        {selectedTone}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                        {selectedStyle}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                        {selectedLength.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 border-t border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-5 py-3 bg-white text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-medium">Save Template</span>
                      </button>
                      <button 
                        onClick={handleGenerate}
                        disabled={!topic || isGenerating}
                        className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                          topic && !isGenerating
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            <span>Generate Article</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mt-10">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Start Templates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'SEO Blog Post', icon: TrendingUp, preset: { type: 'blog', tone: 'Informative', style: 'Professional' } },
                  { label: 'Viral Listicle', icon: Zap, preset: { type: 'listicle', tone: 'Witty', style: 'Bold' } },
                  { label: 'Ultimate Guide', icon: BookOpen, preset: { type: 'guide', tone: 'Friendly', style: 'Conversational' } },
                  { label: 'Thought Leadership', icon: Target, preset: { type: 'opinion', tone: 'Assertive', style: 'Professional' } },
                ].map((template) => (
                  <button
                    key={template.label}
                    onClick={() => {
                      setSelectedType(template.preset.type);
                      setSelectedTone(template.preset.tone);
                      setSelectedStyle(template.preset.style);
                    }}
                    className="group flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      <template.icon className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-foreground transition-colors">{template.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
