import React, { useRef, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Underline, 
  Paintbrush,
  Type,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RichHeadlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  fontSize: string;
  onFontSizeChange: (size: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  placeholder?: string;
}

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter', className: 'font-sans' },
  { value: 'georgia', label: 'Georgia', className: 'font-serif' },
  { value: 'helvetica', label: 'Helvetica', className: 'font-sans' },
  { value: 'playfair', label: 'Playfair Display', className: 'font-serif' },
  { value: 'roboto', label: 'Roboto', className: 'font-sans' },
  { value: 'montserrat', label: 'Montserrat', className: 'font-sans' },
];

const SIZE_OPTIONS = [
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'X-Large' },
  { value: '2xl', label: '2X-Large' },
  { value: '3xl', label: '3X-Large' },
  { value: '4xl', label: '4X-Large' },
];

const COLOR_PRESETS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function RichHeadlineEditor({
  value,
  onChange,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  placeholder = 'Enter your headline'
}: RichHeadlineEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState('#000000');

  // Keep editor content in sync with external value changes.
  // (Avoid clobbering the caret while the user is actively typing.)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const next = value || '';
    const isFocused = document.activeElement === el;
    if (isFocused) return;

    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Save selection when user selects text
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Only save if selection is within our editor
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  }, []);

  // Restore saved selection
  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  }, []);

  const applyFormatting = useCallback((command: string, formatValue?: string) => {
    restoreSelection();
    // Small delay to ensure selection is restored
    requestAnimationFrame(() => {
      document.execCommand(command, false, formatValue);
      handleInput();
      // Re-save selection after formatting
      saveSelection();
    });
  }, [restoreSelection, handleInput, saveSelection]);

  const applyUnderline = () => {
    applyFormatting('underline');
  };

  const applyColor = (color: string) => {
    applyFormatting('foreColor', color);
    setIsColorPickerOpen(false);
  };

  // Save selection on mouseup and keyup in the editor
  const handleSelectionChange = useCallback(() => {
    saveSelection();
  }, [saveSelection]);

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Headline</Label>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onSelect={handleSelectionChange}
        className="min-h-[60px] p-3 rounded-md border border-border bg-background text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-text"
        style={{ 
          fontFamily: fontFamily === 'georgia' ? 'Georgia, serif' 
            : fontFamily === 'playfair' ? '"Playfair Display", serif'
            : fontFamily === 'montserrat' ? 'Montserrat, sans-serif'
            : 'inherit'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <p className="text-xs text-muted-foreground">
        Highlight text and use the formatting buttons below to apply styles.
      </p>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
        {/* Font Family */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Font</Label>
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            className="h-8 px-2 rounded-md border border-border bg-background text-sm"
          >
            {FONT_OPTIONS.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Size</Label>
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(e.target.value)}
            className="h-8 px-2 rounded-md border border-border bg-background text-sm"
          >
            {SIZE_OPTIONS.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Underline Button */}
        <Button
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyUnderline}
          className="h-8 w-8 p-0"
          title="Underline selected text"
        >
          <Underline className="h-4 w-4" />
        </Button>

        {/* Color Picker */}
        <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              className="h-8 w-8 p-0"
              title="Color selected text"
            >
              <Paintbrush className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <Label className="text-xs font-medium">Text Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyColor(customColor)}
                  className="flex-1 h-8"
                >
                  Apply Custom
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
