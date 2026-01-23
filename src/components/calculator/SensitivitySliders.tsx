import React from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SensitivityField {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: 'currency' | 'percent' | 'number' | 'months';
}

interface SensitivitySlidersProps {
  fields: SensitivityField[];
  onChange: (key: string, value: number) => void;
  onChangeEnd?: () => void;
  disabled?: boolean;
}

const formatValue = (value: number, format: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'months':
      return `${value} mo`;
    default:
      return value.toLocaleString();
  }
};

export const SensitivitySliders: React.FC<SensitivitySlidersProps> = ({
  fields,
  onChange,
  onChangeEnd,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Sensitivity Analysis
        </h4>
        <span className="text-xs text-muted-foreground">Drag to see profit change</span>
      </div>
      
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">{field.label}</label>
              <span className="text-sm font-semibold text-emerald-600">
                {formatValue(field.value, field.format)}
              </span>
            </div>
            <Slider
              value={[field.value]}
              min={field.min}
              max={field.max}
              step={field.step}
              onValueChange={(values) => onChange(field.key, values[0])}
              onValueCommit={() => onChangeEnd?.()}
              disabled={disabled}
              className={cn(disabled && "opacity-50")}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatValue(field.min, field.format)}</span>
              <span>{formatValue(field.max, field.format)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensitivitySliders;
