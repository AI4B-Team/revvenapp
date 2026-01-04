import React, { useState } from 'react';
import { X, Plus, Search, Layout, Copy, Trash2, Star, Clock, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPlatformIcon } from '../SocialIcons';

interface Template {
  id: string;
  name: string;
  description: string;
  platform: string;
  caption: string;
  hashtags: string[];
  isFavorite: boolean;
  usageCount: number;
  category: 'promotional' | 'engagement' | 'educational' | 'announcement' | 'custom';
}

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const defaultTemplates: Template[] = [
  {
    id: 't1',
    name: 'Product Launch',
    description: 'Perfect for announcing new products or features',
    platform: 'instagram',
    caption: '🚀 Exciting news! Introducing [Product Name] - the [benefit]. Available now!\n\n✨ Key Features:\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\nLink in bio to learn more! 👆',
    hashtags: ['newlaunch', 'productlaunch', 'newproduct', 'exciting'],
    isFavorite: true,
    usageCount: 24,
    category: 'promotional',
  },
  {
    id: 't2',
    name: 'Engagement Question',
    description: 'Boost engagement with a question post',
    platform: 'twitter',
    caption: "We're curious! 🤔\n\n[Question about your niche]\n\nDrop your answer below! 👇",
    hashtags: ['community', 'feedback', 'tellus'],
    isFavorite: false,
    usageCount: 18,
    category: 'engagement',
  },
  {
    id: 't3',
    name: 'Educational Tip',
    description: 'Share valuable tips with your audience',
    platform: 'linkedin',
    caption: "💡 Quick Tip:\n\n[Your tip here]\n\nWhy does this matter?\n\n[Explanation]\n\nWhat tips have worked for you? Share below!",
    hashtags: ['tips', 'learning', 'education', 'growth'],
    isFavorite: true,
    usageCount: 31,
    category: 'educational',
  },
  {
    id: 't4',
    name: 'Behind The Scenes',
    description: 'Show your authentic side',
    platform: 'instagram',
    caption: "Take a peek behind the curtain! 🎬\n\n[Describe what's happening]\n\nThis is what [doing X] really looks like. What do you think?",
    hashtags: ['behindthescenes', 'bts', 'dayinthelife', 'reallife'],
    isFavorite: false,
    usageCount: 12,
    category: 'engagement',
  },
  {
    id: 't5',
    name: 'Sale Announcement',
    description: 'Promote sales and discounts',
    platform: 'facebook',
    caption: "🎉 SALE ALERT! 🎉\n\n[X]% OFF everything!\n\n⏰ Limited time only - ends [date]\n\n🛒 Shop now: [link]\n\nDon't miss out!",
    hashtags: ['sale', 'discount', 'limitedtime', 'shopnow'],
    isFavorite: false,
    usageCount: 8,
    category: 'promotional',
  },
];

const categoryColors: Record<string, string> = {
  promotional: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  engagement: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  educational: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  announcement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  custom: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
};

const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'promotional', 'engagement', 'educational', 'announcement', 'custom'];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Post Templates
          </DialogTitle>
        </DialogHeader>
        
        {/* Search & Filters */}
        <div className="flex items-center gap-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 py-2">
          {filteredTemplates.map(template => (
            <div 
              key={template.id}
              className="p-4 rounded-xl border border-border hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    {getPlatformIcon(template.platform, 'w-4 h-4')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }}
                  className="p-1"
                >
                  <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                </button>
              </div>
              
              {/* Caption Preview */}
              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-foreground line-clamp-3 whitespace-pre-line">
                  {template.caption}
                </p>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[template.category]}`}>
                    {template.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Used {template.usageCount}x
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-1.5 hover:bg-muted rounded"
                  >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                    className="p-1.5 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTemplates.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No templates found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatesModal;
