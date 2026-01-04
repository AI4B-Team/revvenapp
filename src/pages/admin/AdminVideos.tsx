import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Loader2 } from 'lucide-react';

const AdminVideos = () => {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Videos</h1>
            <p className="text-muted-foreground">Manage all AI-generated videos on the platform.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                All Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Video management coming soon. Currently videos are managed through the AI Videos section.
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminVideos;
