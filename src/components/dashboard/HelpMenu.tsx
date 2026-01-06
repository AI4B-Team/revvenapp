import { useState } from 'react';
import { 
  HelpCircle, BookOpen, Map, Video, MessageSquare, ExternalLink
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HelpMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const helpOptions = [
    {
      id: 'help',
      icon: <BookOpen size={20} />,
      title: 'Help',
      description: 'Get answers to common questions and learn how to use Revven',
      showArrow: true,
      action: () => {
        console.log('Opening help center');
        // window.location.href = '/help';
      }
    },
    {
      id: 'tour',
      icon: <Map size={20} />,
      title: 'Tour',
      description: 'Take a quick tour to get started with all features',
      showArrow: false,
      action: () => {
        console.log('Starting product tour');
        // Start your product tour here
      }
    },
    {
      id: 'tutorials',
      icon: <Video size={20} />,
      title: 'Tutorials',
      description: 'Watch step-by-step video tutorials and guides',
      showArrow: true,
      action: () => {
        console.log('Opening tutorials');
        // window.open('https://youtube.com/@revven', '_blank');
      }
    },
    {
      id: 'feedback',
      icon: <MessageSquare size={20} />,
      title: 'Feedback',
      description: 'Share your thoughts and help us improve Revven',
      showArrow: true,
      action: () => {
        console.log('Opening feedback form');
        // window.location.href = '/feedback';
      }
    }
  ];

  const handleItemClick = (item: typeof helpOptions[0]) => {
    item.action();
    setIsOpen(false);
  };

  return (
    <div className="relative h-10 flex items-center justify-center">
      {/* Help Button */}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Help menu"
            >
              <HelpCircle size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Help</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop - Click outside to close */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-background rounded-2xl shadow-2xl z-50 border border-border overflow-hidden">
            {helpOptions.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full px-5 py-4 flex items-start gap-4 hover:bg-muted/50 transition-colors text-left group ${
                  index !== helpOptions.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                {/* Icon */}
                <div className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">
                  {item.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 text-base">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* External Link Arrow */}
                {item.showArrow && (
                  <div className="shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1">
                    <ExternalLink size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HelpMenu;
