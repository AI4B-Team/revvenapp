import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutTemplate,
  Search,
  Star,
  Play,
  Check,
  Clock,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  duration: string;
  premium?: boolean;
  description: string;
}

interface TemplatesPanelProps {
  onApplyTemplate?: (template: Template) => void;
}

const templateCategories = ['All', 'Social Media', 'Marketing', 'Tutorial', 'Slideshow', 'Intro/Outro'];

const templates: Template[] = [
  { id: 't1', name: 'TikTok Promo', category: 'Social Media', thumbnail: '/placeholder.svg', duration: '0:15', description: 'Trendy vertical format for TikTok' },
  { id: 't2', name: 'Instagram Reel', category: 'Social Media', thumbnail: '/placeholder.svg', duration: '0:30', description: 'Engaging reel template' },
  { id: 't3', name: 'YouTube Short', category: 'Social Media', thumbnail: '/placeholder.svg', duration: '0:60', description: 'Viral short format' },
  { id: 't4', name: 'Product Launch', category: 'Marketing', thumbnail: '/placeholder.svg', duration: '0:45', premium: true, description: 'Professional product reveal' },
  { id: 't5', name: 'Sale Announcement', category: 'Marketing', thumbnail: '/placeholder.svg', duration: '0:20', description: 'Eye-catching sale promo' },
  { id: 't6', name: 'Brand Story', category: 'Marketing', thumbnail: '/placeholder.svg', duration: '1:30', premium: true, description: 'Tell your brand story' },
  { id: 't7', name: 'How-To Tutorial', category: 'Tutorial', thumbnail: '/placeholder.svg', duration: '2:00', description: 'Step-by-step guide format' },
  { id: 't8', name: 'Quick Tips', category: 'Tutorial', thumbnail: '/placeholder.svg', duration: '0:45', description: '3-5 quick tips format' },
  { id: 't9', name: 'Photo Slideshow', category: 'Slideshow', thumbnail: '/placeholder.svg', duration: '1:00', description: 'Smooth photo transitions' },
  { id: 't10', name: 'Memory Reel', category: 'Slideshow', thumbnail: '/placeholder.svg', duration: '1:30', description: 'Nostalgic photo compilation' },
  { id: 't11', name: 'Logo Intro', category: 'Intro/Outro', thumbnail: '/placeholder.svg', duration: '0:05', description: 'Animated logo reveal' },
  { id: 't12', name: 'Subscribe Outro', category: 'Intro/Outro', thumbnail: '/placeholder.svg', duration: '0:10', description: 'CTA end screen' },
  { id: 't13', name: 'Glitch Intro', category: 'Intro/Outro', thumbnail: '/placeholder.svg', duration: '0:08', premium: true, description: 'Trendy glitch effect intro' },
  { id: 't14', name: 'Testimonial', category: 'Marketing', thumbnail: '/placeholder.svg', duration: '0:30', description: 'Customer review format' },
  { id: 't15', name: 'Before/After', category: 'Marketing', thumbnail: '/placeholder.svg', duration: '0:20', description: 'Transformation reveal' },
];

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onApplyTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const applyTemplate = (template: Template) => {
    setSelectedTemplate(template.id);
    toast.success(`Applied "${template.name}" template`);

    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
  };

  return (
    <div className="flex flex-col h-full">
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

      {/* Category Filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {templateCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyTemplate(template)}
              onMouseEnter={() => setPreviewTemplate(template.id)}
              onMouseLeave={() => setPreviewTemplate(null)}
              className={`relative rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative">
                <LayoutTemplate className="w-8 h-8 text-gray-500" />

                {/* Premium badge */}
                {template.premium && (
                  <div className="absolute top-2 right-2 bg-yellow-500 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-[10px] text-white font-medium">PRO</span>
                  </div>
                )}

                {/* Selected indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 left-2 bg-primary rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template.id);
                    }}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 mr-2"
                  >
                    <Play className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTemplate(template);
                    }}
                    className="px-3 py-2 bg-primary rounded-lg text-white text-xs font-medium hover:opacity-90"
                  >
                    Use Template
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-white">
                <h3 className="text-sm font-medium text-gray-900 truncate">{template.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    {template.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <Tag className="w-3 h-3" />
                    {template.category}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{template.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <LayoutTemplate className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No Templates Found</h3>
          <p className="text-sm text-gray-500">
            Try a different search or category
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplatesPanel;
