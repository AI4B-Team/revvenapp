import { History, Wrench, Users, ChevronDown } from 'lucide-react';

const ActionButtons = () => {
  return (
    <div className="max-w-4xl mx-auto mb-8 flex items-center gap-4">
      <button className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg transition">
        <History size={18} />
        <span className="text-sm">History</span>
        <ChevronDown size={16} />
      </button>
      <button className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg transition">
        <Wrench size={18} />
        <span className="text-sm">Tools</span>
        <ChevronDown size={16} />
      </button>
      <button className="flex items-center gap-2 px-4 py-2 hover:bg-secondary rounded-lg transition">
        <Users size={18} />
        <span className="text-sm">Community</span>
      </button>
    </div>
  );
};

export default ActionButtons;
