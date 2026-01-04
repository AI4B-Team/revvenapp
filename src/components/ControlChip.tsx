import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ControlChipProps {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  onRemove: () => void;
  onClick?: () => void;
}

const ControlChip = ({ label, icon: Icon, iconColor, onRemove, onClick }: ControlChipProps) => {
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 text-primary border border-primary/20 rounded-lg ${onClick ? 'cursor-pointer hover:bg-primary/15' : ''}`}
      onClick={onClick}
    >
      {Icon && <Icon size={14} className={iconColor || 'text-primary'} />}
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 hover:bg-primary/20 rounded p-0.5 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default ControlChip;
