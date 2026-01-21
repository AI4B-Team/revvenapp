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
  { name: 'Slate', bg: 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600', hex: '#475569' },
  { name: 'Red', bg: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700', hex: '#ef4444' },
  { name: 'Orange', bg: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700', hex: '#f97316' },
  { name: 'Amber', bg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700', hex: '#f59e0b' },
  { name: 'Yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700', hex: '#eab308' },
  { name: 'Lime', bg: 'bg-lime-50 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 border border-lime-200 dark:border-lime-700', hex: '#84cc16' },
  { name: 'Green', bg: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700', hex: '#22c55e' },
  { name: 'Emerald', bg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700', hex: '#10b981' },
  { name: 'Teal', bg: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700', hex: '#14b8a6' },
  { name: 'Cyan', bg: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700', hex: '#06b6d4' },
  { name: 'Sky', bg: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700', hex: '#0ea5e9' },
  { name: 'Blue', bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700', hex: '#3b82f6' },
  { name: 'Indigo', bg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700', hex: '#6366f1' },
  { name: 'Violet', bg: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700', hex: '#8b5cf6' },
  { name: 'Purple', bg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700', hex: '#a855f7' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-700', hex: '#d946ef' },
  { name: 'Pink', bg: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700', hex: '#ec4899' },
  { name: 'Rose', bg: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700', hex: '#f43f5e' },
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
                <span className={`flex-1 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${label.color}`}>
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
