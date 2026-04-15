import { useState } from 'react';
import { X, Star, Clock, Upload, ChevronRight, ChevronDown, Folder, FolderOpen, ArrowLeft, HardDrive } from 'lucide-react';

interface DriveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth: number;
}

interface BreadcrumbItem {
  label: string;
  id: string;
}

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon?: React.ReactNode;
  modified?: string;
  size?: string;
  children?: FolderItem[];
}

const GoogleDriveLogo = () => (
  <svg width="20" height="20" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-20.4 35.3c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 13.75z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-10.1-17.5c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 23.8h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

const OneDriveLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.22 4.5c-1.83 0-3.47.87-4.52 2.21A5.5 5.5 0 0 0 3.5 12a5.5 5.5 0 0 0 .17 1.35A4 4 0 0 0 4 20h15a5 5 0 0 0 1.03-9.89A5.5 5.5 0 0 0 14.22 4.5z" fill="#0078D4"/>
    <path d="M9.7 6.71A5.49 5.49 0 0 0 3.67 13.35 4 4 0 0 0 4 20h3.5l6.5-9.5z" fill="#0364B8" opacity="0.8"/>
  </svg>
);

const BoxLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#0061D5"/>
    <path d="M12 2L2 7l10 5 10-5L12 2z" fill="#0061D5"/>
    <text x="7" y="17" fontSize="10" fill="white" fontWeight="bold">B</text>
  </svg>
);

const DropboxLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.004 1.5L0.5 5.652l4.496 3.5L12 5.348 7.004 1.5z" fill="#0061FF"/>
    <path d="M0.5 12.652l6.504 4.152L12 13.152l-7.004-4.0L0.5 12.652z" fill="#0061FF"/>
    <path d="M12 13.152l5.496 3.652L24 12.652l-4.996-3.5L12 13.152z" fill="#0061FF"/>
    <path d="M24 5.652L17.496 1.5L12 5.348l7.004 3.804L24 5.652z" fill="#0061FF"/>
    <path d="M12.02 14.348l-5.016 3.5-1.504-.98v1.1l6.52 3.9 6.52-3.9v-1.1l-1.504.98-5.016-3.5z" fill="#0061FF"/>
  </svg>
);

// Mock data for demo
const mockRecents: FolderItem[] = [
  { id: 'r1', name: 'Project Brief.pdf', type: 'file', modified: '2 hours ago', size: '2.4 MB' },
  { id: 'r2', name: 'Brand Assets', type: 'folder', modified: 'Yesterday' },
  { id: 'r3', name: 'Campaign Video.mp4', type: 'file', modified: '3 days ago', size: '156 MB' },
  { id: 'r4', name: 'Design Mockups', type: 'folder', modified: 'Last week' },
];

const mockUploads: FolderItem[] = [
  { id: 'u1', name: 'Logo_Final.png', type: 'file', modified: 'Today', size: '540 KB' },
  { id: 'u2', name: 'Social Media Kit', type: 'folder', modified: 'Yesterday' },
  { id: 'u3', name: 'Product Photos', type: 'folder', modified: '2 days ago' },
];

const mockDriveFiles: Record<string, FolderItem[]> = {
  'google-drive': [
    { id: 'gd1', name: 'My Documents', type: 'folder', modified: 'Today' },
    { id: 'gd2', name: 'Shared with Me', type: 'folder', modified: 'Yesterday' },
    { id: 'gd3', name: 'Marketing Assets', type: 'folder', modified: '3 days ago' },
    { id: 'gd4', name: 'Presentation.pptx', type: 'file', modified: 'Today', size: '5.2 MB' },
  ],
  'onedrive': [
    { id: 'od1', name: 'Work Files', type: 'folder', modified: 'Today' },
    { id: 'od2', name: 'Personal', type: 'folder', modified: '2 days ago' },
    { id: 'od3', name: 'Report_Q4.xlsx', type: 'file', modified: 'Yesterday', size: '1.8 MB' },
  ],
  'box': [
    { id: 'bx1', name: 'Client Projects', type: 'folder', modified: 'Today' },
    { id: 'bx2', name: 'Templates', type: 'folder', modified: 'Last week' },
  ],
  'dropbox': [
    { id: 'db1', name: 'Photos', type: 'folder', modified: 'Today' },
    { id: 'db2', name: 'Videos', type: 'folder', modified: 'Yesterday' },
    { id: 'db3', name: 'Notes.txt', type: 'file', modified: '5 days ago', size: '12 KB' },
  ],
};

