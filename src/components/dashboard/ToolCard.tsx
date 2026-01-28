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
      className={`${bgColor} rounded-xl p-3 md:p-4 hover:shadow-lg transition cursor-pointer relative group`}
      onClick={onClick}
    >
      <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-brand-yellow text-primary-foreground text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded font-medium">
        AI
      </div>
      {isNew && (
        <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-emerald-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded font-medium">
          NEW
        </div>
      )}
      <div className="aspect-square flex items-center justify-center text-2xl md:text-4xl mb-2 md:mb-3">
        {icon ? (
          <img src={icon} alt={name} className="w-10 h-10 md:w-16 md:h-16 object-contain" />
        ) : (
          emoji
        )}
      </div>
      <h3 className="text-xs md:text-sm font-semibold text-foreground truncate">{name}</h3>
    </div>
  );
};

export default ToolCard;
