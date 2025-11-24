import { ArrowRightLeft, X, Upload } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className="flex items-center gap-4">
      {/* Starting Frame */}
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Start Frame</label>
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
      </div>

      {/* Swap Button */}
      <button
        onClick={onSwap}
        className="mt-6 bg-muted hover:bg-muted/80 rounded-lg p-2 transition"
      >
        <ArrowRightLeft size={16} className="text-muted-foreground" />
      </button>

      {/* Ending Frame */}
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">End Frame (Optional)</label>
        <div className="relative w-32 h-32 bg-white border-2 border-border rounded-lg flex items-center justify-center overflow-hidden">
          {endingFrame ? (
            <>
              <img 
                src={endingFrame.preview} 
                alt="Ending frame" 
                className="w-full h-full object-cover"
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
      </div>
    </div>
  );
};

export default VideoFrameBoxes;
