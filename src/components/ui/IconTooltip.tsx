import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

// Helper function to convert text to Title Case
export const toTitleCase = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface IconTooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
  className?: string;
  asChild?: boolean;
}

export const IconTooltip = ({
  label,
  children,
  side = "top",
  delayDuration = 100,
  className,
  asChild = true,
}: IconTooltipProps) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={asChild} className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p>{toTitleCase(label)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Convenient wrapper for icon buttons with tooltips
interface IconButtonWithTooltipProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
}

export const IconButtonWithTooltip = ({
  icon: Icon,
  label,
  onClick,
  side = "top",
  className = "p-2 rounded hover:bg-muted transition-colors",
  iconClassName = "w-4 h-4",
  disabled = false,
}: IconButtonWithTooltipProps) => {
  return (
    <IconTooltip label={label} side={side}>
      <button onClick={onClick} className={className} disabled={disabled}>
        <Icon className={iconClassName} />
      </button>
    </IconTooltip>
  );
};

export default IconTooltip;
