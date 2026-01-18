import { cn } from '@/lib/utils';
import {
  Users,
  FileText,
  Settings,
  Shield,
  LayoutDashboard,
  Image,
  Video,
  Music,
  BarChart3,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Users', id: 'users' },
  { icon: FileText, label: 'Posts', id: 'posts' },
  { icon: Image, label: 'Images', id: 'images' },
  { icon: Video, label: 'Videos', id: 'videos' },
  { icon: Music, label: 'Audio', id: 'audio' },
  { icon: Shield, label: 'Roles', id: 'roles' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

interface AdminTopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTopNav = ({ activeTab, onTabChange }: AdminTopNavProps) => {
  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Admin</h1>
          <p className="text-xs text-muted-foreground">Management Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-6 py-2 flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide border-b border-border">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default AdminTopNav;
