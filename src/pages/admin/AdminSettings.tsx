import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Globe, 
  Bell, 
  Shield, 
  Lock,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
  };
  security: {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    requireEmailVerification: boolean;
  };
  notifications: {
    enableNotifications: boolean;
  };
  limits: {
    maxUploadSize: number;
  };
}

const defaultSettings: Settings = {
  general: {
    siteName: 'REVVEN',
    siteDescription: 'AI-powered content creation platform',
  },
  security: {
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: false,
  },
  notifications: {
    enableNotifications: true,
  },
  limits: {
    maxUploadSize: 50,
  },
};

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings = { ...defaultSettings };
        data.forEach((item) => {
          if (item.key === 'general') loadedSettings.general = item.value as Settings['general'];
          if (item.key === 'security') loadedSettings.security = item.value as Settings['security'];
          if (item.key === 'notifications') loadedSettings.notifications = item.value as Settings['notifications'];
          if (item.key === 'limits') loadedSettings.limits = item.value as Settings['limits'];
        });
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'general', value: settings.general },
        { key: 'security', value: settings.security },
        { key: 'notifications', value: settings.notifications },
        { key: 'limits', value: settings.limits },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ value: update.value })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminGuard requiredRole="admin">
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
    <AdminGuard requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Configure your platform settings.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchSettings} disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid gap-6 max-w-3xl">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic configuration for your platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      general: { ...settings.general, siteName: e.target.value } 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      general: { ...settings.general, siteDescription: e.target.value } 
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription>Security and access control settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable public access to the site.
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ 
                      ...settings, 
                      security: { ...settings.security, maintenanceMode: checked } 
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to sign up.
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.allowRegistrations}
                    onCheckedChange={(checked) => setSettings({ 
                      ...settings, 
                      security: { ...settings.security, allowRegistrations: checked } 
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before accessing the platform.
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({ 
                      ...settings, 
                      security: { ...settings.security, requireEmailVerification: checked } 
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure notification preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users.
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.enableNotifications}
                    onCheckedChange={(checked) => setSettings({ 
                      ...settings, 
                      notifications: { ...settings.notifications, enableNotifications: checked } 
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Limits Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Limits
                </CardTitle>
                <CardDescription>Set resource limits for the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUpload">Max Upload Size (MB)</Label>
                  <Input
                    id="maxUpload"
                    type="number"
                    value={settings.limits.maxUploadSize}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      limits: { ...settings.limits, maxUploadSize: Number(e.target.value) } 
                    })}
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminSettings;