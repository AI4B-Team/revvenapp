import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Video,
  Image,
  Music,
  Film,
  ChevronDown,
  Check,
  Sparkles,
  Crown,
  Gauge,
  HardDrive,
  Settings2,
  Zap,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface ExportDropdownProps {
  isFreePlan?: boolean;
  onExport?: (settings: ExportSettings) => void;
}

interface ExportSettings {
  type: 'video' | 'image' | 'audio' | 'gif';
  format: string;
  resolution: string;
  quality: number;
}

const exportTypes = [
  { id: 'video', label: 'Video', icon: Video, formats: ['MP4', 'MOV', 'WebM'] },
  { id: 'image', label: 'Image', icon: Image, formats: ['PNG', 'JPG', 'WebP'] },
  { id: 'audio', label: 'Audio', icon: Music, formats: ['MP3', 'WAV', 'AAC'] },
  { id: 'gif', label: 'GIF', icon: Film, formats: ['GIF'] },
];

const resolutions = [
  { label: '4K', value: '3840 × 2160', premium: true },
  { label: '1080p', value: '1920 × 1080', premium: false },
  { label: '720p', value: '1280 × 720', premium: false },
  { label: '480p', value: '854 × 480', premium: false },
  { label: 'Custom', value: 'custom', premium: true },
];

const ExportDropdown: React.FC<ExportDropdownProps> = ({ isFreePlan = true, onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'recent'>('export');
  const [selectedType, setSelectedType] = useState<string>('video');
  const [selectedFormat, setSelectedFormat] = useState<string>('MP4');
  const [selectedResolution, setSelectedResolution] = useState<string>('1920 × 1080');
  const [quality, setQuality] = useState<number>(75);
  const [isExporting, setIsExporting] = useState(false);

  const currentType = exportTypes.find((t) => t.id === selectedType);

  const getEstimatedSize = () => {
    const baseSize = selectedType === 'video' ? 50 : selectedType === 'audio' ? 5 : 2;
    const qualityMultiplier = quality / 50;
    const resMultiplier = selectedResolution.includes('4K') ? 4 : selectedResolution.includes('1080') ? 1 : 0.5;
    const min = (baseSize * qualityMultiplier * resMultiplier * 0.5).toFixed(1);
    const max = (baseSize * qualityMultiplier * resMultiplier * 1.5).toFixed(1);
    return `${min} MB — ${max} MB`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExporting(false);
    
    if (isFreePlan) {
      toast.success('Export started with watermark', {
        description: 'Upgrade to remove watermark from exports',
      });
    } else {
      toast.success('Export started', {
        description: `Exporting as ${selectedFormat} at ${selectedResolution}`,
      });
    }

    if (onExport) {
      onExport({
        type: selectedType as ExportSettings['type'],
        format: selectedFormat,
        resolution: selectedResolution,
        quality,
      });
    }

    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg text-sm text-white font-medium transition-all shadow-lg shadow-primary/25">
          <Download className="w-4 h-4" />
          <span>Export</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 bg-gray-900 border-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-white border-b-2 border-primary bg-gray-800/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EXPORT PROJECT
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'text-white border-b-2 border-primary bg-gray-800/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            RECENT EXPORTS
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'export' ? (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-5"
            >
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Type</label>
                <div className="flex gap-2">
                  {exportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setSelectedFormat(type.formats[0]);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedType === type.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format & Resolution */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Format</label>
                  <div className="relative">
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {currentType?.formats.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    Resolution
                  </label>
                  <div className="relative">
                    <select
                      value={selectedResolution}
                      onChange={(e) => setSelectedResolution(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {resolutions.map((res) => (
                        <option 
                          key={res.value} 
                          value={res.value}
                          disabled={res.premium && isFreePlan}
                        >
                          {res.label} {res.premium && isFreePlan && '🔒'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Quality Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5" />
                    Quality
                  </label>
                  <span className="text-sm text-white font-medium">{quality}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Smaller</span>
                  <Slider
                    value={[quality]}
                    onValueChange={([val]) => setQuality(val)}
                    min={10}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500">Higher</span>
                </div>
              </div>

              {/* Estimated Size */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <HardDrive className="w-4 h-4" />
                  Estimated size:
                </div>
                <span className="text-white font-medium text-sm">{getEstimatedSize()}</span>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 rounded-xl text-white font-semibold transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Settings2 className="w-5 h-5" />
                    </motion.div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Export as {selectedFormat}
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  </>
                )}
              </button>

              {/* Free Plan Watermark Notice */}
              {isFreePlan && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 p-[1px]"
                >
                  <div className="bg-gray-900 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm">Watermark-free exports</h4>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Upgrade to export without watermark on your projects
                        </p>
                      </div>
                    </div>
                    <button className="w-full mt-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all">
                      <Sparkles className="w-4 h-4" />
                      Upgrade
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="recent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                  <Download className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">No recent exports</p>
                <p className="text-gray-500 text-xs mt-1">Your export history will appear here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
