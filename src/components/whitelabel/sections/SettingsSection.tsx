import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Users, CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SettingsSectionProps {
  onDeactivate?: () => void;
}

export function SettingsSection({ onDeactivate }: SettingsSectionProps) {
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved!');
  };

  const handleDeactivate = () => {
    if (onDeactivate) {
      onDeactivate();
      toast.success('License deactivated');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your white-label app settings</p>
      </div>

      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h3 className="font-semibold">Notifications</h3></div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div><p className="font-medium">Email Notifications</p><p className="text-sm text-muted-foreground">Get notified about new customers</p></div>
          <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
        </div>
      </div>

      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /><h3 className="font-semibold">Security</h3></div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div><p className="font-medium">Require Email Verification</p><p className="text-sm text-muted-foreground">Customers must verify email before access</p></div>
          <Switch checked={requireEmailVerification} onCheckedChange={setRequireEmailVerification} />
        </div>
      </div>

      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /><h3 className="font-semibold">Stripe Integration</h3></div>
        <p className="text-sm text-muted-foreground">Connect your Stripe account to receive payments</p>
        <Button variant="outline">Connect Stripe</Button>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-xl border-2 border-destructive/50 bg-destructive/5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Deactivating your license will remove all your customizations and return you to the activation screen.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Deactivate License</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will deactivate your white-label license and remove all customizations. You can reactivate anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivate} className="bg-destructive hover:bg-destructive/90">
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">Save Settings</Button>
      </div>
    </div>
  );
}
