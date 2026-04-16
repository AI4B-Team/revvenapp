interface DriveStorageBarProps {
  usedBytes: number;
  totalBytes: number;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const DriveStorageBar = ({ usedBytes, totalBytes }: DriveStorageBarProps) => {
  const pct = totalBytes > 0 ? Math.min((usedBytes / totalBytes) * 100, 100) : 0;
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-primary';

  return (
    <div className="flex items-center gap-4 px-1">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatSize(usedBytes)} of {formatSize(totalBytes)} used
      </span>
    </div>
  );
};

export default DriveStorageBar;
