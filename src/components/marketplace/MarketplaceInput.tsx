import React from 'react';
import { cn } from '@/lib/utils';

interface MarketplaceInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function MarketplaceInput({
  label,
  error,
  helperText,
  className,
  ...props
}: MarketplaceInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2 border rounded-lg transition-colors bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          error
            ? 'border-destructive focus:ring-destructive'
            : 'border-border',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
