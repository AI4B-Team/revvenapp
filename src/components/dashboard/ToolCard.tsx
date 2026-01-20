interface ToolCardProps {
  name: string;
  description: string;
  bgColor: string;
  emoji?: string;
  icon?: string;
  onClick?: () => void;
  isNew?: boolean;
}

const ToolCard = ({ name, description, bgColor, emoji, icon, onClick, isNew }: ToolCardProps) => {
  return (
    <div 
      className={`${bgColor} rounded-xl p-4 hover:shadow-lg transition cursor-pointer relative group`}
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 bg-brand-yellow text-primary-foreground text-xs px-2 py-0.5 rounded font-medium">
        AI
      </div>
      {isNew && (
        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded font-medium">
          NEW
        </div>
      )}
      <div className="aspect-square flex items-center justify-center text-4xl mb-3">
        {icon ? (
          <img src={icon} alt={name} className="w-16 h-16 object-contain" />
        ) : (
          emoji
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>
    </div>
  );
};

export default ToolCard;
