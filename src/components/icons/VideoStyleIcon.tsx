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
      {/* Film reel outer circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Center hole */}
      <circle cx="12" cy="12" r="3" />
      {/* Sprocket holes */}
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
      {/* Diagonal sprocket holes */}
      <circle cx="7.05" cy="7.05" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.95" cy="16.95" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.95" cy="7.05" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="7.05" cy="16.95" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
};

export default VideoStyleIcon;
