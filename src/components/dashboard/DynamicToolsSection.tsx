import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ToolCard from './ToolCard';
import { useAppTools, AppTool } from '@/hooks/useAppTools';
import { getAppIcon } from '@/utils/appIconMapping';

interface DynamicToolsSectionProps {
  category: string;
  title: string;
  selectedType?: string;
  onEditClick?: () => void;
}

const DynamicToolsSection = ({ category, title, selectedType, onEditClick }: DynamicToolsSectionProps) => {
  const navigate = useNavigate();
  const { data: tools, isLoading } = useAppTools(category);

  // Only show if no type selected or matching category
  if (selectedType && selectedType !== category) {
    return null;
  }

  const getOnClick = (tool: AppTool) => {
    // Special handling for Edit tool
    if (tool.name === 'Edit' && onEditClick) {
      return onEditClick;
    }
    // Navigate to route if exists
    if (tool.route) {
      return () => navigate(tool.route!);
    }
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-muted/50 rounded-xl aspect-square animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          See All <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            name={tool.name}
            description={tool.description}
            bgColor={tool.bg_color}
            icon={tool.icon_url || getAppIcon(tool.name)}
            onClick={getOnClick(tool)}
            isNew={tool.is_new}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicToolsSection;
