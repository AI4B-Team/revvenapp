import { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Bookmark, Heart, Download, 
  RefreshCw, Share2, Copy, Check, Maximize, Globe, Printer, Edit, Play
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageData {
  id: number | string;
  type: 'image' | 'video';
  thumbnail: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
  };
  url?: string;
  prompt?: string;
  aspectRatio?: string;
  model?: string;
  referenceImage?: string;
  timestamp?: string;
  resolution?: string;
}

interface ImageViewerModalProps {
  image: ImageData;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
  onAnimate?: (imageUrl: string) => void;
}

const ImageViewerModal = ({ 
  image, 
  onClose, 
  onPrevious, 
  onNext,
  isLiked = false,
  isSaved = false,
  onToggleLike,
  onToggleSave,
  onAnimate
}: ImageViewerModalProps) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevious, onNext]);

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (newZoom === 100) {
      setDragPosition({ x: 0, y: 0 });
    }
  };

  const imageData = {
    url: image.url || image.thumbnail,
    prompt: image.prompt || 'A stunning AI-generated creation showcasing beautiful composition and artistic vision.',
    aspectRatio: image.aspectRatio || '16:9',
    model: image.model || 'Nano Banana',
    referenceImage: image.referenceImage || image.thumbnail,
    timestamp: image.timestamp || '2 weeks ago',
    resolution: image.resolution || '1344x768 px',
    ...image
  };

  const socialPlatforms = [
    { name: 'Twitter', icon: '𝕏', color: 'hover:bg-gray-900' },
    { name: 'Facebook', icon: 'f', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: '📷', color: 'hover:bg-pink-600' },
    { name: 'LinkedIn', icon: 'in', color: 'hover:bg-blue-700' }
  ];

  const copyShareLink = () => {
    const link = `${window.location.origin}/creation/${imageData.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(imageData.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - dragPosition.x,
        y: e.clientY - dragPosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      setDragPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        
        {/* Modal Container with external buttons */}
        <div className="relative w-full max-w-6xl h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {/* Navigation Arrows - Outside modal */}
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors z-50 shadow-lg"
              title="Previous"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
          )}

          {onNext && (
            <button
              onClick={onNext}
              className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors z-50 shadow-lg"
              title="Next"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          )}

          {/* Close Button - Right side above arrow */}
          <button
            onClick={onClose}
            className="absolute -right-16 top-8 w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors z-50 shadow-lg"
            title="Close"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Modal Content */}
          <div className="w-full h-full bg-gray-900 rounded-xl shadow-2xl flex overflow-hidden">
            
            {/* Left Side - Image */}
            <div className="flex-1 relative bg-black flex items-center justify-center">

            {/* Image Container */}
            <div 
              className="relative w-full h-full group p-4 overflow-hidden flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{ 
                cursor: zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              <img
                src={imageData.url}
                alt={imageData.title}
                className="rounded-lg max-w-full max-h-full object-contain select-none"
                style={{ 
                  transform: `scale(${zoom / 100}) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-96 bg-gray-900 flex flex-col overflow-hidden">
          
            {/* Header Info */}
            <div className="p-4 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-end">
                <TooltipProvider>
                  <div className="flex items-center justify-between w-full gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Globe size={20} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add To Community</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={onToggleSave}
                          className={`transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                        >
                          <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Download size={20} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Printer size={20} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Print</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShareModalOpen(true)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Share2 size={20} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>

            {/* Scrollable Middle Section */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">Prompt</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyPrompt}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedPrompt ? (
                      <Check size={18} className="text-green-500" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy Prompt</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div>
              <div className={`text-gray-300 text-sm leading-relaxed ${!promptExpanded ? 'line-clamp-3' : ''}`}>
                {imageData.prompt}
              </div>
              {!promptExpanded && imageData.prompt.length > 120 && (
                <button
                  onClick={() => setPromptExpanded(true)}
                  className="mt-1 text-blue-400 hover:text-blue-300 cursor-pointer font-medium text-sm"
                >
                  see more
                </button>
              )}
              {promptExpanded && (
                <button
                  onClick={() => setPromptExpanded(false)}
                  className="mt-2 text-blue-400 hover:text-blue-300 font-medium text-sm"
                >
                  see less
                </button>
              )}
            </div>
            </div>

            {/* Image Details */}
            <div className="p-4 border-b border-gray-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Created:</span>
                  <span className="text-white text-xs font-medium">{imageData.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Model:</span>
                  <span className="text-white text-xs font-medium">{imageData.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Dimensions:</span>
                  <span className="text-white text-xs font-medium">{imageData.resolution}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Aspect Ratio:</span>
                  <span className="text-white text-xs font-medium">{imageData.aspectRatio}</span>
                </div>
              </div>
            </div>

            {/* Reference Image */}
            {imageData.referenceImage && (
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold mb-2 text-sm">Reference</h3>
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={imageData.referenceImage}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

          </div>

            {/* Bottom Fixed Section */}
            <div className="flex-shrink-0 border-t border-gray-800">
              {/* Action Buttons */}
              <div className="p-4 space-y-2 border-b border-gray-800">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M20.4 14.5L16 10 4 20"/>
                        </svg>
                        <span className="font-medium">Use</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reuse Prompt & Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                  <RefreshCw size={16} />
                  <span className="font-medium">Recreate</span>
                </button>
              </div>
              {/* Zoom Control */}
              <div className="p-4 flex items-center gap-3">
                <span className="text-gray-400 text-xs whitespace-nowrap">{zoom}%</span>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={zoom}
                  onChange={(e) => handleZoomChange(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>

              {/* Bottom Action Buttons */}
              <div className="p-4 flex gap-2">
                <button className="flex-1 px-2 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors text-xs">
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button className="flex-1 px-2 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors text-xs">
                  <Maximize size={14} />
                  <span>Upscale</span>
                </button>
                <button 
                  onClick={() => {
                    onAnimate?.(imageData.url);
                    onClose();
                  }}
                  className="flex-1 px-2 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors text-xs"
                >
                  <Play size={14} />
                  <span>Animate</span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShareModalOpen(false)}
          />
          
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-6">Share Creation</h3>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    className={`aspect-square bg-gray-100 ${platform.color} text-gray-700 hover:text-white rounded-xl flex flex-col items-center justify-center gap-2 transition-colors p-4`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Share Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/creation/${imageData.id}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                  />
                  <button
                    onClick={copyShareLink}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      copiedLink
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ImageViewerModal;
