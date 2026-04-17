import { useEffect, useState } from 'react';
import { Folder, FileText, Image as ImageIcon, Video, Music, File, ChevronRight, Star, Download } from 'lucide-react';
import type { DriveFolder, DriveFile } from '@/hooks/useDrive';
import { Button } from '@/components/ui/button';

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  return FileText;
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

interface ColumnData {
  parentId: string | null;
  parentName: string;
  folders: DriveFolder[];
  files: DriveFile[];
  selectedId: string | null;
}

interface DriveColumnsViewProps {
  rootFolders: DriveFolder[];
  rootFiles: DriveFile[];
  fetchFolderContents: (parentId: string | null) => Promise<{ folders: DriveFolder[]; files: DriveFile[] }>;
  onDownloadFile: (file: DriveFile) => void;
}

const DriveColumnsView = ({ rootFolders, rootFiles, fetchFolderContents, onDownloadFile }: DriveColumnsViewProps) => {
  const [columns, setColumns] = useState<ColumnData[]>([
    { parentId: null, parentName: 'My Drive', folders: rootFolders, files: rootFiles, selectedId: null },
  ]);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  // Sync first column when root data changes
  useEffect(() => {
    setColumns((cols) => {
      const next = [...cols];
      next[0] = { ...next[0], folders: rootFolders, files: rootFiles };
      return next;
    });
  }, [rootFolders, rootFiles]);

  const handleSelectFolder = async (colIndex: number, folder: DriveFolder) => {
    setPreviewFile(null);
    const { folders, files } = await fetchFolderContents(folder.id);
    setColumns((cols) => {
      const trimmed = cols.slice(0, colIndex + 1);
      trimmed[colIndex] = { ...trimmed[colIndex], selectedId: folder.id };
      trimmed.push({ parentId: folder.id, parentName: folder.name, folders, files, selectedId: null });
      return trimmed;
    });
  };

  const handleSelectFile = (colIndex: number, file: DriveFile) => {
    setColumns((cols) => {
      const trimmed = cols.slice(0, colIndex + 1);
      trimmed[colIndex] = { ...trimmed[colIndex], selectedId: file.id };
      return trimmed;
    });
    setPreviewFile(file);
  };

  return (
    <div className="border border-border/40 rounded-xl bg-card overflow-hidden">
      <div className="flex overflow-x-auto" style={{ minHeight: '480px' }}>
        {columns.map((col, idx) => (
          <div
            key={`${col.parentId ?? 'root'}-${idx}`}
            className="flex-shrink-0 w-64 border-r border-border/40 overflow-y-auto"
            style={{ maxHeight: '600px' }}
          >
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 bg-muted/30 sticky top-0">
              {col.parentName}
            </div>
            <div className="py-1">
              {col.folders.map((folder) => {
                const isSelected = col.selectedId === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => handleSelectFolder(idx, folder)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-blue-500'}`} />
                    <span className="truncate flex-1 text-left">{folder.name}</span>
                    {folder.is_favorite && <Star className={`w-3 h-3 shrink-0 ${isSelected ? 'fill-current' : 'text-amber-400 fill-amber-400'}`} />}
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </button>
                );
              })}
              {col.files.map((file) => {
                const Icon = getFileIcon(file.mime_type);
                const isSelected = col.selectedId === file.id;
                return (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(idx, file)}
                    onDoubleClick={() => onDownloadFile(file)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <span className="truncate flex-1 text-left">{file.name}</span>
                    {file.is_favorite && <Star className={`w-3 h-3 shrink-0 ${isSelected ? 'fill-current' : 'text-amber-400 fill-amber-400'}`} />}
                  </button>
                );
              })}
              {col.folders.length === 0 && col.files.length === 0 && (
                <div className="px-3 py-6 text-xs text-center text-muted-foreground">Empty</div>
              )}
            </div>
          </div>
        ))}

        {/* Preview pane */}
        {previewFile && (
          <div className="flex-shrink-0 w-72 p-5 bg-muted/20 overflow-y-auto" style={{ maxHeight: '600px' }}>
            <div className="aspect-square w-full bg-card rounded-lg border border-border/40 flex items-center justify-center mb-4 overflow-hidden">
              {previewFile.mime_type?.startsWith('image/') && previewFile.file_url ? (
                <img src={previewFile.file_url} alt={previewFile.name} className="w-full h-full object-cover" />
              ) : (
                (() => {
                  const Icon = getFileIcon(previewFile.mime_type);
                  return <Icon className="w-16 h-16 text-muted-foreground/50" />;
                })()
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground break-words mb-3">{previewFile.name}</h3>
            <dl className="text-xs space-y-1.5 text-muted-foreground">
              <div className="flex justify-between"><dt>Kind</dt><dd className="text-foreground">{previewFile.mime_type || 'Unknown'}</dd></div>
              <div className="flex justify-between"><dt>Size</dt><dd className="text-foreground">{formatFileSize(previewFile.file_size)}</dd></div>
              <div className="flex justify-between"><dt>Created</dt><dd className="text-foreground">{formatDate(previewFile.created_at)}</dd></div>
              <div className="flex justify-between"><dt>Modified</dt><dd className="text-foreground">{formatDate(previewFile.updated_at)}</dd></div>
            </dl>
            <Button onClick={() => onDownloadFile(previewFile)} size="sm" className="w-full mt-4 gap-2">
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveColumnsView;
