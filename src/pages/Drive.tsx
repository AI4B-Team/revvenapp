import { useState, useRef, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useDrive } from '@/hooks/useDrive';
import DriveToolbar from '@/components/drive/DriveToolbar';
import DriveBreadcrumbs from '@/components/drive/DriveBreadcrumbs';
import DriveGridView from '@/components/drive/DriveGridView';
import DriveListView from '@/components/drive/DriveListView';
import DriveColumnsView from '@/components/drive/DriveColumnsView';
import DriveStorageBar from '@/components/drive/DriveStorageBar';
import { Loader2, HardDrive } from 'lucide-react';

const Drive = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drive = useDrive();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const totalUsed = useMemo(() => drive.files.reduce((sum, f) => sum + (f.file_size || 0), 0), [drive.files]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      drive.uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      drive.uploadFiles(e.dataTransfer.files);
    }
  };

  const matchesType = (mime: string | null | undefined) => {
    if (filterType === 'all') return true;
    if (!mime) return false;
    if (filterType === 'images') return mime.startsWith('image/');
    if (filterType === 'videos') return mime.startsWith('video/');
    if (filterType === 'audio') return mime.startsWith('audio/');
    if (filterType === 'documents') return !mime.startsWith('image/') && !mime.startsWith('video/') && !mime.startsWith('audio/');
    return true;
  };

  // Folders only show when no type filter active (folders have no mime)
  const visibleFolders = drive.folders
    .filter(f => !filterFavorites || f.is_favorite)
    .filter(() => filterType === 'all');
  const visibleFiles = drive.files
    .filter(f => !filterFavorites || f.is_favorite)
    .filter(f => matchesType(f.mime_type));

  const sharedProps = {
    folders: visibleFolders,
    files: visibleFiles,
    onOpenFolder: (id: string, name: string) => drive.navigateToFolder(id, name),
    onRenameFolder: drive.renameFolder,
    onRenameFile: drive.renameFile,
    onDeleteFolder: drive.deleteFolder,
    onDeleteFile: drive.deleteFile,
    onToggleFavoriteFolder: drive.toggleFavoriteFolder,
    onToggleFavoriteFile: drive.toggleFavoriteFile,
    onSetFolderColor: drive.setFolderColor,
    onSetFileColor: drive.setFileColor,
    onDownloadFile: drive.downloadFile,
    onNewFolder: () => drive.createFolder(),
    onUpload: handleUploadClick,
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileChange} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />

        <main
          className="flex-1 overflow-auto bg-background"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="px-8 py-8">
            <DriveToolbar
              viewMode={drive.viewMode}
              onViewModeChange={drive.setViewMode}
              sortField={drive.sortField}
              sortDirection={drive.sortDirection}
              onSortFieldChange={drive.setSortField}
              onSortDirectionChange={drive.setSortDirection}
              searchQuery={drive.searchQuery}
              onSearchChange={drive.setSearchQuery}
              onNewFolder={() => drive.createFolder()}
              onUpload={handleUploadClick}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              filterFavorites={filterFavorites}
              onFilterFavoritesChange={setFilterFavorites}
            />

            <div className="mb-6">
              <DriveStorageBar usedBytes={totalUsed} totalBytes={5 * 1024 * 1024 * 1024} />
            </div>

            <DriveBreadcrumbs breadcrumbs={drive.breadcrumbs} onNavigate={drive.navigateToFolder} />

            {isDragging && (
              <div className="fixed inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary rounded-xl flex items-center justify-center pointer-events-none">
                <div className="bg-background rounded-2xl shadow-xl p-8 text-center">
                  <HardDrive className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="text-lg font-semibold">Drop files to upload</p>
                  <p className="text-sm text-muted-foreground">Files will be added to current folder</p>
                </div>
              </div>
            )}

            {drive.loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : drive.uploading ? (
              <div className="flex items-center justify-center py-4 mb-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            ) : null}

            {!drive.loading && (
              <>
                {drive.viewMode === 'grid' ? (
                  <DriveGridView {...sharedProps} />
                ) : drive.viewMode === 'columns' ? (
                  <DriveColumnsView
                    rootFolders={visibleFolders}
                    rootFiles={visibleFiles}
                    fetchFolderContents={drive.fetchFolderContents}
                    onDownloadFile={drive.downloadFile}
                  />
                ) : (
                  <DriveListView {...sharedProps} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Drive;
