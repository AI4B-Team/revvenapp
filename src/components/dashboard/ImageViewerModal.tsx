import { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Bookmark, Heart, Download, 
  RefreshCw, Share2, Copy, Check, Maximize, Globe, Printer
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageData {
  id: number;
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
}

const ImageViewerModal = ({ 
  image, 
  onClose, 
  onPrevious, 
  onNext,
  isLiked = false,
  isSaved = false,
  onToggleLike,
  onToggleSave
}: ImageViewerModalProps) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [promptExpanded, setPromptExpanded] = useState(false);

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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        
        {/* Modal Container with external close button */}
        <div className="relative w-full max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
          {/* Close Button - Outside top right */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 w-11 h-11 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors z-50 shadow-lg"
            title="Close"
          >
            <X size={22} className="text-white" />
          </button>

          {/* Modal Content */}
          <div className="w-full h-[90vh] bg-gray-900 rounded-xl shadow-2xl flex overflow-hidden">
            
            {/* Left Side - Image */}
            <div className="flex-1 relative bg-black flex items-center justify-center">

            {/* Navigation Arrows */}
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-40"
                title="Previous"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            )}

            {onNext && (
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-40"
                title="Next"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            )}

            {/* Image Container */}
            <div className="relative w-full h-full group p-4 overflow-auto flex items-center justify-center">
              <img
                src={imageData.url}
                alt={imageData.title}
                className="rounded-lg max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-96 bg-gray-900 flex flex-col overflow-y-auto">
          
            {/* Header Info */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">{imageData.timestamp}</span>
                <TooltipProvider>
                  <div className="flex items-center gap-2">
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

            {/* Prompt Section */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Prompt</h3>
                <button
                  onClick={copyPrompt}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy prompt"
                >
                  {copiedPrompt ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
              <div className="text-gray-300 text-sm leading-relaxed">
                {promptExpanded ? (
                  <p>{imageData.prompt}</p>
                ) : (
                  <p className="line-clamp-3">
                    {imageData.prompt}{' '}
                    {imageData.prompt.length > 150 && (
                      <button
                        onClick={() => setPromptExpanded(true)}
                        className="text-blue-500 hover:text-blue-400 font-medium"
                      >
                        See More
                      </button>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Image Details */}
            <div className="p-6 border-b border-gray-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Model:</span>
                  <span className="text-white text-sm font-medium">{imageData.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Aspect Ratio:</span>
                  <span className="text-white text-sm font-medium">{imageData.aspectRatio}</span>
                </div>
              </div>
            </div>

            {/* Reference Image */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-white font-semibold mb-3">Reference</h3>
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={imageData.referenceImage}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-2 flex-shrink-0">
              <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 text-white rounded-lg flex items-center gap-3 transition-colors">
                <RefreshCw size={18} />
                <span className="font-medium">Recreate</span>
              </button>
              
              <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 text-white rounded-lg flex items-center gap-3 transition-colors">
                <Maximize size={18} />
                <span className="font-medium">Upscale</span>
              </button>
              
              <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 text-white rounded-lg flex items-center gap-3 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span className="font-medium">Create Video</span>
              </button>
              
              <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 text-white rounded-lg flex items-center justify-between transition-colors group">
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M20.4 14.5L16 10 4 20"/>
                  </svg>
                  <span className="font-medium">Use Image</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Bottom Info */}
            <div className="p-6 border-t border-gray-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{zoom}%</span>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <span className="text-gray-400 text-sm">{imageData.resolution}</span>
            </div>

            {/* Edit Image Button */}
            <div className="p-6 pt-0 flex-shrink-0">
              <button className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors">
                <RefreshCw size={18} />
                <span>Edit Image</span>
              </button>
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
