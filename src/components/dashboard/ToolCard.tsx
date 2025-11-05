interface ToolCardProps {
  name: string;
  description: string;
  bgColor: string;
  emoji: string;
}

const ToolCard = ({ name, description, bgColor, emoji }: ToolCardProps) => {
  return (
    <div className={`${bgColor} rounded-xl p-3 lg:p-4 hover:shadow-lg transition cursor-pointer relative group`}>
      <div className="absolute top-2 left-2 bg-brand-purple text-primary-foreground text-xs px-2 py-0.5 rounded font-medium">
        AI
      </div>
      <div className="aspect-square flex items-center justify-center text-3xl lg:text-4xl mb-2 lg:mb-3">
        {emoji}
      </div>
      <h3 className="text-xs lg:text-sm font-semibold text-foreground line-clamp-2 min-h-[2rem] lg:min-h-[2.5rem]">{name}</h3>
    </div>
  );
};

export default ToolCard;
