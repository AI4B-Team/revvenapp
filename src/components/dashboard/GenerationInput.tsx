import { Image, Sparkles, MoreHorizontal } from 'lucide-react';

const GenerationInput = () => {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-background border-2 border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image size={20} className="text-muted-foreground" />
          <Sparkles size={20} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Describe what you want to see"
            className="flex-1 text-foreground placeholder-muted-foreground outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="px-4 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition">
              3.0 Turbo x 4
            </button>
            <button className="px-4 py-1.5 hover:bg-secondary rounded-md text-sm transition">
              Style
            </button>
            <button className="px-4 py-1.5 hover:bg-secondary rounded-md text-sm transition">
              Character
            </button>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="aspect" className="rounded" />
              <label htmlFor="aspect" className="text-sm">1:1</label>
            </div>
            <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              1 image
            </button>
            <button className="text-muted-foreground hover:text-foreground transition">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium flex items-center gap-2 transition">
            <Sparkles size={18} />
            Generate
          </button>
        </div>
      </div>

      {/* Free Generation Tooltip */}
      <div className="relative">
        <div className="absolute right-0 mt-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-brand-purple rounded flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <span className="font-semibold text-sm">Generate free: 5 images, 1 video</span>
            <button className="ml-auto text-muted-foreground hover:text-primary-foreground">×</button>
          </div>
          <p className="text-xs text-primary-foreground/80">
            <span className="font-semibold">Start creating for free.</span><br />
            Generate your first AI images for free,<br />
            then bring them to life with video.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenerationInput;
