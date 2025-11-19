import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Film, Clock, Sparkles } from "lucide-react";

interface CountdownProps {
  totalSeconds: number;
  onComplete: () => void;
}

export const VideoGenerationCountdown = ({ totalSeconds, onComplete }: CountdownProps) => {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  
  useEffect(() => {
    if (secondsRemaining <= 0) {
      onComplete();
      return;
    }
    
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [secondsRemaining, onComplete]);
  
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progress = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 shadow-2xl border-2 border-primary/20">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Film className="w-24 h-24 text-primary animate-pulse" />
              <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-spin" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground">Generating Your Video</h2>
          <p className="text-muted-foreground text-lg">
            Our AI is creating your amazing content. This usually takes up to 10 minutes.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-6xl font-bold tabular-nums text-foreground">
            <Clock className="w-12 h-12 text-primary" />
            <span>{String(minutes).padStart(2, '0')}</span>
            <span className="animate-pulse">:</span>
            <span>{String(seconds).padStart(2, '0')}</span>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <p className="text-center text-sm text-muted-foreground">
            {progress < 30 && "Starting video generation..."}
            {progress >= 30 && progress < 60 && "Processing character animation..."}
            {progress >= 60 && progress < 85 && "Rendering video scenes..."}
            {progress >= 85 && "Finalizing your video..."}
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">💡 Did you know?</p>
          <p className="text-sm text-muted-foreground">
            Your video will be automatically saved to your history once it's ready. 
            You can check back anytime to view or download it.
          </p>
        </div>
      </Card>
    </div>
  );
};
