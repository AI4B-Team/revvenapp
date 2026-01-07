interface VideoStyleIconProps {
  size?: number;
  className?: string;
}

const VideoStyleIcon = ({ size = 18, className = '' }: VideoStyleIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Film strip */}
      <rect x="2" y="2" width="20" height="20" rx="2" />
      {/* Sprocket holes left */}
      <rect x="4" y="4" width="2" height="3" fill="currentColor" stroke="none" />
      <rect x="4" y="10.5" width="2" height="3" fill="currentColor" stroke="none" />
      <rect x="4" y="17" width="2" height="3" fill="currentColor" stroke="none" />
      {/* Sprocket holes right */}
      <rect x="18" y="4" width="2" height="3" fill="currentColor" stroke="none" />
      <rect x="18" y="10.5" width="2" height="3" fill="currentColor" stroke="none" />
      <rect x="18" y="17" width="2" height="3" fill="currentColor" stroke="none" />
      {/* Center play triangle */}
      <polygon points="10,8 10,16 16,12" fill="currentColor" stroke="none" />
    </svg>
  );
};

export default VideoStyleIcon;