const DriveDrawer = ({ isOpen, onClose, sidebarWidth }: DriveDrawerProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    drives: true,
  });
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentFiles, setCurrentFiles] = useState<FolderItem[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const navigateTo = (id: string, label: string, files: FolderItem[]) => {
    setCurrentView(id);
    setBreadcrumbs(prev => [...prev, { label, id }]);
    setCurrentFiles(files);
  };

  const navigateBack = () => {
    if (breadcrumbs.length <= 1) {
      setCurrentView(null);
      setBreadcrumbs([]);
      setCurrentFiles([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(newBreadcrumbs);
      // In a real app, we'd reload the parent folder's files
    }
  };

  const handleFavoriteClick = (type: 'recents' | 'uploads') => {
    const files = type === 'recents' ? mockRecents : mockUploads;
    const label = type === 'recents' ? 'Recents' : 'Uploads';
    setCurrentView(type);
    setBreadcrumbs([{ label, id: type }]);
    setCurrentFiles(files);
  };

  const handleDriveClick = (driveId: string, label: string) => {
    const files = mockDriveFiles[driveId] || [];
    setCurrentView(driveId);
    setBreadcrumbs([{ label, id: driveId }]);
    setCurrentFiles(files);
  };

  const handleFolderClick = (folder: FolderItem) => {
    // Mock: just show empty folder or subfolder
    navigateTo(folder.id, folder.name, folder.children || []);
  };

  const renderFileList = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border sticky top-0 bg-sidebar z-10">
        <button onClick={navigateBack} className="p-1 hover:bg-sidebar-hover rounded transition">
          <ArrowLeft size={16} className="text-sidebar-muted" />
        </button>
        <div className="flex items-center gap-1 text-sm text-sidebar-muted overflow-x-auto">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-1 whitespace-nowrap">
              {i > 0 && <ChevronRight size={12} />}
              <span className={i === breadcrumbs.length - 1 ? 'text-sidebar-text font-medium' : ''}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* File list */}
      <div className="p-2">
        {currentFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-sidebar-muted">
            <FolderOpen size={40} className="mb-3 opacity-50" />
            <p className="text-sm">This folder is empty</p>
          </div>
        ) : (
          currentFiles.map(file => (
            <button
              key={file.id}
              onClick={() => file.type === 'folder' ? handleFolderClick(file) : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition text-left group"
            >
              {file.type === 'folder' ? (
                <Folder size={18} className="text-brand-yellow flex-shrink-0" />
              ) : (
                <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-5 border border-sidebar-muted rounded-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sidebar-text truncate">{file.name}</p>
                <p className="text-xs text-sidebar-muted">{file.modified}{file.size ? ` · ${file.size}` : ''}</p>
              </div>
              {file.type === 'folder' && (
                <ChevronRight size={14} className="text-sidebar-muted opacity-0 group-hover:opacity-100 transition" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  const renderMainMenu = () => (
    <div className="flex-1 overflow-y-auto p-2">
      {/* Favorites Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('favorites')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-text transition"
        >
          {expandedSections.favorites ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Star size={14} />
          <span>Favorites</span>
        </button>
        {expandedSections.favorites && (
          <div className="ml-2 space-y-0.5">
            <button
              onClick={() => handleFavoriteClick('recents')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition text-left"
            >
              <Clock size={16} className="text-sidebar-muted" />
              <span className="text-sm text-sidebar-text">Recents</span>
            </button>
            <button
              onClick={() => handleFavoriteClick('uploads')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition text-left"
            >
              <Upload size={16} className="text-sidebar-muted" />
              <span className="text-sm text-sidebar-text">Uploads</span>
            </button>
          </div>
        )}
      </div>

      {/* Drives Section */}
      <div>
        <button
          onClick={() => toggleSection('drives')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-text transition"
        >
          {expandedSections.drives ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <HardDrive size={14} />
          <span>Drives</span>
        </button>
        {expandedSections.drives && (
          <div className="ml-2 space-y-0.5">
            <button
              onClick={() => handleDriveClick('google-drive', 'Google Drive')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition text-left"
            >
              <GoogleDriveLogo />
              <span className="text-sm text-sidebar-text">Google Drive</span>
            </button>
            <button
              onClick={() => handleDriveClick('onedrive', 'OneDrive')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition text-left"
            >
              <OneDriveLogo />
              <span className="text-sm text-sidebar-text">OneDrive</span>
            </button>
            <button
              onClick={() => handleDriveClick('box', 'Box')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition text-left"
            >
              <BoxLogo />
              <span className="text-sm text-sidebar-text">Box</span>
            </button>
            <button
              onClick={() => handleDriveClick('dropbox', 'Dropbox')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-hover transition text-left"
            >
              <DropboxLogo />
              <span className="text-sm text-sidebar-text">Dropbox</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[60]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 bottom-0 z-[61] bg-sidebar border-r border-border shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          left: `${sidebarWidth}px`,
          width: '320px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-brand-green" />
            <h2 className="text-sm font-semibold text-sidebar-text">Drive</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-sidebar-hover rounded-lg transition"
          >
            <X size={16} className="text-sidebar-muted" />
          </button>
        </div>

        {/* Content */}
        {currentView ? renderFileList() : renderMainMenu()}
      </div>
    </>
  );
};

export default DriveDrawer;
