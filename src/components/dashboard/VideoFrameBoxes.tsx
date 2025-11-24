import { ArrowRightLeft, X, Upload } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoFrameBoxesProps {
  startingFrame: { preview: string; name: string } | null;
  endingFrame: { preview: string; name: string } | null;
  onStartingFrameChange: (frame: { preview: string; name: string } | null) => void;
  onEndingFrameChange: (frame: { preview: string; name: string } | null) => void;
  onSwap: () => void;
}

const VideoFrameBoxes = ({
  startingFrame,
  endingFrame,
  onStartingFrameChange,
  onEndingFrameChange,
  onSwap
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
      <div className="flex items-center gap-4">
        {/* Starting Frame */}
        <div>
          <div className="relative w-32 h-32 bg-white border-2 border-border rounded-lg flex items-center justify-center overflow-hidden">
          {startingFrame ? (
            <>
              <img 
                src={startingFrame.preview} 
                alt="Starting frame" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onStartingFrameChange(null)}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 rounded-full p-1.5 transition"
              >
                <X size={16} className="text-white" />
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
          <label className="text-sm text-muted-foreground mt-2 block text-left">Start Frame</label>
      </div>

      {/* Swap Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleSwap}
            className="mt-6 bg-muted hover:bg-muted/80 rounded-lg p-2 transition"
          >
            <ArrowRightLeft size={16} className="text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Swap</p>
        </TooltipContent>
      </Tooltip>

      {/* Ending Frame */}
      <div>
        <div className="relative w-32 h-32 bg-white border-2 border-border rounded-lg flex items-center justify-center overflow-hidden">
          {endingFrame ? (
            <>
              <img 
                src={endingFrame.preview} 
                alt="Ending frame" 
                className="w-full h-full object-cover opacity-70"
              />
              <button
                onClick={() => onEndingFrameChange(null)}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 rounded-full p-1.5 transition"
              >
                <X size={16} className="text-white" />
              </button>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition">
              <Upload size={24} />
              <span className="text-xs text-center">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleEndingFrameUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
          <label className="text-sm text-muted-foreground mt-2 block text-left">End Frame (Optional)</label>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default VideoFrameBoxes;
