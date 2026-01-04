import React, { useState, useMemo } from 'react';
import { X, Plus, Search, Layout, Copy, Trash2, Star, Clock, Tag, Filter, ChevronDown, Sparkles, TrendingUp, Zap, BookOpen, FileText, Video, Mail, Target, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getPlatformIcon } from '../SocialIcons';
import { 
  defaultTemplates, 
  ContentTemplate, 
  ContentType, 
  ContentCategory, 
  Platform,
  contentTypeInfo,
  categoryInfo,
  getFavoriteTemplates,
  getPopularTemplates
} from '@/data/contentTemplates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContentTemplate) => void;
}

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  'social-post': <MessageSquare className="w-3.5 h-3.5" />,
  'article': <FileText className="w-3.5 h-3.5" />,
  'press-release': <FileText className="w-3.5 h-3.5" />,
  'email': <Mail className="w-3.5 h-3.5" />,
  'ad-copy': <Target className="w-3.5 h-3.5" />,
  'video-script': <Video className="w-3.5 h-3.5" />,
  'carousel': <Layout className="w-3.5 h-3.5" />,
  'story': <Zap className="w-3.5 h-3.5" />,
  'thread': <MessageSquare className="w-3.5 h-3.5" />,
  'newsletter': <Mail className="w-3.5 h-3.5" />,
  'product-description': <Tag className="w-3.5 h-3.5" />,
  'case-study': <BookOpen className="w-3.5 h-3.5" />,
  'testimonial': <MessageSquare className="w-3.5 h-3.5" />,
  'infographic': <Layout className="w-3.5 h-3.5" />,
  'podcast-notes': <MessageSquare className="w-3.5 h-3.5" />,
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'popular'>('all');
  const [activeCategory, setActiveCategory] = useState<ContentCategory | 'all'>('all');
  const [activeContentType, setActiveContentType] = useState<ContentType | 'all'>('all');
  const [activePlatform, setActivePlatform] = useState<Platform | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);

  const categories: (ContentCategory | 'all')[] = ['all', 'promotional', 'engagement', 'educational', 'announcement', 'storytelling', 'thought-leadership', 'behind-the-scenes', 'community', 'seasonal', 'conversion', 'custom'];
  
  const contentTypes: (ContentType | 'all')[] = ['all', 'social-post', 'carousel', 'thread', 'story', 'video-script', 'article', 'email', 'newsletter', 'ad-copy', 'press-release', 'case-study', 'testimonial', 'product-description'];
  
  const platforms: (Platform | 'all')[] = ['all', 'instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'pinterest', 'threads'];

  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Apply tab filter
    if (activeTab === 'favorites') {
      result = getFavoriteTemplates(result);
    } else if (activeTab === 'popular') {
      result = getPopularTemplates(result, 20);
    }

    // Apply search
    if (searchQuery) {
      result = result.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory);
    }

    // Apply content type filter
    if (activeContentType !== 'all') {
      result = result.filter(t => t.contentType === activeContentType);
    }

    // Apply platform filter
    if (activePlatform !== 'all') {
      result = result.filter(t => t.platform === activePlatform || t.platform === 'all');
    }

    return result;
  }, [templates, searchQuery, activeTab, activeCategory, activeContentType, activePlatform]);

  const toggleFavorite = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const deleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleSelectTemplate = (template: ContentTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveContentType('all');
    setActivePlatform('all');
    setSearchQuery('');
  };

  const hasActiveFilters = activeCategory !== 'all' || activeContentType !== 'all' || activePlatform !== 'all' || searchQuery !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Content Templates</DialogTitle>
                <p className="text-sm text-muted-foreground">{templates.length} templates • Accelerate your content creation</p>
              </div>
            </div>
            <Button variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Template List */}
          <div className="flex-1 flex flex-col border-r border-border">
            {/* Search & Filters */}
            <div className="p-4 space-y-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates by name, type, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                <Button 
                  variant={showFilters ? "secondary" : "outline"} 
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <Filter className="w-4 h-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </Button>
              </div>

              {/* Quick Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 py-1.5 rounded-full"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    All Templates
                  </TabsTrigger>
                  <TabsTrigger 
                    value="popular" 
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 py-1.5 rounded-full"
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger 
                    value="favorites" 
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 py-1.5 rounded-full"
                  >
                    <Star className="w-3.5 h-3.5 mr-1.5" />
                    Favorites
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="space-y-3 pt-2">
                  {/* Content Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Content Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {contentTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setActiveContentType(type)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            activeContentType === type
                              ? 'bg-emerald-500 text-white'
                              : 'bg-background border border-border hover:border-emerald-500/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {type !== 'all' && contentTypeIcons[type]}
                          <span className="capitalize">{type === 'all' ? 'All Types' : contentTypeInfo[type]?.label || type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.slice(0, 8).map(category => (
                        <button
                          key={category}
                          onClick={() => setActiveCategory(category)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                            activeCategory === category
                              ? 'bg-emerald-500 text-white'
                              : 'bg-background border border-border hover:border-emerald-500/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {category === 'all' ? 'All Categories' : categoryInfo[category]?.icon} {category === 'all' ? '' : categoryInfo[category]?.label || category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Platform Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Platform</label>
                    <div className="flex flex-wrap gap-1.5">
                      {platforms.map(platform => (
                        <button
                          key={platform}
                          onClick={() => setActivePlatform(platform)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 capitalize transition-colors ${
                            activePlatform === platform
                              ? 'bg-emerald-500 text-white'
                              : 'bg-background border border-border hover:border-emerald-500/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {platform !== 'all' && getPlatformIcon(platform, 'w-3.5 h-3.5')}
                          <span>{platform === 'all' ? 'All Platforms' : platform}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Template Grid */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.map(template => (
                      <div 
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                          selectedTemplate?.id === template.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md'
                            : 'border-border hover:border-emerald-500/50 hover:shadow-sm'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              {getPlatformIcon(template.platform, 'w-4 h-4')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">{template.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${contentTypeInfo[template.contentType]?.color}`}>
                                  {contentTypeInfo[template.contentType]?.icon}
                                  {contentTypeInfo[template.contentType]?.label}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => toggleFavorite(template.id, e)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {template.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryInfo[template.category]?.color}`}>
                              {categoryInfo[template.category]?.label}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${difficultyColors[template.difficulty]}`}>
                              {template.difficulty}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {template.estimatedTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No templates found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearFilters} className="mt-2 text-emerald-600">
                        Clear all filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Results count */}
            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Showing {filteredTemplates.length} of {templates.length} templates
              </p>
            </div>
          </div>

          {/* Right Panel - Template Preview */}
          <div className="w-[400px] flex flex-col bg-muted/20">
            {selectedTemplate ? (
              <>
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      {getPlatformIcon(selectedTemplate.platform, 'w-6 h-6')}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{selectedTemplate.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                    </div>
                  </div>

                  {/* Template Meta */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium flex items-center justify-center gap-1">
                        {contentTypeInfo[selectedTemplate.contentType]?.icon}
                        {contentTypeInfo[selectedTemplate.contentType]?.label}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{selectedTemplate.estimatedTime}</p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Used</p>
                      <p className="text-sm font-medium">{selectedTemplate.usageCount}x</p>
                    </div>
                  </div>

                  {/* Best For */}
                  {selectedTemplate.bestFor && selectedTemplate.bestFor.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1.5">Best for:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTemplate.bestFor.map((item, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pro Tip */}
                  {selectedTemplate.proTip && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Pro Tip
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">{selectedTemplate.proTip}</p>
                    </div>
                  )}
                </div>

                {/* Caption Preview */}
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Caption Preview:</p>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-sm whitespace-pre-line text-foreground leading-relaxed">
                        {selectedTemplate.caption}
                      </p>
                    </div>

                    {/* Hashtags */}
                    {selectedTemplate.hashtags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Hashtags:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTemplate.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Actions */}
                <div className="p-4 border-t border-border bg-background">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button 
                      className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleUseTemplate}
                    >
                      <Zap className="w-4 h-4" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Layout className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Select a Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any template to preview its content and use it for your post
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatesModal;
