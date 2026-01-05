import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import HelpDropdown from './HelpDropdown';
import SearchModal from './SearchModal';
import { useTabs } from '@/contexts/TabsContext';
import { 
  Zap, 
  UserPlus, 
  CreditCard, 
  Settings, 
  Mail, 
  Puzzle, 
  Languages, 
  Sun, 
  Power, 
  ChevronRight, 
  PenLine,
  Inbox,
  Calendar,
  Users,
  DollarSign,
  Heart,
  Plus,
  BarChart3,
  Receipt,
  FileText,
  ClipboardList,
  Briefcase,
  Megaphone,
  Globe,
  X,
  Search,
  Gift,
  Columns,
  Rows,
  LayoutGrid,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const allApps = [
  { name: 'Create', icon: PenLine, color: 'bg-emerald-500' },
  { name: 'Inbox', icon: Inbox, color: 'bg-blue-500' },
  { name: 'Calendar', icon: Calendar, color: 'bg-red-500' },
  { name: 'Leads', icon: Users, color: 'bg-purple-500' },
  { name: 'Sales', icon: DollarSign, color: 'bg-amber-500' },
  { name: 'Customers', icon: Heart, color: 'bg-pink-500' },
  { name: 'Analytics', icon: BarChart3, color: 'bg-cyan-500' },
  { name: 'Invoices', icon: Receipt, color: 'bg-orange-500' },
  { name: 'Reports', icon: FileText, color: 'bg-indigo-500' },
  { name: 'Contracts', icon: ClipboardList, color: 'bg-teal-500' },
  { name: 'Projects', icon: Briefcase, color: 'bg-violet-500' },
  { name: 'Marketing', icon: Megaphone, color: 'bg-rose-500' },
];

const trendingApps = [
  { name: 'Analytics', icon: BarChart3, color: 'bg-cyan-500' },
  { name: 'Invoices', icon: Receipt, color: 'bg-orange-500' },
  { name: 'Reports', icon: FileText, color: 'bg-indigo-500' },
  { name: 'Contracts', icon: ClipboardList, color: 'bg-teal-500' },
  { name: 'Projects', icon: Briefcase, color: 'bg-violet-500' },
  { name: 'Marketing', icon: Megaphone, color: 'bg-rose-500' },
];

interface TopBarProps {
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
}

const TopBar = ({ activeTab: externalActiveTab, onTabChange }: TopBarProps) => {
  const [appsDropdownOpen, setAppsDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingOut, setIsDraggingOut] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  
  const navigate = useNavigate();
  const { tabs, activeTabId, addTab, removeTab, setActiveTab, reorderTabs, detachTab, floatingWindows, tileWindows } = useTabs();

  const handleTabSelect = (tabId: string, tabName: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabName);
    }
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const handleSelectApp = (app: typeof allApps[0]) => {
    const existingTab = tabs.find(tab => tab.name === app.name);
    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      addTab(app.name);
    }
    setAppsDropdownOpen(false);
    if (onTabChange) {
      onTabChange(app.name);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabs[index].id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const tabBarRect = tabBarRef.current?.getBoundingClientRect();
    if (tabBarRect && dragStartPos.current) {
      const isOutside = e.clientY > tabBarRect.bottom + 50;
      setIsDraggingOut(isOutside);
    }
    if (draggedIndex !== null && index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && !isDraggingOut) {
      reorderTabs(draggedIndex, toIndex);
    }
    resetDragState();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const tabBarRect = tabBarRef.current?.getBoundingClientRect();
    if (tabBarRect && draggedIndex !== null) {
      const isOutside = e.clientY > tabBarRect.bottom + 50;
      if (isOutside) {
        const tab = tabs[draggedIndex];
        detachTab(tab.id, { x: e.clientX - 400, y: e.clientY - 20 });
      }
    }
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDraggingOut(false);
    dragStartPos.current = null;
  };

  const defaultFavoriteApps = [
    { name: 'Create', icon: PenLine, color: 'bg-emerald-500' },
    { name: 'Inbox', icon: Inbox, color: 'bg-blue-500' },
    { name: 'Calendar', icon: Calendar, color: 'bg-red-500' },
    { name: 'Leads', icon: Users, color: 'bg-purple-500' },
    { name: 'Sales', icon: DollarSign, color: 'bg-amber-500' },
    { name: 'Customers', icon: Heart, color: 'bg-pink-500' },
  ];

  return (
    <TooltipProvider>
      <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
        {/* Tabs Section */}
        <div className="flex items-center gap-2 flex-1" ref={tabBarRef}>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {tabs.map((tab, index) => {
              const isActive = tab.id === activeTabId;
              const TabIcon = tab.icon;
              const isDragged = draggedIndex === index;
              const isDropTarget = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
              
              return (
                <TooltipProvider key={tab.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          handleTabSelect(tab.id, tab.name);
                          if (tab.name === 'New Tab') {
                            setAppsDropdownOpen(true);
                          }
                        }}
                        className={`group relative flex items-center gap-1.5 rounded-full border shrink-0
                          ${isActive 
                            ? `${tab.color} text-white border-transparent px-3 py-1.5` 
                            : 'border-border text-muted-foreground hover:border-primary px-1.5 py-1.5'
                          } 
                          ${isDragged ? 'opacity-50 cursor-grabbing' : 'transition-all cursor-grab'} 
                          ${isDropTarget ? 'ring-2 ring-primary' : ''}`}
                      >
                        <TabIcon size={16} />
                        {isActive && (
                          <>
                            <span className="text-sm font-medium">{tab.name}</span>
                            <X 
                              size={14} 
                              className="hover:bg-white/20 rounded-full p-0.5"
                              onClick={(e) => handleCloseTab(tab.id, e)}
                            />
                          </>
                        )}
                        {!isActive && (
                          <X 
                            size={14} 
                            className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full p-0.5"
                            onClick={(e) => handleCloseTab(tab.id, e)}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    {!isActive && (
                      <TooltipContent side="bottom">
                        {tab.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          
          {/* Add More Apps Button */}
          <Popover open={appsDropdownOpen} onOpenChange={setAppsDropdownOpen}>
            <PopoverTrigger asChild>
              <button className="w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Plus size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <p className="text-xs font-medium text-muted-foreground mb-3">Favorites</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {defaultFavoriteApps.map((app) => {
                  const AppIcon = app.icon;
                  return (
                    <button
                      key={app.name}
                      onClick={() => handleSelectApp({ name: app.name, icon: app.icon, color: app.color })}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl ${app.color} flex items-center justify-center`}>
                        <AppIcon size={20} className="text-white" />
                      </div>
                      <span className="text-xs font-medium">{app.name}</span>
                    </button>
                  );
                })}
              </div>
              
              <p className="text-xs font-medium text-muted-foreground mb-3">Trending</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {trendingApps.map((app) => (
                  <button
                    key={app.name}
                    onClick={() => handleSelectApp(app)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl ${app.color} flex items-center justify-center`}>
                      <app.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-medium">{app.name}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setAppsDropdownOpen(false);
                  navigate('/apps');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-primary hover:bg-muted font-medium transition-colors"
              >
                <Globe size={16} />
                Show More
              </button>
            </PopoverContent>
          </Popover>

          {/* Layout Button */}
          {floatingWindows.length >= 2 && (
            <Popover open={showLayoutMenu} onOpenChange={setShowLayoutMenu}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <LayoutGrid size={16} />
                  <span className="text-sm">Layout</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Layout Options</p>
                <button
                  onClick={() => { tileWindows('side-by-side'); setShowLayoutMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
                >
                  <Columns size={16} />
                  <span className="text-sm">Side by Side</span>
                </button>
                <button
                  onClick={() => { tileWindows('top-bottom'); setShowLayoutMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
                >
                  <Rows size={16} />
                  <span className="text-sm">Top & Bottom</span>
                </button>
                <button
                  onClick={() => { tileWindows('grid'); setShowLayoutMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
                >
                  <LayoutGrid size={16} />
                  <span className="text-sm">Grid</span>
                </button>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Drag hint */}
        {isDraggingOut && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
              Drop to create floating window
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Zap size={14} />
            Upgrade
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
            <Gift size={14} />
            Earn
          </button>
          <button 
            onClick={() => setSearchModalOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Search size={18} className="text-muted-foreground" />
          </button>
          <NotificationDropdown />
          <HelpDropdown />
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                D
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-0">
              {/* Profile Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">D</span>
                  </div>
                  <div>
                    <p className="font-medium">dolmarcross</p>
                    <p className="text-sm text-muted-foreground">dolmarcross@gmail.com</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-2 flex gap-2 border-b border-border">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                  <Zap size={14} />
                  Upgrade
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
                  <UserPlus size={14} />
                  Add Members
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} />
                    <span>Subscription</span>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Pro</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings size={16} className="mr-2" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Mail size={16} className="mr-2" />
                  Invites
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Puzzle size={16} className="mr-2" />
                  Integrations
                </DropdownMenuItem>
              </div>

              {/* Settings Rows */}
              <div className="p-2 border-t border-border">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Languages size={16} />
                    <span>Language:</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>English</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Sun size={16} />
                    <span>Theme:</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Light</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Affiliate Button */}
              <div className="p-2">
                <button className="w-full py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
                  Join Affiliate Program
                </button>
              </div>

              {/* Logout Button */}
              <div className="p-2 pt-0">
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  <Power size={16} className="mr-2" />
                  Log Out
                </DropdownMenuItem>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Terms</span>
                    <span>|</span>
                    <span>Privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      </div>
    </TooltipProvider>
  );
};

export default TopBar;
