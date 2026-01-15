interface RevvenLogoProps {
  size?: number;
  className?: string;
}

const RevvenLogo = ({ size = 32, className = '' }: RevvenLogoProps) => {
  const scale = size / 40;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(160, 81%, 40%)" />
          <stop offset="100%" stopColor="hsl(160, 81%, 32%)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
      <path 
        d="M12 14L20 10L28 14V20L20 30L12 20V14Z" 
        fill="white" 
        fillOpacity="0.95"
      />
      <path 
        d="M20 10V30M12 14L28 14M12 20L28 20" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeOpacity="0.4"
      />
    </svg>
  );
};

export default RevvenLogo;
