import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Link, 
  Play, 
  ExternalLink,
  Anchor,
  ChevronDown,
  ChevronUp,
  Edit2,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface HeroButton {
  id: string;
  text: string;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  action: 'link' | 'anchor' | 'video' | 'custom';
  url?: string;
  anchorId?: string;
  videoUrl?: string;
  openInNewTab?: boolean;
}

interface HeroButtonEditorProps {
  buttons: HeroButton[];
  onChange: (buttons: HeroButton[]) => void;
}

const defaultButtons: HeroButton[] = [
  { id: '1', text: 'Get Started', style: 'primary', action: 'link', url: '#pricing' },
  { id: '2', text: 'Learn More', style: 'secondary', action: 'anchor', anchorId: 'features' },
];

export function HeroButtonEditor({ buttons = defaultButtons, onChange }: HeroButtonEditorProps) {
  const [editingButton, setEditingButton] = useState<HeroButton | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addButton = () => {
    const newButton: HeroButton = {
      id: Date.now().toString(),
      text: 'New Button',
      style: 'secondary',
      action: 'link',
      url: '#',
    };
    onChange([...buttons, newButton]);
  };

  const updateButton = (id: string, updates: Partial<HeroButton>) => {
    onChange(buttons.map(btn => btn.id === id ? { ...btn, ...updates } : btn));
  };

  const deleteButton = (id: string) => {
    onChange(buttons.filter(btn => btn.id !== id));
  };

  const moveButton = (index: number, direction: 'up' | 'down') => {
    const newButtons = [...buttons];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= buttons.length) return;
    [newButtons[index], newButtons[newIndex]] = [newButtons[newIndex], newButtons[index]];
    onChange(newButtons);
  };

  const openEditDialog = (button: HeroButton) => {
    setEditingButton({ ...button });
    setIsDialogOpen(true);
  };

  const saveEditDialog = () => {
    if (editingButton) {
      updateButton(editingButton.id, editingButton);
      setIsDialogOpen(false);
      setEditingButton(null);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'link': return <ExternalLink className="h-3 w-3" />;
      case 'anchor': return <Anchor className="h-3 w-3" />;
      case 'video': return <Play className="h-3 w-3" />;
      default: return <Link className="h-3 w-3" />;
    }
  };

  const getStyleLabel = (style: string) => {
    switch (style) {
      case 'primary': return 'Primary';
      case 'secondary': return 'Secondary';
      case 'outline': return 'Outline';
      case 'ghost': return 'Ghost';
      default: return style;
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">CTA Buttons</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={addButton}
          className="gap-1 h-7 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Button
        </Button>
      </div>

      <div className="space-y-2">
        {buttons.map((button, index) => (
          <div 
            key={button.id}
            className="flex items-center gap-2 p-2 rounded-md border border-border bg-background group"
          >
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveButton(index, 'up')}
                disabled={index === 0}
                className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => moveButton(index, 'down')}
                disabled={index === buttons.length - 1}
                className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{button.text}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {getStyleLabel(button.style)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                {getActionIcon(button.action)}
                <span className="truncate">
                  {button.action === 'link' && button.url}
                  {button.action === 'anchor' && `#${button.anchorId}`}
                  {button.action === 'video' && 'Video Popup'}
                  {button.action === 'custom' && 'Custom Action'}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEditDialog(button)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => deleteButton(button.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {buttons.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No buttons yet. Click "Add Button" to create one.
          </p>
        )}
      </div>

      {/* Edit Button Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Button</DialogTitle>
          </DialogHeader>

          {editingButton && (
            <div className="space-y-4 py-4">
              {/* Button Text */}
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={editingButton.text}
                  onChange={(e) => setEditingButton({ ...editingButton, text: e.target.value })}
                  placeholder="Enter button text"
                />
              </div>

              {/* Button Style */}
              <div className="space-y-2">
                <Label>Style</Label>
                <Select
                  value={editingButton.style}
                  onValueChange={(value: HeroButton['style']) => 
                    setEditingButton({ ...editingButton, style: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary (Filled)</SelectItem>
                    <SelectItem value="secondary">Secondary (Muted)</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="ghost">Ghost (Text Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Type */}
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={editingButton.action}
                  onValueChange={(value: HeroButton['action']) => 
                    setEditingButton({ ...editingButton, action: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open URL
                      </div>
                    </SelectItem>
                    <SelectItem value="anchor">
                      <div className="flex items-center gap-2">
                        <Anchor className="h-4 w-4" />
                        Scroll to Section
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Video Popup
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action-specific fields */}
              {editingButton.action === 'link' && (
                <>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={editingButton.url || ''}
                      onChange={(e) => setEditingButton({ ...editingButton, url: e.target.value })}
                      placeholder="https://example.com or #section"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="openInNewTab"
                      checked={editingButton.openInNewTab || false}
                      onChange={(e) => setEditingButton({ ...editingButton, openInNewTab: e.target.checked })}
                      className="rounded border-border"
                    />
                    <Label htmlFor="openInNewTab" className="text-sm cursor-pointer">
                      Open in new tab
                    </Label>
                  </div>
                </>
              )}

              {editingButton.action === 'anchor' && (
                <div className="space-y-2">
                  <Label>Section ID</Label>
                  <Select
                    value={editingButton.anchorId || ''}
                    onValueChange={(value) => setEditingButton({ ...editingButton, anchorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="capabilities">Capabilities</SelectItem>
                      <SelectItem value="testimonials">Testimonials</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="cta">Call to Action</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingButton.action === 'video' && (
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={editingButton.videoUrl || ''}
                    onChange={(e) => setEditingButton({ ...editingButton, videoUrl: e.target.value })}
                    placeholder="YouTube or Vimeo URL"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports YouTube and Vimeo embed URLs
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditDialog}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
