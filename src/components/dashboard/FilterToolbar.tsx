import { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, Sliders, Search, ZoomIn, ZoomOut, 
  Heart, Calendar, Layers, Image, Video, Headphones, 
  Palette, FileText, Grid3x3
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FilterState {
  contentType: string;
  likes: boolean;
  edits: boolean;
  upscales: boolean;
  startDate: string;
  endDate: string;
  searchQuery: string;
}

interface FilterToolbarProps {
  onZoomChange?: (zoom: number) => void;
  zoom?: number;
  onFiltersChange?: (filters: FilterState) => void;
  selectedContentType?: string;
  onContentTypeChange?: (type: string) => void;
}

const FilterToolbar = ({ onZoomChange, zoom = 50, onFiltersChange, selectedContentType = 'All', onContentTypeChange }: FilterToolbarProps) => {
  const [allDropdownOpen, setAllDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    likes: false,
    edits: false,
    upscales: false,
    startDate: '',
    endDate: ''
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const contentTypes = [
    { name: 'All', icon: Layers, color: '' },
    { name: 'Image', icon: Image, color: 'text-blue-500' },
    { name: 'Video', icon: Video, color: 'text-red-500' },
    { name: 'Audio', icon: Headphones, color: 'text-green-500' },
    { name: 'Design', icon: Palette, color: 'text-yellow-500' },
    { name: 'Content', icon: FileText, color: 'text-blue-500' },
    { name: 'Apps', icon: Grid3x3, color: 'text-green-500' }
  ];

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setAllDropdownOpen(false);
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3">
      
      {/* Content Type Dropdown */}
      <div className="relative dropdown-container">
        <button
          onClick={() => setAllDropdownOpen(!allDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">{selectedContentType}</span>
          <ChevronDown size={16} />
        </button>

        {allDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.name}
                  onClick={() => {
                    onContentTypeChange?.(type.name);
                    setAllDropdownOpen(false);
                    onFiltersChange?.({
                      contentType: type.name,
                      ...filters,
                      searchQuery
                    });
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                    selectedContentType === type.name ? 'bg-gray-100 font-semibold' : ''
                  }`}
                >
                  <Icon size={16} className={type.color} />
                  {type.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="relative dropdown-container">
        <button
          onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
          className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg transition-colors"
          title="Filter"
        >
          <Sliders size={18} />
        </button>

        {filterDropdownOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setFilterDropdownOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Filter By</h3>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                
                {/* Checkboxes Section */}
                <div className="space-y-3 mb-5">
                  {/* Likes */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.likes}
                        onChange={() => setFilters(prev => ({ ...prev, likes: !prev.likes }))}
                        className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-gray-900 checked:border-gray-900 transition-colors"
                      />
                      {filters.likes && (
                        <svg 
                          className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none"
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">
                      Likes
                    </span>
                  </label>

                  {/* Edits */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.edits}
                        onChange={() => setFilters(prev => ({ ...prev, edits: !prev.edits }))}
                        className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-gray-900 checked:border-gray-900 transition-colors"
                      />
                      {filters.edits && (
                        <svg 
                          className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none"
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">
                      Edits
                    </span>
                  </label>

                  {/* Upscales */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.upscales}
                        onChange={() => setFilters(prev => ({ ...prev, upscales: !prev.upscales }))}
                        className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none checked:bg-gray-900 checked:border-gray-900 transition-colors"
                      />
                      {filters.upscales && (
                        <svg 
                          className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none"
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">
                      Upscales
                    </span>
                  </label>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-5"></div>

                {/* Date Range Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Date</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Start Date */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">From</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">To</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setFilters({
                    likes: false,
                    edits: false,
                    upscales: false,
                    startDate: '',
                    endDate: ''
                  })}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setFilterDropdownOpen(false);
                    onFiltersChange?.({
                      contentType: selectedContentType,
                      ...filters,
                      searchQuery
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search - Expandable */}
      <TooltipProvider>
        <div className="relative">
          {!searchExpanded ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg transition-colors"
                >
                  <Search size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setSearchExpanded(false);
                }}
                placeholder="Search..."
                className="px-3 py-2 w-64 text-sm outline-none"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchExpanded(false);
                }}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <Search size={18} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Zoom Slider */}
      <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2">
        <button
          onClick={() => onZoomChange?.(Math.max(0, zoom - 10))}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ZoomOut size={18} />
        </button>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={zoom}
            onChange={(e) => onZoomChange?.(Number(e.target.value))}
            className="w-32 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        <button
          onClick={() => onZoomChange?.(Math.min(100, zoom + 10))}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </div>
  );
};

export default FilterToolbar;
