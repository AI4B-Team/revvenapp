import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, Shield } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'moderator';
}

const AdminGuard = ({ children, requiredRole = 'moderator' }: AdminGuardProps) => {
  const { user, role, isAdmin, isAdminOrModerator, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = requiredRole === 'admin' ? isAdmin : isAdminOrModerator;

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin panel. 
            {requiredRole === 'admin' 
              ? ' Only administrators can access this area.'
              : ' Only administrators and moderators can access this area.'}
          </p>
          <a 
            href="/create" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90"
          >
            Return to App
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
