const RevvenLogo = () => {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(160, 84%, 39%)" />
          <stop offset="100%" stopColor="hsl(160, 84%, 32%)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
      <path 
        d="M12 14L20 10L28 14V20L20 30L12 20V14Z" 
        fill="white" 
        fillOpacity="0.9"
      />
      <path 
        d="M20 10V30M12 14L28 14M12 20L28 20" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeOpacity="0.5"
      />
    </svg>
  );
};

export default RevvenLogo;
