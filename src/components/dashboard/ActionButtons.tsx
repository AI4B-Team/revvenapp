import { Clock, Wrench, Users } from 'lucide-react';

const ActionButtons = () => {
  return (
    <div className="max-w-4xl mx-auto mb-8 flex items-center gap-6">
      <button className="flex items-center gap-2 text-foreground hover:text-primary transition">
        <Wrench size={20} />
        <span className="font-medium">Tools</span>
      </button>
      <button className="flex items-center gap-2 text-foreground hover:text-primary transition">
        <Clock size={20} />
        <span className="font-medium">Creations</span>
      </button>
      <button className="flex items-center gap-2 text-foreground hover:text-primary transition">
        <Users size={20} />
        <span className="font-medium">Community</span>
      </button>
    </div>
  );
};

export default ActionButtons;
