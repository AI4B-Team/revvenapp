import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

interface Scene {
  id: number;
  content: string;
  duration: number;
}

interface StoryboardSceneEditorProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const MAX_SCENES = 8;
const DEFAULT_DURATION = 5;
const MAX_TOTAL_DURATION = 60;
const INITIAL_VISIBLE_SCENES = 4;

const StoryboardSceneEditor: React.FC<StoryboardSceneEditorProps> = ({ onGenerate, isGenerating }) => {
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 1, content: '', duration: DEFAULT_DURATION },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [showAllScenes, setShowAllScenes] = useState(false);
  const [selectedSceneCount, setSelectedSceneCount] = useState(1);
  const [isSceneCountDropdownOpen, setIsSceneCountDropdownOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);

  const totalDuration = useMemo(() => {
    return scenes.reduce((sum, scene) => sum + scene.duration, 0);
  }, [scenes]);

  const visibleScenes = showAllScenes ? scenes : scenes.slice(0, INITIAL_VISIBLE_SCENES);
  const hiddenScenesCount = scenes.length - INITIAL_VISIBLE_SCENES;

  // Update scene count when dropdown selection changes
  const handleSceneCountChange = (count: number) => {
    setSelectedSceneCount(count);
    setIsSceneCountDropdownOpen(false);
    
    if (count > scenes.length) {
      // Add scenes
      const newScenes = [...scenes];
      for (let i = scenes.length; i < count; i++) {
        const newId = newScenes.length > 0 ? Math.max(...newScenes.map(s => s.id)) + 1 : 1;
        newScenes.push({ id: newId, content: '', duration: DEFAULT_DURATION });
      }
      setScenes(newScenes);
    } else if (count < scenes.length) {
      // Remove scenes from the end
      setScenes(scenes.slice(0, count));
    }
  };

  const deleteScene = (id: number) => {
    if (scenes.length > 1) {
      const newScenes = scenes.filter(scene => scene.id !== id);
      setScenes(newScenes);
      setSelectedSceneCount(newScenes.length);
    }
  };

  const updateSceneContent = (id: number, content: string) => {
    setScenes(scenes.map(scene => 
      scene.id === id ? { ...scene, content } : scene
    ));
  };

  const updateSceneDuration = (id: number, duration: number) => {
    const clampedDuration = Math.max(1, Math.min(30, duration));
    setScenes(scenes.map(scene => 
      scene.id === id ? { ...scene, duration: clampedDuration } : scene
    ));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Calculate if cursor is in top or bottom half of the element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'above' : 'below';
    
    setDragOverIndex(index);
    setDropPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    // Calculate the actual insert position based on drop position
    let targetIndex = dropIndex;
    if (dropPosition === 'below') {
      targetIndex = dropIndex + 1;
    }
    
    // Adjust for the removed item
    if (draggedIndex < targetIndex) {
      targetIndex -= 1;
    }
    
    if (draggedIndex !== targetIndex) {
      const newScenes = [...scenes];
      const [draggedScene] = newScenes.splice(draggedIndex, 1);
      newScenes.splice(targetIndex, 0, draggedScene);
      setScenes(newScenes);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  return (
    <div className="w-full font-sans">
      {/* Dropdown Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header with Scene Count Dropdown */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          {/* Scene Count Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSceneCountDropdownOpen(!isSceneCountDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
            >
              {selectedSceneCount} Scene{selectedSceneCount > 1 ? 's' : ''}
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  isSceneCountDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {isSceneCountDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleSceneCountChange(count)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition ${
                      selectedSceneCount === count ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    } ${count === 1 ? 'rounded-t-lg' : ''} ${count === 8 ? 'rounded-b-lg' : ''}`}
                  >
                    {count} Scene{count > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Dropdown Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            {isDropdownOpen ? 'Hide' : 'Show'} Scenes
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Total Duration - Right */}
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-sm font-medium ${
              totalDuration > MAX_TOTAL_DURATION ? 'text-red-500' : 'text-gray-600'
            }`}>
              Total: {totalDuration}s / {MAX_TOTAL_DURATION}s
            </span>
          </div>
        </div>

        {/* Expandable Scenes Panel */}
        {isDropdownOpen && (
          <div className="bg-white">
            {/* Scenes List */}
            <div className="divide-y divide-gray-100">
              {visibleScenes.map((scene, index) => (
                <div 
                  key={scene.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative px-4 py-4 group hover:bg-gray-50 transition-colors cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  {/* Green drop indicator line - above */}
                  {dragOverIndex === index && dropPosition === 'above' && draggedIndex !== index && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500 z-10" style={{ transform: 'translateY(-1px)' }}>
                      <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
                      <div className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
                    </div>
                  )}
                  {/* Green drop indicator line - below */}
                  {dragOverIndex === index && dropPosition === 'below' && draggedIndex !== index && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 z-10" style={{ transform: 'translateY(1px)' }}>
                      <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
                      <div className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
                    </div>
                  )}
                  {/* Scene Header Row */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Drag Handle */}
                    <div className="flex items-center text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Scene Number Badge */}
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Scene Label */}
                    <span className="text-sm font-medium text-gray-700">
                      Scene {index + 1}
                    </span>

                    {/* Spacer */}
                    <div className="flex-1" />
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteScene(scene.id)}
                      className={`p-2 rounded-lg transition-all ${
                        scenes.length > 1
                          ? 'opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 hover:text-red-500'
                          : 'opacity-0 cursor-not-allowed'
                      }`}
                      disabled={scenes.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scene Description Textarea */}
                  <div className="ml-11 mb-3">
                    <textarea
                      value={scene.content}
                      onChange={(e) => updateSceneContent(scene.id, e.target.value)}
                      placeholder="Describe this scene..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 text-sm outline-none focus:border-green-300 focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  {/* Duration Row */}
                  <div className="ml-11 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <input
                      type="number"
                      value={scene.duration}
                      onChange={(e) => updateSceneDuration(scene.id, parseInt(e.target.value) || 1)}
                      min={1}
                      max={30}
                      className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm outline-none focus:border-green-300 focus:bg-white transition-colors text-center"
                    />
                    <span className="text-sm text-gray-500">sec</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {hiddenScenesCount > 0 && (
              <div className="flex justify-center py-3 border-t border-gray-100">
                <button
                  onClick={() => setShowAllScenes(!showAllScenes)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {showAllScenes ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show {hiddenScenesCount} More Scene{hiddenScenesCount > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={onGenerate}
                disabled={isGenerating || !scenes.some(s => s.content.trim().length > 0)}
                className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryboardSceneEditor;
