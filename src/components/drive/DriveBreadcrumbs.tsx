import { ChevronRight, HardDrive } from 'lucide-react';

interface DriveBreadcrumbsProps {
  breadcrumbs: { id: string | null; name: string }[];
  onNavigate: (id: string | null, name?: string) => void;
}

const DriveBreadcrumbs = ({ breadcrumbs, onNavigate }: DriveBreadcrumbsProps) => {
  return (
    <div className="flex items-center gap-1 text-sm mb-3 px-2 py-1.5 bg-muted/40 rounded-lg w-fit">
      {breadcrumbs.map((crumb, i) => (
        <div key={crumb.id || 'root'} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          <button
            onClick={() => onNavigate(crumb.id, crumb.name)}
            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors hover:bg-muted ${
              i === breadcrumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'
            }`}
          >
            {i === 0 && <HardDrive className="w-3.5 h-3.5" />}
            {crumb.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default DriveBreadcrumbs;
