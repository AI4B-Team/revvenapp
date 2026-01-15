interface RevvenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

const underlineHeights = {
  sm: 'h-0.5',
  md: 'h-1',
  lg: 'h-1.5',
  xl: 'h-2',
};

const RevvenLogo = ({ size = 'md', className = '' }: RevvenLogoProps) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* REVVEN text with metallic silver gradient */}
      <span 
        className={`${sizeClasses[size]} font-bold tracking-[0.2em]`}
        style={{
          background: 'linear-gradient(180deg, #D4D8E0 0%, #A8B0C0 30%, #8892A8 50%, #6B7590 70%, #505870 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        REVVEN
      </span>
      
      {/* Rainbow gradient underline */}
      <div 
        className={`w-full ${underlineHeights[size]} rounded-full mt-0.5`}
        style={{
          background: 'linear-gradient(90deg, #EC4899 0%, #A855F7 20%, #6366F1 40%, #3B82F6 60%, #06B6D4 80%, #10B981 100%)',
        }}
      />
    </div>
  );
};

export default RevvenLogo;
