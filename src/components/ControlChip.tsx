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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full ${onClick ? 'cursor-pointer hover:bg-emerald-100' : ''}`}
      onClick={onClick}
    >
      {Icon && <Icon size={14} className={iconColor || 'text-emerald-500'} />}
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default ControlChip;
