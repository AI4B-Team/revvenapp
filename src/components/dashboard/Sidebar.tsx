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

  return (
    <div className="w-64 bg-sidebar text-sidebar-text flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider">REVVEN</h1>
      </div>

      {/* Workspace Selector */}
      <div className="px-4 mb-6">
        <button className="w-full flex items-center gap-3 px-3 py-2 bg-sidebar-active rounded-lg hover:bg-sidebar-hover transition">
          <div className="w-8 h-8 bg-brand-green rounded flex items-center justify-center text-sm font-bold text-primary">
            D
          </div>
          <span className="flex-1 text-left text-sm">Dolmar Cross's workspace</span>
          <ChevronDown size={16} />
        </button>
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
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sidebar-muted hover:text-sidebar-text transition">
            <ChevronDown size={18} />
            <span className="text-sm">Assets</span>
          </button>
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
        </div>
      </nav>

      {/* Credits Section */}
      <div className="p-4 space-y-3">
        <div className="bg-brand-green/20 border-2 border-brand-green rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="text-brand-green">98000 / 98000 credits left</span>
            <HelpCircle size={14} className="text-brand-green" />
          </div>
          <div className="w-full bg-brand-green/30 rounded-full h-2 mb-3">
            <div className="bg-brand-green h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <button className="w-full bg-brand-green hover:opacity-90 text-primary font-semibold py-2 rounded-lg transition">
            Purchase Extra Credit
          </button>
        </div>

        {/* Bottom Icons */}
        <div className="flex items-center justify-between px-2">
          <button className="text-sidebar-muted hover:text-sidebar-text transition">
            <HelpCircle size={20} />
          </button>
          <button className="text-sidebar-muted hover:text-sidebar-text transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </button>
          <button className="text-sidebar-muted hover:text-sidebar-text transition relative">
            <Settings size={20} />
          </button>
          <button className="text-sidebar-muted hover:text-sidebar-text transition relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-blue rounded-full"></span>
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
