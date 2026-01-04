import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  FileText,
  Settings,
  Shield,
  LayoutDashboard,
  Image,
  Video,
  MessageSquare,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/manage' },
  { icon: Users, label: 'Users', path: '/manage/users' },
  { icon: FileText, label: 'Posts', path: '/manage/posts' },
  { icon: Image, label: 'Images', path: '/manage/images' },
  { icon: Video, label: 'Videos', path: '/manage/videos' },
  { icon: Shield, label: 'Roles', path: '/manage/roles' },
  { icon: BarChart3, label: 'Analytics', path: '/manage/analytics' },
  { icon: Settings, label: 'Settings', path: '/manage/settings' },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Management Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link to="/create">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
