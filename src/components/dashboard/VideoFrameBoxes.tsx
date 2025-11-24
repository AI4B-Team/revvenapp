import { ArrowRightLeft, X, Upload } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoFrameBoxesProps {
  startingFrame: { preview: string; name: string } | null;
  endingFrame: { preview: string; name: string } | null;
  onStartingFrameChange: (frame: { preview: string; name: string } | null) => void;
  onEndingFrameChange: (frame: { preview: string; name: string } | null) => void;
  onSwap: () => void;
  onEndingFrameUploadClick?: () => void;
}

const VideoFrameBoxes = ({
  startingFrame,
  endingFrame,
  onStartingFrameChange,
  onEndingFrameChange,
  onSwap,
  onEndingFrameUploadClick
}: VideoFrameBoxesProps) => {
  const handleStartingFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onStartingFrameChange({
          preview: reader.result as string,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEndingFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onEndingFrameChange({
          preview: reader.result as string,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwap = () => {
    if (startingFrame && endingFrame) {
      // Both exist, swap them
      const temp = startingFrame;
      onStartingFrameChange(endingFrame);
      onEndingFrameChange(temp);
    } else if (startingFrame && !endingFrame) {
      // Only start frame exists, move to end frame
      onEndingFrameChange(startingFrame);
      onStartingFrameChange(null);
    } else if (!startingFrame && endingFrame) {
      // Only end frame exists, move to start frame
      onStartingFrameChange(endingFrame);
      onEndingFrameChange(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-start gap-4">
        {/* Starting Frame */}
        <div>
          <div className="relative w-32 h-32 bg-white border-2 border-border rounded-lg flex items-center justify-center overflow-visible group/frame">
          {startingFrame ? (
            <>
              <img 
                src={startingFrame.preview} 
                alt="Starting frame" 
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => onStartingFrameChange(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-[#E84855] text-white rounded-full items-center justify-center shadow-lg hover:bg-[#d43d49] transition-all z-10 opacity-0 group-hover/frame:opacity-100 hidden group-hover/frame:flex"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition">
              <Upload size={24} />
              <span className="text-xs text-center">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleStartingFrameUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
          <label className="text-sm text-muted-foreground mt-2 block text-center">Start Frame</label>
      </div>

      {/* Swap Button - Centered vertically */}
      <div className="flex items-center h-32">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSwap}
              className="bg-muted hover:bg-muted/80 rounded-lg p-2 transition"
            >
              <ArrowRightLeft size={16} className="text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Swap</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Ending Frame */}
      <div>
        <div className="relative w-32 h-32 bg-white border-2 border-border rounded-lg flex items-center justify-center overflow-visible group/frame">
          {endingFrame ? (
            <>
              <img 
                src={endingFrame.preview} 
                alt="Ending frame" 
                className="w-full h-full object-cover opacity-70 rounded-lg"
              />
              <button
                onClick={() => onEndingFrameChange(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-[#E84855] text-white rounded-full items-center justify-center shadow-lg hover:bg-[#d43d49] transition-all z-10 opacity-0 group-hover/frame:opacity-100 hidden group-hover/frame:flex"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                if (onEndingFrameUploadClick) {
                  onEndingFrameUploadClick();
                } else {
                  // Fallback to file input if callback not provided
                  document.getElementById('ending-frame-upload')?.click();
                }
              }}
              className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition w-full h-full"
            >
              <Upload size={24} />
              <span className="text-xs text-center">Upload</span>
            </button>
          )}
          <input
            id="ending-frame-upload"
            type="file"
            accept="image/*"
            onChange={handleEndingFrameUpload}
            className="hidden"
          />
        </div>
          <label className="text-sm text-muted-foreground mt-2 block text-center">End Frame (Optional)</label>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default VideoFrameBoxes;
