import { useEffect, useRef } from 'react';
import { Folder, Pencil, Trash2, Star, Download, Copy, Palette, FolderInput, Eye } from 'lucide-react';

const colorDots = [
  { color: 'red', bg: 'bg-red-500' },
  { color: 'orange', bg: 'bg-orange-500' },
  { color: 'amber', bg: 'bg-amber-500' },
  { color: 'green', bg: 'bg-green-500' },
  { color: 'blue', bg: 'bg-blue-500' },
  { color: 'purple', bg: 'bg-purple-500' },
  { color: 'gray', bg: 'bg-gray-400' },
];

interface DriveContextMenuProps {
  x: number;
  y: number;
  type: 'folder' | 'file' | 'background';
  isFavorite?: boolean;
  onClose: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onDownload?: () => void;
  onDuplicate?: () => void;
  onOpen?: () => void;
  onSetColor?: (color: string) => void;
  onNewFolder?: () => void;
  onUpload?: () => void;
}

const DriveContextMenu = ({
  x, y, type, isFavorite, onClose,
  onRename, onDelete, onToggleFavorite, onDownload, onDuplicate, onOpen, onSetColor,
  onNewFolder, onUpload,
}: DriveContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Adjust position to stay within viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 400),
    zIndex: 100,
  };

  const MenuItem = ({ icon: Icon, label, onClick, danger }: { icon: typeof Folder; label: string; onClick?: () => void; danger?: boolean }) => (
    <button
      onClick={() => { onClick?.(); onClose(); }}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-colors ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-foreground hover:bg-muted'}`}
    >
      <Icon className="w-4 h-4 opacity-60" />
      {label}
    </button>
  );

  return (
    <div ref={menuRef} style={style} className="w-52 bg-popover border border-border rounded-xl shadow-xl p-1.5 animate-in fade-in-0 zoom-in-95 duration-100">
      {type === 'background' ? (
        <>
          <MenuItem icon={Folder} label="New Folder" onClick={onNewFolder} />
          <MenuItem icon={FolderInput} label="Upload Files" onClick={onUpload} />
        </>
      ) : (
        <>
          <MenuItem icon={Eye} label="Open" onClick={onOpen} />
          <div className="my-1 border-t border-border/50" />
          <MenuItem icon={Pencil} label="Rename" onClick={onRename} />
          {type === 'file' && <MenuItem icon={Download} label="Download" onClick={onDownload} />}
          <MenuItem icon={Copy} label="Duplicate" onClick={onDuplicate} />
          <div className="my-1 border-t border-border/50" />
          <MenuItem icon={Star} label={isFavorite ? 'Remove Favorite' : 'Add Favorite'} onClick={onToggleFavorite} />
          <MenuItem icon={Trash2} label="Move to Trash" onClick={onDelete} danger />
          <div className="my-1 border-t border-border/50" />
          {/* Color Tags */}
          <div className="px-3 py-1.5 flex items-center gap-1.5">
            {colorDots.map(({ color, bg }) => (
              <button
                key={color}
                onClick={() => { onSetColor?.(color); onClose(); }}
                className={`w-5 h-5 rounded-full ${bg} hover:scale-110 transition-transform ring-1 ring-black/5`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DriveContextMenu;
