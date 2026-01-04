import React from 'react';
import { X, Calendar, Trash2, Copy, Tag, Share2, Clock, CheckCircle, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkDuplicate: () => void;
  onBulkReschedule: () => void;
  onBulkChangeStatus: (status: string) => void;
  onBulkAssignLabel: (labelId: string) => void;
  labels: { id: string; name: string; color: string }[];
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkDuplicate,
  onBulkReschedule,
  onBulkChangeStatus,
  onBulkAssignLabel,
  labels,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 fade-in">
      {/* Selection Count */}
      <div className="flex items-center gap-2 pr-3 border-r border-background/20">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
          {selectedCount}
        </div>
        <span className="text-sm font-medium">selected</span>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Reschedule */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-background hover:bg-background/10 hover:text-background"
          onClick={onBulkReschedule}
        >
          <Calendar className="w-4 h-4" />
          Reschedule
        </Button>
        
        {/* Change Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-background hover:bg-background/10 hover:text-background">
              <CheckCircle className="w-4 h-4" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onBulkChangeStatus('draft')}>
              <div className="w-2 h-2 rounded-full bg-slate-500 mr-2" />
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkChangeStatus('scheduled')}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              Scheduled
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkChangeStatus('awaiting')}>
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
              Awaiting Approval
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkChangeStatus('published')}>
              <div className="w-2 h-2 rounded-full bg-green-600 mr-2" />
              Published
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Assign Label */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-background hover:bg-background/10 hover:text-background">
              <Tag className="w-4 h-4" />
              Label
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {labels.map(label => (
              <DropdownMenuItem key={label.id} onClick={() => onBulkAssignLabel(label.id)}>
                <div className={`w-3 h-3 rounded-full ${label.color} mr-2`} />
                {label.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground">
              Remove Label
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Duplicate */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-background hover:bg-background/10 hover:text-background"
          onClick={onBulkDuplicate}
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </Button>
        
        {/* Archive */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-background hover:bg-background/10 hover:text-background"
        >
          <Archive className="w-4 h-4" />
          Archive
        </Button>
        
        {/* Delete */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          onClick={onBulkDelete}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
      
      {/* Close */}
      <button 
        onClick={onClearSelection}
        className="ml-2 p-1.5 hover:bg-background/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BulkActionsBar;
