import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsSection() {
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved!');
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

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">Save Settings</Button>
      </div>
    </div>
  );
}
