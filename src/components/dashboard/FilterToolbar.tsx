import { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, Filter, Search, ZoomIn, ZoomOut, 
  Heart, Calendar
} from 'lucide-react';

interface FilterToolbarProps {
  onZoomChange?: (zoom: number) => void;
  zoom?: number;
}

const FilterToolbar = ({ onZoomChange, zoom = 50 }: FilterToolbarProps) => {
  const [allDropdownOpen, setAllDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const contentTypes = [
    'All',
    'Image',
    'Video',
    'Audio',
    'Design',
    'Content',
    'Apps'
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
      
      {/* All Dropdown */}
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
            {contentTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedContentType(type);
                  setAllDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                  selectedContentType === type ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                {type}
              </button>
            ))}
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
          <Filter size={18} />
        </button>

        {filterDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            {/* Date Range Filter */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Date</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Liked Images Filter */}
            <div>
              <button
                onClick={() => setShowLikedOnly(!showLikedOnly)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  showLikedOnly ? 'bg-red-50 text-red-700' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Heart 
                  size={16} 
                  className={showLikedOnly ? 'fill-red-500 text-red-500' : ''} 
                />
                <span className="text-sm font-medium">Liked Images</span>
              </button>
            </div>

            {/* Apply/Clear Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setShowLikedOnly(false);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setFilterDropdownOpen(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search - Expandable */}
      <div className="relative">
        {!searchExpanded ? (
          <button
            onClick={() => setSearchExpanded(true)}
            className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg transition-colors"
          >
            <Search size={18} />
          </button>
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
