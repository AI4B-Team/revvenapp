import { Clock, Wrench, Users } from 'lucide-react';

const ActionButtons = () => {
  return (
    <div className="max-w-6xl mx-auto mb-8 flex items-center gap-3">
      <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition">
        <Wrench size={18} />
        <span className="font-medium text-sm">Tools</span>
      </button>
      <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition">
        <Clock size={18} />
        <span className="font-medium text-sm">Creations</span>
      </button>
      <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition">
        <Users size={18} />
        <span className="font-medium text-sm">Community</span>
      </button>
    </div>
  );
};

export default ActionButtons;
