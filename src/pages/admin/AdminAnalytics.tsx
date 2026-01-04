import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Platform usage and performance metrics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - User signups over time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Content generated over time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Daily active users
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Platform Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Feature usage breakdown
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
