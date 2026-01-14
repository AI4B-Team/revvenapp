import React from 'react';
import { FileText, Image, ToggleLeft, ToggleRight } from 'lucide-react';

interface ChapterSettingsPanelProps {
  generationMode: 'text-interactive' | 'text-only';
  onGenerationModeChange: (mode: 'text-interactive' | 'text-only') => void;
  includeImages: boolean;
  onIncludeImagesChange: (include: boolean) => void;
}

const ChapterSettingsPanel: React.FC<ChapterSettingsPanelProps> = ({
  generationMode,
  onGenerationModeChange,
  includeImages,
  onIncludeImagesChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Settings</h3>
      
      {/* Generation Mode */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Generate chapter as:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onGenerationModeChange('text-interactive')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              generationMode === 'text-interactive'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              generationMode === 'text-interactive' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Text and interactive content</div>
              <div className="text-xs opacity-70">Includes quizzes, flashcards, etc.</div>
            </div>
          </button>
          
          <button
            onClick={() => onGenerationModeChange('text-only')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              generationMode === 'text-only'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              generationMode === 'text-only' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Text only</div>
              <div className="text-xs opacity-70">Pure text content</div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Include AI Images Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Image className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Include AI-generated images</div>
            <div className="text-sm text-gray-500">Add relevant images to each chapter</div>
          </div>
        </div>
        <button
          onClick={() => onIncludeImagesChange(!includeImages)}
          className="flex items-center"
        >
          {includeImages ? (
            <ToggleRight className="w-10 h-10 text-blue-500" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChapterSettingsPanel;
