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
  Music,
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
  { icon: Music, label: 'Audio', path: '/manage/audio' },
  { icon: Shield, label: 'Roles', path: '/manage/roles' },
  { icon: BarChart3, label: 'Analytics', path: '/manage/analytics' },
  { icon: Settings, label: 'Settings', path: '/manage/settings' },
];

const AdminTopNav = () => {
  const location = useLocation();

  return (
    <div className="bg-card border-b border-border">
      {/* Header */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin</h1>
            <p className="text-xs text-muted-foreground">Management Console</p>
          </div>
        </div>
        <Link to="/account">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-8 py-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminTopNav;
