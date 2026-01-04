import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Image, Video, TrendingUp, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalImages: number;
  totalVideos: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalImages: 0,
    totalVideos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, postsRes, imagesRes, videosRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('social_posts').select('id', { count: 'exact', head: true }),
          supabase.from('generated_images').select('id', { count: 'exact', head: true }),
          supabase.from('ai_videos').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalUsers: usersRes.count || 0,
          totalPosts: postsRes.count || 0,
          totalImages: imagesRes.count || 0,
          totalVideos: videosRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Social Posts', value: stats.totalPosts, icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Generated Images', value: stats.totalImages, icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'AI Videos', value: stats.totalVideos, icon: Video, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to the admin panel. Here's an overview of your platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? '—' : stat.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Activity feed will be shown here.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Edge Functions</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
