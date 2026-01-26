import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  AlertTriangle,
  Megaphone,
  Plug,
  Lock,
  Eye,
  Key,
  UserCheck,
  Globe,
  FileText,
  Zap,
} from 'lucide-react';
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

type SettingsTab = 'marketing' | 'integrations' | 'security' | 'notifications' | 'advanced';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'advanced', label: 'Advanced', icon: Settings },
];

export function SettingsSection({ onDeactivate }: SettingsSectionProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('marketing');
  
  // Marketing state
  const [googlePixelId, setGooglePixelId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  
  // Integrations state
  const [stripeConnected, setStripeConnected] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [mailchimpConnected, setMailchimpConnected] = useState(false);
  
  // Security state
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);
  const [enableRateLimiting, setEnableRateLimiting] = useState(true);
  const [enableSessionTimeout, setEnableSessionTimeout] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [enableIpWhitelist, setEnableIpWhitelist] = useState(false);
  const [whitelistedIps, setWhitelistedIps] = useState('');
  
  // Notifications state
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [enableNewCustomerAlerts, setEnableNewCustomerAlerts] = useState(true);
  const [enablePaymentAlerts, setEnablePaymentAlerts] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');
  
  // Advanced state
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [enableDebugMode, setEnableDebugMode] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved!');
  };

  const handleDeactivate = () => {
    if (onDeactivate) {
      onDeactivate();
      toast.success('License deactivated');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'marketing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Google Analytics */}
              <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Google Analytics</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track visitor behavior and conversions with Google Analytics.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="ga-id">Measurement ID</Label>
                  <Input 
                    id="ga-id"
                    placeholder="G-XXXXXXXXXX"
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>

              {/* Google Pixel */}
              <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Google Ads Pixel</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track conversions from your Google Ads campaigns.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="google-pixel">Conversion ID</Label>
                  <Input 
                    id="google-pixel"
                    placeholder="AW-XXXXXXXXXX"
                    value={googlePixelId}
                    onChange={(e) => setGooglePixelId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>

              {/* Meta Pixel */}
              <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Meta Pixel</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track conversions from Facebook and Instagram ads.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="meta-pixel">Pixel ID</Label>
                  <Input 
                    id="meta-pixel"
                    placeholder="XXXXXXXXXXXXXXXXX"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stripe */}
              <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Stripe</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Accept payments via credit card, Apple Pay, and more.
                </p>
                {stripeConnected ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStripeConnected(true);
                      toast.success('Stripe connected!');
                    }}
                    className="w-full"
                  >
                    Connect Stripe
                  </Button>
                )}
              </div>

              {/* Calendly */}
              <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Calendly</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Let customers book calls directly from your landing page.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="calendly">Calendly URL</Label>
                  <Input 
                    id="calendly"
                    placeholder="https://calendly.com/your-link"
                    value={calendlyUrl}
                    onChange={(e) => setCalendlyUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>

              {/* Mailchimp */}
              <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold">Mailchimp</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sync customers to your email marketing lists automatically.
                </p>
                {mailchimpConnected ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMailchimpConnected(true);
                      toast.success('Mailchimp connected!');
                    }}
                    className="w-full"
                  >
                    Connect Mailchimp
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Authentication */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Authentication</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Email Verification</p>
                    <p className="text-sm text-muted-foreground">Require email verification before access</p>
                  </div>
                  <Switch checked={requireEmailVerification} onCheckedChange={setRequireEmailVerification} />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch checked={enable2FA} onCheckedChange={setEnable2FA} />
                </div>
              </div>
            </div>

            {/* Session Security */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Session Security</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <Switch checked={enableSessionTimeout} onCheckedChange={setEnableSessionTimeout} />
                </div>
                
                {enableSessionTimeout && (
                  <div className="pl-4 space-y-2">
                    <Label>Timeout Duration (minutes)</Label>
                    <Input 
                      type="number"
                      value={sessionTimeoutMinutes}
                      onChange={(e) => setSessionTimeoutMinutes(parseInt(e.target.value) || 30)}
                      className="w-32"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">Prevent brute force attacks</p>
                  </div>
                  <Switch checked={enableRateLimiting} onCheckedChange={setEnableRateLimiting} />
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Access Control</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">IP Whitelist</p>
                    <p className="text-sm text-muted-foreground">Only allow access from specific IPs</p>
                  </div>
                  <Switch checked={enableIpWhitelist} onCheckedChange={setEnableIpWhitelist} />
                </div>
                
                {enableIpWhitelist && (
                  <div className="pl-4 space-y-2">
                    <Label>Whitelisted IPs (comma separated)</Label>
                    <Input 
                      placeholder="192.168.1.1, 10.0.0.1"
                      value={whitelistedIps}
                      onChange={(e) => setWhitelistedIps(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Email Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Notification Email</Label>
                  <Input 
                    type="email"
                    placeholder="you@example.com"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={enableEmailNotifications} onCheckedChange={setEnableEmailNotifications} />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">New Customer Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when someone signs up</p>
                  </div>
                  <Switch checked={enableNewCustomerAlerts} onCheckedChange={setEnableNewCustomerAlerts} />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Payment Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about successful payments</p>
                  </div>
                  <Switch checked={enablePaymentAlerts} onCheckedChange={setEnablePaymentAlerts} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">General</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Analytics Tracking</p>
                    <p className="text-sm text-muted-foreground">Collect usage data for insights</p>
                  </div>
                  <Switch checked={enableAnalytics} onCheckedChange={setEnableAnalytics} />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium">Debug Mode</p>
                    <p className="text-sm text-muted-foreground">Show detailed error messages</p>
                  </div>
                  <Switch checked={enableDebugMode} onCheckedChange={setEnableDebugMode} />
                </div>
              </div>
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your white-label app settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-xl border border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Settings
        </Button>
      </div>
    </div>
  );
}