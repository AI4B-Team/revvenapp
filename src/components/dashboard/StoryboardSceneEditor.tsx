import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Scene {
  id: number;
  content: string;
  duration: number;
}

const MAX_SCENES = 8;
const DEFAULT_DURATION = 5;
const MAX_TOTAL_DURATION = 60;
const INITIAL_VISIBLE_SCENES = 4;

const StoryboardSceneEditor: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 1, content: '', duration: DEFAULT_DURATION },
    { id: 2, content: '', duration: DEFAULT_DURATION },
    { id: 3, content: '', duration: DEFAULT_DURATION },
    { id: 4, content: '', duration: DEFAULT_DURATION },
    { id: 5, content: '', duration: DEFAULT_DURATION },
    { id: 6, content: '', duration: DEFAULT_DURATION },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'auto' | 'scenes' | 'instadump'>('scenes');
  const [showAllScenes, setShowAllScenes] = useState(false);

  const totalDuration = useMemo(() => {
    return scenes.reduce((sum, scene) => sum + scene.duration, 0);
  }, [scenes]);

  const visibleScenes = showAllScenes ? scenes : scenes.slice(0, INITIAL_VISIBLE_SCENES);
  const hiddenScenesCount = scenes.length - INITIAL_VISIBLE_SCENES;

  const addScene = () => {
    if (scenes.length >= MAX_SCENES) return;
    const newId = scenes.length > 0 ? Math.max(...scenes.map(s => s.id)) + 1 : 1;
    setScenes([...scenes, { id: newId, content: '', duration: DEFAULT_DURATION }]);
  };

  const deleteScene = (id: number) => {
    if (scenes.length > 1) {
      setScenes(scenes.filter(scene => scene.id !== id));
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

  const moveSceneUp = (index: number) => {
    if (index === 0) return;
    const newScenes = [...scenes];
    [newScenes[index - 1], newScenes[index]] = [newScenes[index], newScenes[index - 1]];
    setScenes(newScenes);
  };

  const moveSceneDown = (index: number) => {
    if (index === scenes.length - 1) return;
    const newScenes = [...scenes];
    [newScenes[index], newScenes[index + 1]] = [newScenes[index + 1], newScenes[index]];
    setScenes(newScenes);
  };

  return (
    <div className="w-full font-sans">
      {/* Dropdown Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'auto'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Auto
          </button>
          
          <button
            onClick={() => {
              setActiveTab('scenes');
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'scenes'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {scenes.length} Scenes
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          <button
            onClick={() => setActiveTab('instadump')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'instadump'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Instadump
          </button>

          {/* Total Duration - Top Right */}
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-sm font-medium ${
              totalDuration > MAX_TOTAL_DURATION ? 'text-red-500' : 'text-gray-600'
            }`}>
              Total: {totalDuration}s / {MAX_TOTAL_DURATION}s
            </span>
          </div>
        </div>

        {/* Expandable Scenes Panel */}
        {isDropdownOpen && activeTab === 'scenes' && (
          <div className="bg-white">
            {/* Upload Reference Images */}
            <div className="px-4 py-3 border-b border-gray-100">
              <button className="flex items-center gap-3 w-full text-left group">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                </div>
                <span className="text-gray-500 text-sm group-hover:text-gray-700 transition-colors">
                  Upload up to 4 refs to edit, extend, or use in storyboard
                </span>
              </button>
            </div>

            {/* Scenes List */}
            <div className="divide-y divide-gray-100">
              {visibleScenes.map((scene, index) => (
                <div 
                  key={scene.id}
                  className="px-4 py-4 group hover:bg-gray-50 transition-colors"
                >
                  {/* Scene Header Row */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveSceneUp(index)}
                        disabled={index === 0}
                        className={`p-0.5 rounded transition-colors ${
                          index === 0
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSceneDown(index)}
                        disabled={index === scenes.length - 1}
                        className={`p-0.5 rounded transition-colors ${
                          index === scenes.length - 1
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
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

            {/* Add Scene Button */}
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={addScene}
                disabled={scenes.length >= MAX_SCENES}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scenes.length >= MAX_SCENES
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Scene
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryboardSceneEditor;
