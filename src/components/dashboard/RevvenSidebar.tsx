import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FolderOpen, 
  ChevronDown, 
  Sparkles,
  Plus,
  Check,
  PanelLeftClose,
  Home,
  LayoutGrid,
  X,
  Info,
  Users,
  MoreVertical
} from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';

interface RevvenSidebarProps {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onLexiClick?: () => void;
  onHomeClick?: () => void;
  onSeeAllProjects?: () => void;
  onTabChange?: (tabName: string) => void;
}

const RevvenSidebar = ({ 
  isCollapsed: externalCollapsed, 
  onCollapsedChange, 
  onLexiClick, 
  onHomeClick, 
  onSeeAllProjects, 
  onTabChange 
}: RevvenSidebarProps) => {
  const navigate = useNavigate();
  const [spaceDropdownOpen, setSpaceDropdownOpen] = useState(false);
  const [spaceMenuOpen, setSpaceMenuOpen] = useState<string | null>(null);
  const [spaceSearch, setSpaceSearch] = useState('');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isLexiHovered, setIsLexiHovered] = useState(false);
  const [showRewards, setShowRewards] = useState(true);
  
  const spaces = [
    { id: '1', name: "Brian's Space", selected: true },
    { id: '2', name: "Dolmar's Space", selected: false },
    { id: '3', name: "Team Space", selected: false },
  ];
  
  const filteredSpaces = spaces.filter(space => 
    space.name.toLowerCase().includes(spaceSearch.toLowerCase())
  );
  
  const brands = [
    { id: '0', name: 'AI4B', selected: true },
    { id: '1', name: 'Digital Influencer', selected: false },
    { id: '2', name: 'Paper Flips', selected: false }
  ];

  const sortedBrands = [...brands].sort((a, b) => {
    if (a.selected && !b.selected) return -1;
    if (!a.selected && b.selected) return 1;
    return 0;
  });
  
  const filteredBrands = sortedBrands.filter(brand => 
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setIsCollapsed = (value: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setInternalCollapsed(value);
    }
  };
  
  const rewardsProgress = 29;
  const usedCredits = 10000;
  const totalCredits = 98000;
  const remainingCredits = totalCredits - usedCredits;

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-zinc-900 flex flex-col items-center py-4 h-screen sticky top-0">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-zinc-800 transition-colors mb-4"
          title="Expand menu"
        >
          <RevvenLogo />
        </button>
        
        <nav className="flex flex-col gap-1 mt-2">
          <button 
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors group relative"
            title="Home"
            onClick={onHomeClick}
          >
            <Home size={18} className="text-zinc-400" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
              Home
            </span>
          </button>
          
          <button 
            className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors group relative"
            title="LEXI"
            onClick={onLexiClick}
            onMouseEnter={() => setIsLexiHovered(true)}
            onMouseLeave={() => setIsLexiHovered(false)}
          >
            <Sparkles 
              size={18} 
              className={`text-yellow-500 transition-transform ${isLexiHovered ? 'animate-spin animate-bounce scale-110' : ''}`}
              style={isLexiHovered ? { animationDuration: '1s' } : {}}
            />
            <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
              LEXI
            </span>
          </button>
          
          <button 
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors group relative"
            title="Apps"
            onClick={() => navigate('/apps')}
          >
            <LayoutGrid size={18} className="text-zinc-400" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
              Apps
            </span>
          </button>
          
          <button 
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors group relative"
            title="Assets"
          >
            <FolderOpen size={18} className="text-zinc-400" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
              Assets
            </span>
          </button>
          
          <button 
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors group relative"
            title="Community"
          >
            <Users size={18} className="text-zinc-400" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
              Community
            </span>
          </button>
        </nav>
        
        <div className="flex-1" />
      </aside>
    );
  }

  return (
    <aside className="w-[280px] bg-zinc-900 flex flex-col p-4 pb-2 h-screen sticky top-0">
      {/* Logo Section */}
      <div className="flex items-center justify-between mb-4">
        <RevvenLogo />
        <span className="flex-1 text-lg font-bold text-white tracking-tight text-center">REVVEN</span>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <PanelLeftClose size={18} className="text-zinc-500" />
        </button>
      </div>

      {/* Space Dropdown */}
      <div className="relative mb-4">
        <button 
          className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
          onClick={() => setSpaceDropdownOpen(!spaceDropdownOpen)}
        >
          <span className="text-sm font-medium text-primary-foreground">Brian's Space</span>
          <ChevronDown size={16} className="text-primary-foreground/70 ml-2" />
        </button>
        
        {spaceDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 rounded-lg p-2 shadow-xl z-50">
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search Spaces"
                value={spaceSearch}
                onChange={(e) => setSpaceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-700 rounded-md text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              {filteredSpaces.map((space) => (
                <div key={space.id} className="relative flex items-center justify-between px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-700">
                  <div className="flex items-center gap-2">
                    <span>{space.name}</span>
                    {space.selected && <Check size={14} className="text-primary" />}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpaceMenuOpen(spaceMenuOpen === space.id ? null : space.id);
                    }}
                    className="p-1 hover:bg-zinc-600 rounded"
                  >
                    <MoreVertical size={14} className="text-zinc-400" />
                  </button>
                  
                  {spaceMenuOpen === space.id && (
                    <div className="absolute right-0 top-full mt-1 bg-zinc-700 rounded-md shadow-lg z-50 min-w-[100px]">
                      <button className="w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-600 text-left rounded-t-md">
                        Invite
                      </button>
                      <button className="w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-600 text-left rounded-b-md">
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="h-px bg-zinc-700 my-2" />
            
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={14} />
              <span>Create New Space</span>
            </button>
          </div>
        )}
      </div>

      {/* Brand Dropdown */}
      <div className="relative mb-4">
        <button 
          className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-primary"
          onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
        >
          <span className="text-sm font-medium text-white">AI4B</span>
          <ChevronDown size={16} className="text-zinc-400 ml-2" />
        </button>
        
        {brandDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 rounded-lg p-2 shadow-xl z-50 border border-primary">
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search Projects"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-700 rounded-md text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              {filteredBrands.map((brand) => (
                <div key={brand.id} className="relative flex items-center justify-between px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-700">
                  <span>{brand.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setBrandMenuOpen(brandMenuOpen === brand.id ? null : brand.id);
                    }}
                    className="p-1 hover:bg-zinc-600 rounded"
                  >
                    <MoreVertical size={14} className="text-zinc-400" />
                  </button>
                  
                  {brandMenuOpen === brand.id && (
                    <div className="absolute right-0 top-full mt-1 bg-zinc-700 rounded-md shadow-lg z-50 min-w-[100px]">
                      <button className="w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-600 text-left rounded-t-md">
                        Invite
                      </button>
                      <button className="w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-600 text-left rounded-b-md">
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="h-px bg-zinc-700 my-2" />
            
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus size={14} />
                <span>New</span>
              </button>
              <button 
                onClick={() => {
                  setBrandDropdownOpen(false);
                  onSeeAllProjects?.();
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-700 text-white text-sm font-medium hover:bg-zinc-600 transition-colors"
              >
                See All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mb-4">
        <button 
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
          onClick={onHomeClick}
        >
          <Home size={18} />
          <span>Home</span>
        </button>
        
        <button 
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
          onMouseEnter={() => setIsLexiHovered(true)}
          onMouseLeave={() => setIsLexiHovered(false)}
          onClick={onLexiClick}
        >
          <Sparkles 
            size={18} 
            className={`text-yellow-500 transition-transform duration-300 ${isLexiHovered ? 'scale-125 rotate-12' : ''}`}
          />
          <span>LEXI</span>
        </button>
        
        <button 
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
          onClick={() => navigate('/apps')}
        >
          <LayoutGrid size={18} />
          <span>Apps</span>
        </button>
        
        <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors">
          <FolderOpen size={18} />
          <span>Assets</span>
        </button>
        
        <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Users size={18} />
          <span>Community</span>
        </button>
      </nav>

      <div className="flex-1" />

      {/* Rewards Section */}
      {showRewards && (
        <div className="mb-3 p-3 rounded-xl bg-white border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                <Sparkles size={12} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-zinc-900">Unlock Rewards</span>
            </div>
            <button 
              onClick={() => setShowRewards(false)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 mb-1.5">
            <div 
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${rewardsProgress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">{rewardsProgress}% Completed</p>
        </div>
      )}

      {/* Usage Credits Section */}
      <div className="mb-0 p-3 rounded-xl bg-zinc-800/50 border-2 border-primary">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-white">Usage Credits</span>
          <button className="text-zinc-500 hover:text-zinc-300">
            <Info size={12} />
          </button>
        </div>
        <p className="text-xs text-zinc-500 mb-2">{usedCredits.toLocaleString()} / {totalCredits.toLocaleString()} Used</p>
        <div className="w-full h-1.5 rounded-full bg-zinc-700 mb-2">
          <div 
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(usedCredits / totalCredits) * 100}%` }}
          />
        </div>
        <p className="text-sm text-primary font-medium mb-3">{remainingCredits.toLocaleString()} Credits Remaining</p>
        <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Purchase Extra Credit
        </button>
      </div>
    </aside>
  );
};

export default RevvenSidebar;
