import React, { useState } from 'react';
import { Wand2, Upload, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface AIIconGeneratorProps {
  currentIcon?: string;
  currentIconUrl?: string;
  onIconChange: (icon: string, iconUrl?: string) => void;
  context?: string;
}

const EMOJI_PRESETS = ['⚡', '🚀', '💡', '🎯', '✨', '🔥', '💪', '🌟', '📊', '🔒', '⚙️', '🎨'];

const AIIconGenerator: React.FC<AIIconGeneratorProps> = ({
  currentIcon = '⚡',
  currentIconUrl,
  onIconChange,
  context = 'feature',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const handleEmojiSelect = (emoji: string) => {
    onIconChange(emoji, undefined);
    setIsOpen(false);
    toast.success('Icon updated!');
  };

  const handleCustomEmoji = () => {
    if (customEmoji.trim()) {
      onIconChange(customEmoji.trim(), undefined);
      setCustomEmoji('');
      setIsOpen(false);
      toast.success('Custom icon set!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onIconChange('', dataUrl);
        setIsOpen(false);
        toast.success('Icon uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Auto-select a contextually appropriate emoji
      const contextEmojis: Record<string, string[]> = {
        feature: ['⚡', '🚀', '💡', '🎯', '✨'],
        capability: ['🔥', '💪', '🌟', '📊', '🔒'],
        default: EMOJI_PRESETS,
      };
      
      const options = contextEmojis[context] || contextEmojis.default;
      const selected = options[Math.floor(Math.random() * options.length)];
      
      onIconChange(selected, undefined);
      toast.success('Icon generated!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Map common keywords to emojis
      const promptLower = aiPrompt.toLowerCase();
      let selectedEmoji = '✨';
      
      const emojiMap: Record<string, string> = {
        'speed': '⚡',
        'fast': '⚡',
        'quick': '⚡',
        'rocket': '🚀',
        'launch': '🚀',
        'growth': '🚀',
        'idea': '💡',
        'light': '💡',
        'innovation': '💡',
        'target': '🎯',
        'goal': '🎯',
        'focus': '🎯',
        'fire': '🔥',
        'hot': '🔥',
        'trending': '🔥',
        'strong': '💪',
        'power': '💪',
        'strength': '💪',
        'star': '🌟',
        'premium': '🌟',
        'quality': '🌟',
        'chart': '📊',
        'analytics': '📊',
        'data': '📊',
        'secure': '🔒',
        'security': '🔒',
        'safe': '🔒',
        'settings': '⚙️',
        'config': '⚙️',
        'customize': '⚙️',
        'design': '🎨',
        'creative': '🎨',
        'art': '🎨',
        'money': '💰',
        'dollar': '💰',
        'profit': '💰',
        'heart': '❤️',
        'love': '❤️',
        'care': '❤️',
        'time': '⏰',
        'clock': '⏰',
        'schedule': '📅',
        'calendar': '📅',
        'message': '💬',
        'chat': '💬',
        'communication': '💬',
        'global': '🌍',
        'world': '🌍',
        'international': '🌍',
        'cloud': '☁️',
        'storage': '☁️',
        'magic': '✨',
        'sparkle': '✨',
        'ai': '🤖',
        'robot': '🤖',
        'automation': '🤖',
      };
      
      for (const [keyword, emoji] of Object.entries(emojiMap)) {
        if (promptLower.includes(keyword)) {
          selectedEmoji = emoji;
          break;
        }
      }
      
      onIconChange(selectedEmoji, undefined);
      setAiPrompt('');
      toast.success('Icon generated based on your description!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-12 h-12 rounded-lg border-2 border-border flex items-center justify-center bg-muted/30 text-2xl shrink-0 overflow-hidden">
        {currentIconUrl ? (
          <img src={currentIconUrl} alt="" className="w-full h-full object-contain" />
        ) : (
          <span>{currentIcon || '⚡'}</span>
        )}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <span className="text-white text-xs font-medium">Replace</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-4">
            {/* Preset Emojis */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Quick Select</Label>
              <div className="grid grid-cols-6 gap-1">
                {EMOJI_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-lg hover:bg-muted rounded-md transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Emoji */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Custom Emoji</Label>
              <div className="flex gap-2">
                <Input
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="Paste emoji..."
                  className="text-center text-lg h-9"
                />
                <Button size="sm" variant="secondary" onClick={handleCustomEmoji} disabled={!customEmoji.trim()}>
                  Set
                </Button>
              </div>
            </div>

            {/* Upload */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Upload Image</Label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Choose file...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* AI Generation */}
            <div className="border-t pt-3">
              <Label className="text-xs text-muted-foreground mb-2 block">AI Icon Generator</Label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={handleAutoGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Auto Generate
                </Button>
                
                <div className="flex gap-2">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe icon (e.g., 'speed')"
                    className="text-sm h-9"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePromptGenerate();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handlePromptGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="shrink-0"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AIIconGenerator;
