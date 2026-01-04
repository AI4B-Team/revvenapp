import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Crown, User, Loader2 } from 'lucide-react';

interface RoleCount {
  role: string;
  count: number;
}

const AdminRoles = () => {
  const { toast } = useToast();
  const [roleCounts, setRoleCounts] = useState<RoleCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoleCounts();
  }, []);

  const fetchRoleCounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role');

      if (error) throw error;

      const counts: Record<string, number> = { admin: 0, moderator: 0, user: 0 };
      (data || []).forEach((item) => {
        counts[item.role] = (counts[item.role] || 0) + 1;
      });

      setRoleCounts([
        { role: 'admin', count: counts.admin },
        { role: 'moderator', count: counts.moderator },
        { role: 'user', count: counts.user },
      ]);
    } catch (error) {
      console.error('Error fetching role counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfig = {
    admin: {
      icon: Crown,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      description: 'Full access to all features and settings. Can manage users, content, and system configuration.',
    },
    moderator: {
      icon: Shield,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      description: 'Can view and moderate content. Limited access to user management.',
    },
    user: {
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      description: 'Standard user access. Can create and manage their own content.',
    },
  };

  return (
    <AdminGuard requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">Manage user roles and access levels.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 max-w-3xl">
              {roleCounts.map((item) => {
                const config = roleConfig[item.role as keyof typeof roleConfig];
                const Icon = config.icon;
                return (
                  <Card key={item.role}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${config.bg}`}>
                            <Icon className={`w-6 h-6 ${config.color}`} />
                          </div>
                          <div>
                            <CardTitle className="capitalize">{item.role}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-1">
                          {item.count}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Permissions:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {item.role === 'admin' && (
                            <>
                              <li>• Full access to admin panel</li>
                              <li>• Manage all users and roles</li>
                              <li>• View and delete any content</li>
                              <li>• Configure system settings</li>
                            </>
                          )}
                          {item.role === 'moderator' && (
                            <>
                              <li>• Access admin panel (read-only settings)</li>
                              <li>• View all user profiles</li>
                              <li>• View all content</li>
                              <li>• Cannot delete users or change roles</li>
                            </>
                          )}
                          {item.role === 'user' && (
                            <>
                              <li>• Create and manage own content</li>
                              <li>• Access all content creation tools</li>
                              <li>• No access to admin panel</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminRoles;
