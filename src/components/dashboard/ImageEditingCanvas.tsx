import React, { useState } from 'react';
import { 
  X, ChevronLeft, Undo, Redo, ZoomIn, ZoomOut, Download,
  Upload, RefreshCw, Wand2, Eraser, Paintbrush, Move, Crop,
  Sparkles, Smile, Shirt, Image as ImageIcon, Trash2, Frame,
  Layers, Eye, EyeOff, Star, Maximize2, Grid, Settings
} from 'lucide-react';

const ImageEditingCanvas = ({ image, onClose, onSave }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const leftTools = [
    { id: 'select', icon: <Move size={20} />, label: 'Move/Resize', shortcut: 'V' },
    { id: 'paint', icon: <Paintbrush size={20} />, label: 'Paint', shortcut: 'B' },
    { id: 'erase', icon: <Eraser size={20} />, label: 'Erase', shortcut: 'E' },
    { id: 'crop', icon: <Crop size={20} />, label: 'Crop', shortcut: 'C' },
    { id: 'text', icon: <span className="text-lg font-bold">T</span>, label: 'Text', shortcut: 'T' },
    { id: 'layers', icon: <Layers size={20} />, label: 'Layers', shortcut: 'L' }
  ];

  const aiTools = [
    { id: 'inpaint', icon: <Wand2 size={18} />, label: 'Inpaint', color: 'bg-purple-600' },
    { id: 'remove', icon: <Trash2 size={18} />, label: 'Remove', color: 'bg-red-600' },
    { id: 'expand', icon: <Maximize2 size={18} />, label: 'Expand', color: 'bg-blue-600' },
    { id: 'stylize', icon: <Sparkles size={18} />, label: 'Stylize', color: 'bg-pink-600' },
    { id: 'background', icon: <ImageIcon size={18} />, label: 'Background', color: 'bg-green-600' },
    { id: 'face', icon: <Smile size={18} />, label: 'Edit Face', color: 'bg-orange-600' },
    { id: 'outfit', icon: <Shirt size={18} />, label: 'Edit Outfit', color: 'bg-indigo-600' }
  ];

  const editActions = [
    { id: 'reuse', icon: <RefreshCw size={20} />, label: 'Reuse Prompt' },
    { id: 'action', icon: <Wand2 size={20} />, label: 'Edit Action' },
    { id: 'expression', icon: <Smile size={20} />, label: 'Edit Expression' },
    { id: 'outfit', icon: <Shirt size={20} />, label: 'Edit Outfit' },
    { id: 'background', icon: <ImageIcon size={20} />, label: 'Edit Background' },
    { id: 'magic-erase', icon: <Eraser size={20} />, label: 'Magic Erase' },
    { id: 'reframe', icon: <Frame size={20} />, label: 'Reframe' },
    { id: 'brush-erase', icon: <Paintbrush size={20} />, label: 'Brush Erase' }
  ];

  return (
    <div className="flex-1 bg-gray-950 flex flex-col">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <div className="h-6 w-px bg-gray-700" />

          {/* History Controls */}
          <div className="flex items-center gap-2">
            <button
              disabled={historyIndex <= 0}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-800 transition-colors"
              title="Undo"
            >
              <Undo size={18} />
            </button>
            <button
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-800 transition-colors"
              title="Redo"
            >
              <Redo size={18} />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
            <button
              onClick={() => setZoom(Math.max(10, zoom - 10))}
              className="text-gray-400 hover:text-white"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-300 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(400, zoom + 10))}
              className="text-gray-400 hover:text-white"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
          
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <Download size={18} />
            <span>Export</span>
          </button>

          <button
            onClick={onSave}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Tools */}
        <div className="w-20 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-6 gap-4">
          {leftTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all relative group ${
                selectedTool === tool.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              {tool.icon}
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {tool.label}
                <span className="text-gray-400 ml-2">{tool.shortcut}</span>
              </div>
            </button>
          ))}

          <div className="flex-1" />

          {/* Bottom Tools */}
          <button className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Grid size={20} />
          </button>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col">
          
          {/* AI Tools Bar */}
          <div className="px-6 py-3 bg-gray-900 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
            {aiTools.map((tool) => (
              <button
                key={tool.id}
                className={`${tool.color} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-opacity`}
              >
                {tool.icon}
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-800 relative overflow-hidden">
            {/* Grid Background */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Image Container */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
              {image ? (
                <div 
                  className="relative bg-white rounded-lg shadow-2xl"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  <img
                    src={image}
                    alt="Editing"
                    className="max-w-full max-h-full"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <Upload size={48} />
                  <p className="text-lg">No image loaded</p>
                </div>
              )}
            </div>

            {/* Canvas Overlay Info */}
            <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-gray-300">
              Canvas • 1024 x 1024px
            </div>
          </div>
        </div>

        {/* Right Sidebar - Edit Actions */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto">
          <h3 className="text-white font-bold text-lg mb-4">Edit Options</h3>
          
          <div className="space-y-3">
            {editActions.map((action) => (
              <button
                key={action.id}
                className="w-full flex items-center gap-3 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors group"
              >
                {action.icon}
                <span className="font-medium">{action.label}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </button>
            ))}
          </div>

          {/* Additional Options */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h4 className="text-gray-400 text-sm font-semibold mb-3">LAYERS</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg">
                <Eye size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300 flex-1">Original Image</span>
                <button className="text-gray-400 hover:text-white">
                  <Star size={16} />
                </button>
              </div>
              
              <button className="w-full px-3 py-2 border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg text-sm transition-colors">
                + Add Layer
              </button>
            </div>
          </div>

          {/* Tool Properties */}
          {selectedTool === 'paint' && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h4 className="text-gray-400 text-sm font-semibold mb-3">BRUSH SETTINGS</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Brush Size</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1px</span>
                    <span>100px</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Color</label>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-red-500 rounded-lg cursor-pointer border-2 border-white" />
                    <div className="w-10 h-10 bg-blue-500 rounded-lg cursor-pointer" />
                    <div className="w-10 h-10 bg-green-500 rounded-lg cursor-pointer" />
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg cursor-pointer" />
                    <div className="w-10 h-10 bg-purple-500 rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditingCanvas;
