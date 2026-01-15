import revvenLogo from '@/assets/revven-logo.png';

interface RevvenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-14',
};

const RevvenLogo = ({ size = 'md', className = '' }: RevvenLogoProps) => {
  return (
    <img 
      src={revvenLogo} 
      alt="REVVEN" 
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
};

export default RevvenLogo;
