import referenceLinkIcon from '@/assets/icons/reference-link-chain.png';

interface ReferenceLinkIconProps {
  size?: number;
  className?: string;
}

const ReferenceLinkIcon = ({ size = 18, className = '' }: ReferenceLinkIconProps) => {
  return (
    <img
      src={referenceLinkIcon}
      alt="Reference link"
      width={size}
      height={size}
      className={className}
      draggable={false}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};

export default ReferenceLinkIcon;

