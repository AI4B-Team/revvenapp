import { Clock, Wrench, Users } from 'lucide-react';

const ActionButtons = () => {
  return (
    <div className="max-w-5xl mx-auto mb-6 lg:mb-8 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition whitespace-nowrap shrink-0">
        <Wrench size={18} />
        <span className="font-medium text-sm">Tools</span>
      </button>
      <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition whitespace-nowrap shrink-0">
        <Clock size={18} />
        <span className="font-medium text-sm">Creations</span>
      </button>
      <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition whitespace-nowrap shrink-0">
        <Users size={18} />
        <span className="font-medium text-sm">Community</span>
      </button>
    </div>
  );
};

export default ActionButtons;
