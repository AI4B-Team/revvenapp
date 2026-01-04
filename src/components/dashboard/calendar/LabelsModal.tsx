import React, { useState } from 'react';
import { X, Plus, Trash2, Pencil, Check, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const colorPresets = [
  { name: 'Slate', bg: 'bg-slate-600', hex: '#475569' },
  { name: 'Red', bg: 'bg-red-500', hex: '#ef4444' },
  { name: 'Orange', bg: 'bg-orange-500', hex: '#f97316' },
  { name: 'Amber', bg: 'bg-amber-500', hex: '#f59e0b' },
  { name: 'Yellow', bg: 'bg-yellow-500', hex: '#eab308' },
  { name: 'Lime', bg: 'bg-lime-500', hex: '#84cc16' },
  { name: 'Green', bg: 'bg-green-500', hex: '#22c55e' },
  { name: 'Emerald', bg: 'bg-emerald-500', hex: '#10b981' },
  { name: 'Teal', bg: 'bg-teal-500', hex: '#14b8a6' },
  { name: 'Cyan', bg: 'bg-cyan-500', hex: '#06b6d4' },
  { name: 'Sky', bg: 'bg-sky-500', hex: '#0ea5e9' },
  { name: 'Blue', bg: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Indigo', bg: 'bg-indigo-500', hex: '#6366f1' },
  { name: 'Violet', bg: 'bg-violet-500', hex: '#8b5cf6' },
  { name: 'Purple', bg: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-500', hex: '#d946ef' },
  { name: 'Pink', bg: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Rose', bg: 'bg-rose-500', hex: '#f43f5e' },
];

const LabelsModal: React.FC<LabelsModalProps> = ({ isOpen, onClose, labels, onLabelsChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('bg-blue-500');

  const startEdit = (label: Label) => {
    setEditingId(label.id);
    setEditingName(label.name);
  };

  const saveEdit = () => {
    if (!editingName.trim() || !editingId) return;
    onLabelsChange(labels.map(l => 
      l.id === editingId ? { ...l, name: editingName } : l
    ));
    setEditingId(null);
    setEditingName('');
  };

  const deleteLabel = (labelId: string) => {
    onLabelsChange(labels.filter(l => l.id !== labelId));
  };

  const changeColor = (labelId: string, color: string) => {
    onLabelsChange(labels.map(l => 
      l.id === labelId ? { ...l, color } : l
    ));
  };

  const addLabel = () => {
    if (!newLabelName.trim()) return;
    const newLabel: Label = {
      id: `label-${Date.now()}`,
      name: newLabelName.toUpperCase(),
      color: newLabelColor,
    };
    onLabelsChange([...labels, newLabel]);
    setNewLabelName('');
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Manage Labels</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {labels.map(label => (
            <div 
              key={label.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              
              {/* Color picker */}
              <div className="relative">
                <button className={`w-6 h-6 rounded-full ${label.color} hover:ring-2 hover:ring-offset-2`} />
                <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg hidden group-hover:block z-10">
                  <div className="grid grid-cols-6 gap-1">
                    {colorPresets.map(color => (
                      <button
                        key={color.bg}
                        onClick={() => changeColor(label.id, color.bg)}
                        className={`w-5 h-5 rounded-full ${color.bg} hover:ring-2 hover:ring-offset-1`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Label name */}
              {editingId === label.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-8 text-sm uppercase"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <Button size="sm" variant="ghost" onClick={saveEdit}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <span className={`flex-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${label.color} text-white`}>
                  {label.name}
                </span>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(label)}
                  className="p-1.5 hover:bg-muted rounded"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => deleteLabel(label.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Add New Label */}
          {isAdding ? (
            <div className="p-3 rounded-lg border border-border space-y-3">
              <Input
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="uppercase text-sm"
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {colorPresets.map(color => (
                  <button
                    key={color.bg}
                    onClick={() => setNewLabelColor(color.bg)}
                    className={`w-6 h-6 rounded-full ${color.bg} ${
                      newLabelColor === color.bg ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={addLabel} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Add Label
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground border-2 border-dashed border-border"
            >
              <Plus className="w-4 h-4" />
              Add New Label
            </button>
          )}
        </div>
        
        <div className="flex justify-end pt-2 border-t border-border">
          <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LabelsModal;
