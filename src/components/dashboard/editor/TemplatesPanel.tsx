import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Star,
  Play,
  Check,
  ChevronRight,
  Plus,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  duration?: string;
  premium?: boolean;
  description?: string;
  hasAvatar?: boolean;
  avatarPosition?: 'left' | 'right' | 'center';
}

interface TemplatesPanelProps {
  onApplyTemplate?: (template: Template) => void;
}

interface TemplateCategory {
  id: string;
  name: string;
  count: number;
  templates: Template[];
}

const templateCategories: TemplateCategory[] = [
  {
    id: 'all',
    name: 'All',
    count: 26,
    templates: [
      { id: 't1', name: 'Brand Intro', category: 'All', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'Create your video title within tree lines' },
      { id: 't2', name: 'Company Story', category: 'All', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'On this slide, add your company name.' },
      { id: 't3', name: 'Expert Talk', category: 'All', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: "I'm Maya, your AI guide, here to..." },
      { id: 't4', name: 'Product Demo', category: 'All', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'Should consider the following personal protective' },
      { id: 't5', name: 'Remote Lesson', category: 'All', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'REMOTE LEARNING LESSON PLAN' },
      { id: 't6', name: 'Testimonial', category: 'All', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: 'TAYLOR A. AVATAR' },
    ]
  },
  {
    id: 'e-learning',
    name: 'E-Learning',
    count: 11,
    templates: [
      { id: 'el1', name: 'Safety Training', category: 'E-Learning', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'left', description: 'Should consider the following personal protective' },
      { id: 'el2', name: 'Remote Learning', category: 'E-Learning', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'REMOTE LEARNING LESSON PLAN' },
      { id: 'el3', name: 'Tutorial Guide', category: 'E-Learning', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: 'No matter what line of small business...' },
      { id: 'el4', name: 'Trading Tips', category: 'E-Learning', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'Start trading in days, not months' },
      { id: 'el5', name: 'Critical Work', category: 'E-Learning', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'GET CRITICAL WORK DONE FASTER' },
      { id: 'el6', name: 'Social Growth', category: 'E-Learning', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'How to grow your social audience' },
    ]
  },
  {
    id: 'presenter',
    name: 'Presenter',
    count: 11,
    templates: [
      { id: 'p1', name: 'Brand Intro', category: 'Presenter', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'Create your video title within tree lines' },
      { id: 'p2', name: 'Company Intro', category: 'Presenter', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'On this slide, add your company name.' },
      { id: 'p3', name: 'Maya Guide', category: 'Presenter', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: "I'm Maya, your AI guide, here to..." },
      { id: 'p4', name: 'Tutorial', category: 'Presenter', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'Do you have ten minutes?' },
      { id: 'p5', name: 'Commerce', category: 'Presenter', thumbnail: '/placeholder.svg', hasAvatar: false, description: 'Uplifting your digital commerce experience.' },
      { id: 'p6', name: 'Debbie Guide', category: 'Presenter', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: "I'm Debbie, your AI guide, and I'm here" },
    ]
  },
  {
    id: 'ai-avatars',
    name: 'AI Avatars',
    count: 28,
    templates: [
      { id: 'ai1', name: 'AI Presenter', category: 'AI Avatars', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'Create your video title within tree lines' },
      { id: 'ai2', name: 'Virtual Host', category: 'AI Avatars', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'On this slide, add your company name.' },
      { id: 'ai3', name: 'Digital Guide', category: 'AI Avatars', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: "I'm Maya, your AI guide, here to..." },
      { id: 'ai4', name: 'Avatar Host', category: 'AI Avatars', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: "TAYLOR A. AVATAR" },
      { id: 'ai5', name: 'Content Creator', category: 'AI Avatars', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'right', description: 'Create content and craft media in just a click' },
      { id: 'ai6', name: 'AI Debbie', category: 'AI Avatars', thumbnail: '/placeholder.svg', hasAvatar: true, avatarPosition: 'center', description: "I'm Debbie, your AI guide, and I'm here" },
    ]
  },
];

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onApplyTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredCategories = templateCategories.map(category => ({
    ...category,
    templates: category.templates.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.templates.length > 0 || searchQuery === '');

  const applyTemplate = (template: Template) => {
    setSelectedTemplate(template.id);
    toast.success(`Applied "${template.name}" template`);
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
  };

  const renderTemplateCard = (template: Template) => (
    <motion.div
      key={template.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => applyTemplate(template)}
      className={`relative rounded-lg overflow-hidden cursor-pointer group flex-shrink-0 w-[140px] ${
        selectedTemplate === template.id
          ? 'ring-2 ring-primary'
          : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-50 to-pink-50" />
        
        {/* Avatar indicator */}
        {template.hasAvatar && (
          <div className={`absolute bottom-0 ${
            template.avatarPosition === 'left' ? 'left-1' : 
            template.avatarPosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-1'
          }`}>
            <div className="w-10 h-14 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-full flex items-start justify-center pt-1">
              <div className="w-6 h-6 rounded-full bg-orange-300" />
            </div>
          </div>
        )}

        {/* Info badge */}
        <div className="absolute top-1.5 right-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">i</span>
          </div>
        </div>

        {/* Brand tag */}
        {template.category === 'All' && (
          <div className="absolute top-1.5 left-1.5 bg-white/80 px-1.5 py-0.5 rounded text-[8px] text-gray-600 font-medium">
            Your Logo
          </div>
        )}

        {/* Selected indicator */}
        {selectedTemplate === template.id && (
          <div className="absolute top-1.5 left-1.5 bg-primary rounded-full p-0.5">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="p-1.5 bg-white/20 rounded-full hover:bg-white/30">
            <Play className="w-3 h-3 text-white fill-white" />
          </button>
        </div>
      </div>

      {/* Description text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-[8px] text-white line-clamp-2 leading-tight">{template.description}</p>
      </div>
    </motion.div>
  );

  const renderCategoryRow = (category: TemplateCategory) => (
    <div key={category.id} className="mb-5">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">
          {category.name} ({category.count})
        </h3>
        <button 
          onClick={() => setExpandedCategory(category.id)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          See All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Templates Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {category.templates.slice(0, 6).map(renderTemplateCard)}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
        <Button 
          size="sm" 
          className="bg-primary hover:bg-primary/90 text-white gap-1.5"
          onClick={() => toast.success('Create template feature coming soon!')}
        >
          <Plus className="w-3.5 h-3.5" />
          Create template
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map(renderCategoryRow)}
      </div>

      {/* Empty state */}
      {filteredCategories.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <User className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No Templates Found</h3>
          <p className="text-sm text-gray-500">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplatesPanel;
