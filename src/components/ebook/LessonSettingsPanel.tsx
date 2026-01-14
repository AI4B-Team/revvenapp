import React from 'react';
import { FileText, Image, Sparkles, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type GenerationMode = 'text-interactive' | 'text-only';

interface LessonSettingsPanelProps {
  generationMode: GenerationMode;
  onGenerationModeChange: (mode: GenerationMode) => void;
  includeImages: boolean;
  onIncludeImagesChange: (include: boolean) => void;
}

const LessonSettingsPanel: React.FC<LessonSettingsPanelProps> = ({
  generationMode,
  onGenerationModeChange,
  includeImages,
  onIncludeImagesChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Chapter Settings</h3>
            <p className="text-sm text-gray-500">Configure how chapters are generated</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Generation Mode */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Generate Chapter As</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  <strong>Text and interactive content:</strong> Includes flashcards, quizzes, timelines, and other interactive elements.<br /><br />
                  <strong>Text only:</strong> Generates clean text content without interactive elements.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onGenerationModeChange('text-interactive')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                generationMode === 'text-interactive'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                generationMode === 'text-interactive' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Sparkles className={`w-6 h-6 ${
                  generationMode === 'text-interactive' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${
                  generationMode === 'text-interactive' ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  Text + Interactive
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Includes quizzes & flashcards
                </p>
              </div>
            </button>

            <button
              onClick={() => onGenerationModeChange('text-only')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                generationMode === 'text-only'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                generationMode === 'text-only' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <FileText className={`w-6 h-6 ${
                  generationMode === 'text-only' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${
                  generationMode === 'text-only' ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  Text Only
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Clean text content only
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Include AI Images Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              includeImages ? 'bg-emerald-100' : 'bg-gray-200'
            }`}>
              <Image className={`w-5 h-5 ${includeImages ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Include AI-Generated Images</p>
              <p className="text-xs text-gray-500">Generate relevant images for each chapter</p>
            </div>
          </div>
          <button
            onClick={() => onIncludeImagesChange(!includeImages)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              includeImages ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
              includeImages ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonSettingsPanel;
