import { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useDrive } from '@/hooks/useDrive';
import DriveToolbar from '@/components/drive/DriveToolbar';
import DriveBreadcrumbs from '@/components/drive/DriveBreadcrumbs';
import DriveGridView from '@/components/drive/DriveGridView';
import DriveListView from '@/components/drive/DriveListView';
import DriveStorageBar from '@/components/drive/DriveStorageBar';
import { Loader2, HardDrive } from 'lucide-react';

const Drive = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drive = useDrive();

  const totalUsed = useMemo(() => drive.files.reduce((sum, f) => sum + (f.file_size || 0), 0), [drive.files]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      drive.uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Drag & drop
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

  const sharedProps = {
    folders: drive.folders,
    files: drive.files,
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
          <div className="px-8 py-8 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Drive</h1>
                <p className="text-sm text-muted-foreground">Your paperless cloud storage</p>
              </div>
            </div>

            {/* Storage Bar */}
            <div className="mb-6 mt-4">
              <DriveStorageBar usedBytes={totalUsed} totalBytes={5 * 1024 * 1024 * 1024} />
            </div>

            {/* Breadcrumbs */}
            <DriveBreadcrumbs breadcrumbs={drive.breadcrumbs} onNavigate={drive.navigateToFolder} />

            {/* Toolbar */}
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
            />

            {/* Drag overlay */}
            {isDragging && (
              <div className="fixed inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary rounded-xl flex items-center justify-center pointer-events-none">
                <div className="bg-background rounded-2xl shadow-xl p-8 text-center">
                  <HardDrive className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="text-lg font-semibold">Drop files to upload</p>
                  <p className="text-sm text-muted-foreground">Files will be added to current folder</p>
                </div>
              </div>
            )}

            {/* Loading */}
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

            {/* Content */}
            {!drive.loading && (
              <>
                {drive.viewMode === 'grid' || drive.viewMode === 'columns' ? (
                  <DriveGridView {...sharedProps} />
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
