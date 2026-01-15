interface RevvenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showUnderline?: boolean;
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

const underlineHeights = {
  sm: 'h-0.5',
  md: 'h-1',
  lg: 'h-1.5',
  xl: 'h-2',
};

const RevvenLogo = ({ size = 'md', className = '', showUnderline = true }: RevvenLogoProps) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Main text with metallic gradient */}
      <span 
        className={`${sizeClasses[size]} font-bold tracking-wider`}
        style={{
          background: 'linear-gradient(180deg, #E8EDF5 0%, #8B9BB4 50%, #6B7A94 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        REVVEN
      </span>
      
      {/* Rainbow gradient underline */}
      {showUnderline && (
        <div 
          className={`w-full ${underlineHeights[size]} rounded-full mt-1`}
          style={{
            background: 'linear-gradient(90deg, #EC4899 0%, #8B5CF6 25%, #3B82F6 50%, #06B6D4 75%, #10B981 100%)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          }}
        />
      )}
    </div>
  );
};

export default RevvenLogo;
