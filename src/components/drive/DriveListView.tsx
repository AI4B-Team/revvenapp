import { useState } from 'react';
import { Folder, FileText, Image, Video, Music, File, Star, Check, X, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { DriveFolder, DriveFile } from '@/hooks/useDrive';
import DriveContextMenu from './DriveContextMenu';

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  return FileText;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

interface DriveListViewProps {
  folders: DriveFolder[];
  files: DriveFile[];
  onOpenFolder: (id: string, name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteFile: (file: DriveFile) => void;
  onToggleFavoriteFolder: (id: string, current: boolean) => void;
  onToggleFavoriteFile: (id: string, current: boolean) => void;
  onSetFolderColor: (id: string, color: string) => void;
  onSetFileColor: (id: string, color: string) => void;
  onDownloadFile: (file: DriveFile) => void;
  onNewFolder: () => void;
  onUpload: () => void;
}

const DriveListView = ({
  folders, files,
  onOpenFolder, onRenameFolder, onRenameFile, onDeleteFolder, onDeleteFile,
  onToggleFavoriteFolder, onToggleFavoriteFile, onSetFolderColor, onSetFileColor,
  onDownloadFile, onNewFolder, onUpload,
}: DriveListViewProps) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'folder' | 'file' | 'background'; item?: DriveFolder | DriveFile } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renamingType, setRenamingType] = useState<'folder' | 'file'>('folder');

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'file' | 'background', item?: DriveFolder | DriveFile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, item });
  };

  const startRename = (id: string, name: string, type: 'folder' | 'file') => {
    setRenamingId(id);
    setRenameValue(name);
    setRenamingType(type);
  };

  const confirmRename = () => {
    if (renamingId && renameValue.trim()) {
      if (renamingType === 'folder') onRenameFolder(renamingId, renameValue.trim());
      else onRenameFile(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const colorDot = (color: string | null) => {
    if (!color) return null;
    const colors: Record<string, string> = {
      red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500',
      green: 'bg-green-500', blue: 'bg-blue-500', purple: 'bg-purple-500', gray: 'bg-gray-400',
    };
    return colors[color] ? <span className={`w-2 h-2 rounded-full ${colors[color]} shrink-0`} /> : null;
  };

  return (
    <div className="min-h-[400px]" onContextMenu={(e) => handleContextMenu(e, 'background')}>
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_120px_80px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
        <span>Name</span>
        <span>Modified</span>
        <span>Created</span>
        <span>Size</span>
      </div>

      {/* Folders */}
      {folders.map(folder => (
        <div
          key={folder.id}
          className="grid grid-cols-[1fr_120px_120px_80px] gap-4 px-4 py-2.5 items-center hover:bg-muted/40 cursor-pointer transition-colors border-b border-border/20"
          onDoubleClick={() => onOpenFolder(folder.id, folder.name)}
          onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
        >
          <div className="flex items-center gap-3 min-w-0">
            {colorDot(folder.color)}
            <Folder className="w-4 h-4 text-blue-500 shrink-0" />
            {renamingId === folder.id ? (
              <div className="flex items-center gap-1 flex-1">
                <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingId(null); }} className="h-6 text-xs px-1" autoFocus />
                <button onClick={confirmRename}><Check className="w-3 h-3 text-green-500" /></button>
                <button onClick={() => setRenamingId(null)}><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <span className="text-sm truncate">{folder.name}</span>
            )}
            {folder.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(folder.updated_at)}</span>
          <span className="text-xs text-muted-foreground">{formatDate(folder.created_at)}</span>
          <span className="text-xs text-muted-foreground">—</span>
        </div>
      ))}

      {/* Files */}
      {files.map(file => {
        const FileIcon = getFileIcon(file.mime_type);
        return (
          <div
            key={file.id}
            className="grid grid-cols-[1fr_120px_120px_80px] gap-4 px-4 py-2.5 items-center hover:bg-muted/40 cursor-pointer transition-colors border-b border-border/20"
            onContextMenu={(e) => handleContextMenu(e, 'file', file)}
            onDoubleClick={() => onDownloadFile(file)}
          >
            <div className="flex items-center gap-3 min-w-0">
              {colorDot(file.color)}
              <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              {renamingId === file.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingId(null); }} className="h-6 text-xs px-1" autoFocus />
                  <button onClick={confirmRename}><Check className="w-3 h-3 text-green-500" /></button>
                </div>
              ) : (
                <span className="text-sm truncate">{file.name}</span>
              )}
              {file.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(file.updated_at)}</span>
            <span className="text-xs text-muted-foreground">{formatDate(file.created_at)}</span>
            <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
          </div>
        );
      })}

      {folders.length === 0 && files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Folder className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">This folder is empty</p>
        </div>
      )}

      {contextMenu && (
        <DriveContextMenu
          x={contextMenu.x} y={contextMenu.y} type={contextMenu.type}
          isFavorite={contextMenu.item && 'is_favorite' in contextMenu.item ? contextMenu.item.is_favorite : false}
          onClose={() => setContextMenu(null)}
          onOpen={() => {
            if (contextMenu.type === 'folder' && contextMenu.item) onOpenFolder(contextMenu.item.id, (contextMenu.item as DriveFolder).name);
            if (contextMenu.type === 'file' && contextMenu.item) onDownloadFile(contextMenu.item as DriveFile);
          }}
          onRename={() => { if (contextMenu.item) startRename(contextMenu.item.id, (contextMenu.item as any).name, contextMenu.type as any); }}
          onDelete={() => {
            if (contextMenu.type === 'folder' && contextMenu.item) onDeleteFolder(contextMenu.item.id);
            if (contextMenu.type === 'file' && contextMenu.item) onDeleteFile(contextMenu.item as DriveFile);
          }}
          onToggleFavorite={() => {
            if (contextMenu.type === 'folder' && contextMenu.item) onToggleFavoriteFolder(contextMenu.item.id, (contextMenu.item as DriveFolder).is_favorite);
            if (contextMenu.type === 'file' && contextMenu.item) onToggleFavoriteFile(contextMenu.item.id, (contextMenu.item as DriveFile).is_favorite);
          }}
          onDownload={() => { if (contextMenu.type === 'file' && contextMenu.item) onDownloadFile(contextMenu.item as DriveFile); }}
          onSetColor={(color) => {
            if (contextMenu.type === 'folder' && contextMenu.item) onSetFolderColor(contextMenu.item.id, color);
            if (contextMenu.type === 'file' && contextMenu.item) onSetFileColor(contextMenu.item.id, color);
          }}
          onNewFolder={onNewFolder} onUpload={onUpload}
        />
      )}
    </div>
  );
};

export default DriveListView;
