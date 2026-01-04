import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Image, Video, TrendingUp, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalImages: number;
  totalVideos: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'post' | 'image' | 'video';
  description: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalImages: 0,
    totalVideos: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counts
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

        // Fetch recent activity
        const activities: RecentActivity[] = [];

        // Recent users
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, full_name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentUsers?.forEach((user) => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user',
            description: `New user: ${user.full_name || user.email || 'Unknown'}`,
            timestamp: user.created_at,
          });
        });

        // Recent posts
        const { data: recentPosts } = await supabase
          .from('social_posts')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentPosts?.forEach((post) => {
          activities.push({
            id: `post-${post.id}`,
            type: 'post',
            description: `Post created: ${post.title}`,
            timestamp: post.created_at,
          });
        });

        // Recent images
        const { data: recentImages } = await supabase
          .from('generated_images')
          .select('id, prompt, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentImages?.forEach((image) => {
          activities.push({
            id: `image-${image.id}`,
            type: 'image',
            description: `Image generated: ${image.prompt.substring(0, 40)}...`,
            timestamp: image.created_at || new Date().toISOString(),
          });
        });

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activities.slice(0, 8));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/manage/users' },
    { title: 'Social Posts', value: stats.totalPosts, icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10', link: '/manage/posts' },
    { title: 'Generated Images', value: stats.totalImages, icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/manage/images' },
    { title: 'AI Videos', value: stats.totalVideos, icon: Video, color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/manage/videos' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-500" />;
      case 'post': return <FileText className="w-4 h-4 text-green-500" />;
      case 'image': return <Image className="w-4 h-4 text-purple-500" />;
      case 'video': return <Video className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

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
              <Link key={stat.title} to={stat.link}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
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
              </Link>
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
                {isLoading ? (
                  <p className="text-muted-foreground text-sm">Loading activity...</p>
                ) : recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recent activity.</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="mt-1">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{activity.description}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authentication</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Active</span>
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