interface ToolCardProps {
  name: string;
  description: string;
  bgColor: string;
  emoji: string;
  onClick?: () => void;
}

const ToolCard = ({ name, description, bgColor, emoji, onClick }: ToolCardProps) => {
  return (
    <div 
      className={`${bgColor} rounded-xl p-4 hover:shadow-lg transition cursor-pointer relative group`}
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 bg-brand-yellow text-primary-foreground text-xs px-2 py-0.5 rounded font-medium">
        AI
      </div>
      <div className="aspect-square flex items-center justify-center text-4xl mb-3">
        {emoji}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>
    </div>
  );
};

export default ToolCard;
