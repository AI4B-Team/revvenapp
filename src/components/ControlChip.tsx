import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlChipProps {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  onRemove: () => void;
  onClick?: () => void;
}

const ControlChip = ({ 
  label, 
  icon: Icon, 
  iconColor = 'text-emerald-500', 
  bgColor = 'bg-emerald-50',
  borderColor = 'border-emerald-200',
  textColor = 'text-emerald-600',
  onRemove, 
  onClick 
}: ControlChipProps) => {
  // Derive colors from iconColor if not explicitly provided
  const derivedBgColor = iconColor?.includes('blue') ? 'bg-blue-50' : 
                         iconColor?.includes('red') ? 'bg-red-50' :
                         iconColor?.includes('green') ? 'bg-green-50' :
                         iconColor?.includes('orange') ? 'bg-orange-50' :
                         iconColor?.includes('purple') ? 'bg-purple-50' :
                         iconColor?.includes('amber') ? 'bg-amber-50' :
                         bgColor;
  
  const derivedBorderColor = iconColor?.includes('blue') ? 'border-blue-200' : 
                              iconColor?.includes('red') ? 'border-red-200' :
                              iconColor?.includes('green') ? 'border-green-200' :
                              iconColor?.includes('orange') ? 'border-orange-200' :
                              iconColor?.includes('purple') ? 'border-purple-200' :
                              iconColor?.includes('amber') ? 'border-amber-200' :
                              borderColor;
  
  const derivedTextColor = iconColor?.includes('blue') ? 'text-blue-600' : 
                           iconColor?.includes('red') ? 'text-red-600' :
                           iconColor?.includes('green') ? 'text-green-600' :
                           iconColor?.includes('orange') ? 'text-orange-600' :
                           iconColor?.includes('purple') ? 'text-purple-600' :
                           iconColor?.includes('amber') ? 'text-amber-600' :
                           textColor;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border rounded-xl",
        derivedBgColor,
        derivedBorderColor,
        derivedTextColor,
        onClick && 'cursor-pointer hover:opacity-80'
      )}
      onClick={onClick}
    >
      {Icon && <Icon size={14} className={iconColor} />}
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 hover:opacity-70 rounded-full p-0.5 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default ControlChip;
