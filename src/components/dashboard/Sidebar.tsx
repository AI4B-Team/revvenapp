import { useState } from 'react';
import { 
  Search, Sparkles, Image, Video, Music, FileText, Code,
  ChevronDown, HelpCircle, Bell, Settings, MoreHorizontal
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const sidebarItems = [
    { icon: <FileText size={18} />, label: 'Dashboard', active: true },
    { icon: <Search size={18} />, label: 'Search', shortcut: '⌘F' },
  ];

  const navItems = [
    { icon: <Sparkles size={18} />, label: 'Content', color: 'text-brand-yellow' },
    { icon: <Image size={18} />, label: 'Image', color: 'text-brand-green' },
    { icon: <Video size={18} />, label: 'Video', color: 'text-brand-red' },
    { icon: <Music size={18} />, label: 'Sound', color: 'text-brand-blue' },
    { icon: <FileText size={18} />, label: 'Document', color: 'text-brand-green' },
    { icon: <Code size={18} />, label: 'Code', color: 'text-brand-purple' },
  ];

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);

  const workspaces = [
    { name: 'Dolmar Workspace', initial: 'D', bgColor: 'bg-brand-green' },
    { name: 'Brian Workspace', initial: 'B', bgColor: 'bg-brand-blue' },
    { name: 'Team Workspace', initial: 'T', bgColor: 'bg-brand-purple' },
  ];

  return (
    <div className="w-64 bg-sidebar text-sidebar-text flex flex-col">
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wider">REVVEN</h1>
      </div>

      {/* Workspace Selector */}
      <div className="px-4 mb-6 relative">
        <button 
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className="w-full flex items-center gap-3 px-3 py-2 bg-sidebar-active rounded-lg hover:bg-sidebar-hover transition"
        >
          <div className="w-8 h-8 bg-brand-green rounded flex items-center justify-center text-sm font-bold text-primary">
            D
          </div>
          <span className="flex-1 text-left text-sm">Dolmar Workspace</span>
          <ChevronDown size={16} className={`transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isWorkspaceOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-sidebar-hover rounded-lg shadow-lg z-50 py-2">
            {workspaces.map((workspace, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-active transition"
              >
                <div className={`w-8 h-8 ${workspace.bgColor} rounded flex items-center justify-center text-sm font-bold text-primary`}>
                  {workspace.initial}
                </div>
                <span className="flex-1 text-left text-sm">{workspace.name}</span>
              </button>
            ))}
            <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-active transition bg-sidebar-active/50 mt-2 border-t border-sidebar-text/10">
              <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center text-sm">
                +
              </div>
              <span className="flex-1 text-left text-sm">Create Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              item.active ? 'bg-sidebar-active' : 'hover:bg-sidebar-hover'
            }`}
          >
            <span className={item.active ? 'text-sidebar-text' : 'text-sidebar-muted'}>
              {item.icon}
            </span>
            <span className="flex-1 text-left text-sm">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-sidebar-muted">{item.shortcut}</span>
            )}
          </button>
        ))}

        <div className="pt-6 space-y-1">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onTabChange(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-sidebar-hover ${
                activeTab === item.label ? 'bg-sidebar-active' : ''
              }`}
            >
              <span className={item.color}>{item.icon}</span>
              <span className="flex-1 text-left text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Assets Section */}
        <div className="pt-6">
          <button 
            onClick={() => setIsAssetsOpen(!isAssetsOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sidebar-muted hover:text-sidebar-text transition"
          >
            <ChevronDown size={18} className={`transition-transform ${isAssetsOpen ? 'rotate-0' : '-rotate-90'}`} />
            <span className="text-sm">Assets</span>
          </button>
          {isAssetsOpen && (
            <div className="ml-6 mt-2 space-y-2">
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="w-2 h-2 bg-sidebar-muted rounded"></div>
                <span className="text-sm text-sidebar-muted">Content</span>
                <span className="ml-auto text-xs text-sidebar-muted">48</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="w-2 h-2 bg-brand-purple rounded"></div>
                <span className="text-sm text-sidebar-muted">Images</span>
                <span className="ml-auto text-xs text-sidebar-muted">16</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5">
                <div className="w-2 h-2 bg-brand-blue rounded"></div>
                <span className="text-sm text-sidebar-muted">Videos</span>
                <span className="ml-auto text-xs text-sidebar-muted">8</span>
              </div>
              <button className="flex items-center gap-3 px-3 py-1.5 text-sidebar-muted hover:text-sidebar-text">
                <span className="text-sm">+ New Folder</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Credits Display */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-green">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span className="text-brand-green font-semibold">88,000 Credits</span>
          <HelpCircle size={14} className="text-brand-green" />
        </div>
      </div>

      {/* Credits Section */}
      <div className="p-4 space-y-3 bg-sidebar">
        <div className="bg-sidebar border-2 border-brand-green rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-sidebar-text">Usage Credits</span>
            <HelpCircle size={14} className="text-sidebar-muted" />
          </div>
          <div className="text-xs text-sidebar-muted mb-2">10000 / 98000 Used</div>
          <div className="w-full bg-sidebar-hover rounded-full h-2 mb-3">
            <div className="bg-brand-green h-2 rounded-full" style={{ width: '10.2%' }}></div>
          </div>
          <div className="text-sm text-brand-green font-semibold mb-3">88000 Credits Remaining</div>
          <button className="w-full bg-brand-green hover:opacity-90 text-primary font-semibold py-2 rounded-lg transition">
            Purchase Extra Credit
          </button>
        </div>

        {/* Bottom Icons */}
        <div className="flex items-center justify-between px-2 bg-sidebar">
          <button className="text-sidebar-muted hover:text-sidebar-text transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </button>
          <button className="text-sidebar-muted hover:text-sidebar-text transition">
            <HelpCircle size={20} />
          </button>
          <button className="text-sidebar-muted hover:text-sidebar-text transition relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-blue rounded-full"></span>
          </button>
          <button className="text-sidebar-muted hover:text-sidebar-text transition relative">
            <Settings size={20} />
          </button>
          <button className="text-sidebar-muted hover:text-sidebar-text transition">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
