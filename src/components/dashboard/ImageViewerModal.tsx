import { useState, useEffect, useMemo } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Bookmark, Heart, Download, 
  RefreshCw, Share2, Copy, Check, Maximize, Globe, Printer, Edit, Play, Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CommunityComments from './CommunityComments';

interface StoryScene {
  scene: string;
  duration: number;
}

interface ImageData {
  id: number | string;
  type: 'image' | 'video' | 'document' | 'audio';
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
  referenceImages?: string[];
  timestamp?: string;
  resolution?: string;
  scenes?: StoryScene[];
  documentType?: string;
  content?: string;
  audioType?: string;
  duration?: number;
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
  onDelete?: (id: string | number) => void;
  isCommunityView?: boolean;
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
  onAnimate,
  onDelete,
  isCommunityView = false
}: ImageViewerModalProps) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharingToCommunity, setIsSharingToCommunity] = useState(false);
  const [isSharedToCommunity, setIsSharedToCommunity] = useState(false);
  const { toast } = useToast();

  // Download functionality
  const handleDownload = async () => {
    if (image.type === 'document') {
      // For documents, create a downloadable text file
      const content = image.content || 'No content available';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.title || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    const fileUrl = image.url || image.thumbnail;
    if (!fileUrl || fileUrl === '/placeholder.svg') return;

    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = image.type === 'video' ? 'mp4' : image.type === 'audio' ? 'mp3' : 'png';
      a.download = `${image.title || 'download'}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Print functionality
  const handlePrint = () => {
    if (image.type === 'document') {
      const content = image.content || 'No content available';
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${image.title || 'Document'}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                h1, h2, h3 { margin-top: 1em; }
              </style>
            </head>
            <body>
              <h1>${image.title || 'Document'}</h1>
              <div>${content.replace(/\n/g, '<br/>')}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } else {
      const fileUrl = image.url || image.thumbnail;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${image.title || 'Print'}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img, video { max-width: 100%; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              ${image.type === 'video' 
                ? `<video src="${fileUrl}" controls style="max-width: 100%;"></video>` 
                : `<img src="${fileUrl}" alt="${image.title || 'Image'}" />`
              }
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Add to community
  const handleAddToCommunity = async () => {
    if (isSharingToCommunity) return;
    
    setIsSharingToCommunity(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Login required",
          description: "Please log in to share to community",
          variant: "destructive"
        });
        setIsSharingToCommunity(false);
        return;
      }

      // Get user profile for creator name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', session.session.user.id)
        .single();

      const creatorName = profileData?.full_name || session.session.user.email?.split('@')[0] || 'Anonymous';
      const creatorAvatar = profileData?.avatar_url || null;

      // Check if already shared
      const { data: existingPost } = await supabase
        .from('community_posts')
        .select('id')
        .eq('original_item_id', String(image.id))
        .eq('user_id', session.session.user.id)
        .single();

      if (existingPost) {
        toast({
          title: "Already shared",
          description: "This creation is already in the community gallery",
        });
        setIsSharedToCommunity(true);
        setIsSharingToCommunity(false);
        return;
      }

      // Create community post
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: session.session.user.id,
          original_item_id: String(image.id),
          original_item_type: image.type,
          title: image.title,
          thumbnail_url: image.thumbnail,
          content_url: image.url || image.thumbnail,
          prompt: image.prompt || null,
          model: image.model || null,
          aspect_ratio: image.aspectRatio || null,
          resolution: image.resolution || null,
          creator_name: creatorName,
          creator_avatar: creatorAvatar
        });

      if (error) {
        console.error('Error sharing to community:', error);
        toast({
          title: "Failed to share",
          description: "Could not share to community. Please try again.",
          variant: "destructive"
        });
        setIsSharingToCommunity(false);
        return;
      }

      setIsSharedToCommunity(true);
      toast({
        title: "Shared to Community! 🎉",
        description: "Your creation is now visible in the community gallery",
      });
    } catch (error) {
      console.error('Error sharing to community:', error);
      toast({
        title: "Failed to share",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharingToCommunity(false);
    }
  };

  // Delete with confirmation
  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      onDelete(image.id);
      onClose();
    }
  };

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
    referenceImage: image.referenceImage,
    referenceImages: image.referenceImages,
    timestamp: image.timestamp || '2 weeks ago',
    resolution: image.resolution || '1344x768 px',
    ...image
  };
  
  // Get all reference images to display (prefer array, fallback to single)
  const displayReferenceImages = imageData.referenceImages && imageData.referenceImages.length > 0 
    ? imageData.referenceImages 
    : (imageData.referenceImage ? [imageData.referenceImage] : []);

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
            
            {/* Left Side - Image/Video/Document Content */}
            <div className="flex-1 relative bg-black flex items-center justify-center">

            {/* Content Container */}
            <div 
              className="relative w-full h-full group p-4 overflow-hidden flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{ 
                cursor: image.type !== 'document' && zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              {image.type === 'document' ? (
                <div className="w-full h-full overflow-y-auto bg-white rounded-lg p-6">
                  <div 
                    className="prose prose-sm md:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
                    dangerouslySetInnerHTML={{ 
                      __html: (() => {
                        let content = image.content || 'No content available';
                        
                        // Parse markdown tables
                        const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
                        content = content.replace(tableRegex, (match, headerRow, bodyRows) => {
                          const headers = headerRow.split('|').map((h: string) => h.trim()).filter((h: string) => h);
                          const rows = bodyRows.trim().split('\n').map((row: string) => 
                            row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell !== '')
                          );
                          
                          let tableHtml = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">';
                          tableHtml += '<thead class="bg-gray-100"><tr>';
                          headers.forEach((header: string) => {
                            tableHtml += `<th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">${header}</th>`;
                          });
                          tableHtml += '</tr></thead><tbody>';
                          rows.forEach((row: string[], index: number) => {
                            const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                            tableHtml += `<tr class="${bgClass}">`;
                            row.forEach((cell: string) => {
                              tableHtml += `<td class="border border-gray-300 px-4 py-2 text-gray-700 whitespace-nowrap">${cell}</td>`;
                            });
                            tableHtml += '</tr>';
                          });
                          tableHtml += '</tbody></table></div>';
                          return tableHtml;
                        });
                        
                        // Parse other markdown elements
                        return content
                          .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-2">$1</h3>')
                          .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
                          .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
                          .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
                          .replace(/\n\n/g, '</p><p class="my-4 text-gray-700">')
                          .replace(/\n/g, '<br/>')
                          .replace(/^---$/gim, '<hr class="my-6 border-gray-200"/>');
                      })()
                    }}
                  />
                </div>
              ) : image.type === 'video' && imageData.url?.includes('.mp4') ? (
                <video
                  src={imageData.url}
                  className="rounded-lg max-w-full max-h-full object-contain select-none"
                  style={{ 
                    transform: `scale(${zoom / 100}) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                  controls
                  autoPlay
                  loop
                />
              ) : (
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
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-96 bg-gray-900 flex flex-col overflow-hidden">
          
            {/* Header Info - Different for community vs creations */}
            <div className="p-4 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-end">
                <TooltipProvider>
                  <div className="flex items-center justify-between w-full gap-3">
                    {/* Like button - shown for all */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={onToggleLike}
                          className={`transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                        >
                          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isLiked ? 'Unlike' : 'Like'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Buttons only for creations view */}
                    {!isCommunityView && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleAddToCommunity}
                              disabled={isSharingToCommunity || isSharedToCommunity}
                              className={`transition-colors ${
                                isSharedToCommunity 
                                  ? 'text-green-500' 
                                  : isSharingToCommunity 
                                    ? 'text-blue-500 animate-pulse' 
                                    : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              {isSharingToCommunity ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : isSharedToCommunity ? (
                                <Check size={20} />
                              ) : (
                                <Globe size={20} />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isSharedToCommunity ? 'Shared to Community' : isSharingToCommunity ? 'Sharing...' : 'Add To Community'}</p>
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
                            <p>{isSaved ? 'Unsave' : 'Save'}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handleDownload}
                              disabled={isDownloading}
                              className={`transition-colors ${isDownloading ? 'text-blue-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                            >
                              <Download size={20} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isDownloading ? 'Downloading...' : 'Download'}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={handlePrint}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
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
                            <button 
                              onClick={handleDelete}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
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
                      </>
                    )}
                  </div>
                </TooltipProvider>
              </div>
            </div>

            {/* Scrollable Middle Section */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Community View: Show Comments */}
              {isCommunityView ? (
                <div className="p-4 h-full flex flex-col">
                  <CommunityComments postId={String(image.id)} />
                </div>
              ) : (
                <>
                  {/* Scenes Section - For Story Mode Videos */}
                  {imageData.scenes && imageData.scenes.length > 0 ? (
                    <div className="p-4 border-b border-gray-800">
                      <h3 className="text-white font-semibold text-sm mb-3">Scenes ({imageData.scenes.length})</h3>
                      <div className="space-y-3">
                        {imageData.scenes.map((scene, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-medium text-blue-400">Scene {index + 1}</span>
                              <span className="text-xs text-gray-400">{scene.duration}s</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{scene.scene}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
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
                  )}

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

                  {/* Reference Images */}
                  {displayReferenceImages.length > 0 && (
                    <div className="p-4 border-b border-gray-800">
                      <h3 className="text-white font-semibold mb-2 text-sm">
                        Reference{displayReferenceImages.length > 1 ? `s (${displayReferenceImages.length})` : ''}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {displayReferenceImages.map((refImg, index) => (
                          <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={refImg}
                              alt={`Reference ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

          </div>

            {/* Bottom Fixed Section - Only for creations view */}
            {!isCommunityView && (
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
                  <button 
                    onClick={() => {
                      window.location.href = `/create?editImage=${encodeURIComponent(imageData.url)}`;
                    }}
                    className="flex-1 px-2 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors text-xs"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => {
                      window.location.href = `/edit`;
                    }}
                    className="flex-1 px-2 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors text-xs"
                  >
                    <Maximize size={14} />
                    <span>Upscale</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (onAnimate) {
                        onAnimate(imageData.url);
                        onClose();
                      } else {
                        // Navigate to /create with animate state if no onAnimate handler
                        window.location.href = `/create?animateImage=${encodeURIComponent(imageData.url)}`;
                      }
                    }}
                    className="flex-1 px-2 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors text-xs"
                  >
                    <Play size={14} />
                    <span>Animate</span>
                  </button>
                </div>
              </div>
            )}
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
