interface RevvenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeConfig = {
  sm: { fontSize: '1.25rem', letterSpacing: '0.15em', underlineHeight: '3px', gap: '2px' },
  md: { fontSize: '1.75rem', letterSpacing: '0.18em', underlineHeight: '4px', gap: '3px' },
  lg: { fontSize: '2.5rem', letterSpacing: '0.2em', underlineHeight: '5px', gap: '4px' },
  xl: { fontSize: '3.5rem', letterSpacing: '0.22em', underlineHeight: '6px', gap: '5px' },
};

const RevvenLogo = ({ size = 'md', className = '' }: RevvenLogoProps) => {
  const config = sizeConfig[size];
  
  return (
    <div className={`flex flex-col items-center ${className}`} style={{ gap: config.gap }}>
      {/* REVVEN text with metallic blue-silver gradient */}
      <span 
        style={{
          fontSize: config.fontSize,
          fontWeight: 700,
          letterSpacing: config.letterSpacing,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'linear-gradient(180deg, #B8C5D6 0%, #8FA4BC 25%, #7B92AD 50%, #6A829E 75%, #5A7290 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        REVVEN
      </span>
      
      {/* Multi-color gradient underline - pink, purple, blue, cyan */}
      <div 
        style={{
          width: '100%',
          height: config.underlineHeight,
          borderRadius: '2px',
          background: 'linear-gradient(90deg, #E91E8C 0%, #9C27B0 30%, #3F51B5 55%, #00BCD4 85%, #00BCD4 100%)',
        }}
      />
    </div>
  );
};

export default RevvenLogo;
