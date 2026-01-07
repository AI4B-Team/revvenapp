import { Link2 } from 'lucide-react';

interface ReferenceLinkIconProps {
  size?: number;
  className?: string;
}

const ReferenceLinkIcon = ({ size = 18, className = '' }: ReferenceLinkIconProps) => {
  return (
    <Link2 
      size={size} 
      className={className}
      strokeWidth={2.5}
    />
  );
};

export default ReferenceLinkIcon;
