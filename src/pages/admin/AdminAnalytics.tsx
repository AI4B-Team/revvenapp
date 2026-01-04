import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Users, FileText, Image, Video, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface DailyCount {
  date: string;
  count: number;
}

interface ContentBreakdown {
  name: string;
  value: number;
  color: string;
}

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userGrowth, setUserGrowth] = useState<DailyCount[]>([]);
  const [contentCreation, setContentCreation] = useState<DailyCount[]>([]);
  const [contentBreakdown, setContentBreakdown] = useState<ContentBreakdown[]>([]);
  const [totals, setTotals] = useState({ users: 0, posts: 0, images: 0, videos: 0 });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Get dates for last 7 days
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(startOfDay(date), 'yyyy-MM-dd');
      });

      // Fetch all data
      const [profilesRes, postsRes, imagesRes, videosRes] = await Promise.all([
        supabase.from('profiles').select('created_at'),
        supabase.from('social_posts').select('created_at'),
        supabase.from('generated_images').select('created_at'),
        supabase.from('ai_videos').select('created_at'),
      ]);

      const profiles = profilesRes.data || [];
      const posts = postsRes.data || [];
      const images = imagesRes.data || [];
      const videos = videosRes.data || [];

      // Calculate totals
      setTotals({
        users: profiles.length,
        posts: posts.length,
        images: images.length,
        videos: videos.length,
      });

      // Calculate user growth by day
      const usersByDay = dates.map((date) => {
        const count = profiles.filter((p) => 
          format(new Date(p.created_at), 'yyyy-MM-dd') === date
        ).length;
        return { date: format(new Date(date), 'MMM d'), count };
      });
      setUserGrowth(usersByDay);

      // Calculate content creation by day
      const contentByDay = dates.map((date) => {
        const postCount = posts.filter((p) => 
          format(new Date(p.created_at), 'yyyy-MM-dd') === date
        ).length;
        const imageCount = images.filter((i) => 
          i.created_at && format(new Date(i.created_at), 'yyyy-MM-dd') === date
        ).length;
        const videoCount = videos.filter((v) => 
          v.created_at && format(new Date(v.created_at), 'yyyy-MM-dd') === date
        ).length;
        return { 
          date: format(new Date(date), 'MMM d'), 
          count: postCount + imageCount + videoCount 
        };
      });
      setContentCreation(contentByDay);

      // Content breakdown
      setContentBreakdown([
        { name: 'Posts', value: posts.length, color: '#22c55e' },
        { name: 'Images', value: images.length, color: '#a855f7' },
        { name: 'Videos', value: videos.length, color: '#f97316' },
      ]);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Platform usage and performance metrics.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.users}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <FileText className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.posts}</p>
                    <p className="text-xs text-muted-foreground">Total Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Image className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.images}</p>
                    <p className="text-xs text-muted-foreground">Total Images</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Video className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.videos}</p>
                    <p className="text-xs text-muted-foreground">Total Videos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  User Growth (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Content Creation Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Creation (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentCreation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Content Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Content Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {contentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Content per User</span>
                    <span className="font-bold">
                      {totals.users > 0 
                        ? ((totals.posts + totals.images + totals.videos) / totals.users).toFixed(1)
                        : '0'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Popular Content</span>
                    <span className="font-bold">
                      {totals.posts >= totals.images && totals.posts >= totals.videos
                        ? 'Posts'
                        : totals.images >= totals.videos
                        ? 'Images'
                        : 'Videos'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Content Created</span>
                    <span className="font-bold">
                      {(totals.posts + totals.images + totals.videos).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Content Types</span>
                    <span className="font-bold">3</span>
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

export default AdminAnalytics;