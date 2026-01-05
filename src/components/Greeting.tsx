import { Sparkles } from 'lucide-react';

const Greeting = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <span className="text-2xl font-semibold text-foreground">
          Hi there!
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center">
        What Would You Like To Do Today?
      </h1>
    </div>
  );
};

export default Greeting;
