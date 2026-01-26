import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
  Users,
  Mail,
  Send,
  TrendingUp,
  UserPlus,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { SiGoogle, SiMeta, SiTiktok } from 'react-icons/si';
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

type SettingsTab = 'announcements' | 'customers' | 'email-templates' | 'marketing' | 'integrations' | 'security' | 'notifications' | 'advanced';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'announcements', label: 'Announcements', icon: Send },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'email-templates', label: 'Email Templates', icon: Mail },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'advanced', label: 'Advanced', icon: Settings },
];

export function SettingsSection({ onDeactivate }: SettingsSectionProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('announcements');
  
  // Announcements state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<'info' | 'success' | 'warning'>('info');
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; message: string; type: string; date: string; active: boolean }[]>([
    { id: '1', title: 'Welcome to our platform!', message: 'Thank you for joining. Check out our new features.', type: 'info', date: '2025-01-20', active: true },
  ]);
  
  // Customer stats (mock data)
  const customerStats = {
    total: 127,
    thisMonth: 23,
    lastMonth: 18,
    growth: 27.8,
    active: 98,
    churned: 5,
  };
  
  // Email templates state
  const [welcomeEmailSubject, setWelcomeEmailSubject] = useState('Welcome to {{product_name}}!');
  const [welcomeEmailBody, setWelcomeEmailBody] = useState('Hi {{customer_name}},\n\nWelcome to {{product_name}}! We\'re thrilled to have you on board.\n\nGet started by exploring our features and let us know if you have any questions.\n\nBest,\nThe {{product_name}} Team');
  const [receiptEmailSubject, setReceiptEmailSubject] = useState('Your {{product_name}} purchase confirmation');
  const [receiptEmailBody, setReceiptEmailBody] = useState('Hi {{customer_name}},\n\nThank you for your purchase!\n\nOrder Details:\n- Product: {{product_name}}\n- Amount: {{amount}}\n- Date: {{date}}\n\nYou can access your purchase anytime.\n\nBest,\nThe {{product_name}} Team');
  
  // Marketing state
  const [googleAdsId, setGoogleAdsId] = useState('');
  const [googleTagManagerId, setGoogleTagManagerId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [tiktokPixelId, setTiktokPixelId] = useState('');
  
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

  const handleSendAnnouncement = () => {
    if (!announcementTitle || !announcementMessage) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const newAnnouncement = {
      id: Date.now().toString(),
      title: announcementTitle,
      message: announcementMessage,
      type: announcementType,
      date: new Date().toISOString().split('T')[0],
      active: true,
    };
    
    setAnnouncements([newAnnouncement, ...announcements]);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    toast.success('Announcement sent to all customers!');
  };

  const toggleAnnouncementActive = (id: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'announcements':
        return (
          <div className="space-y-6">
            {/* Create Announcement */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">Send Announcement</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Send in-app notifications to all your customers.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Announcement Type</Label>
                  <div className="flex gap-2">
                    {(['info', 'success', 'warning'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAnnouncementType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                          announcementType === type
                            ? type === 'info' ? 'bg-blue-500 text-white'
                            : type === 'success' ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="announcement-title">Title</Label>
                  <Input 
                    id="announcement-title"
                    placeholder="New Feature Available!"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="announcement-message">Message</Label>
                  <Textarea 
                    id="announcement-message"
                    placeholder="We've just launched an exciting new feature that you'll love..."
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button 
                  onClick={handleSendAnnouncement} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to All Customers
                </Button>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Recent Announcements</h3>
                </div>
                <span className="text-sm text-muted-foreground">{announcements.length} total</span>
              </div>
              
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className={`p-4 rounded-lg border ${
                      announcement.active ? 'border-border bg-muted/30' : 'border-border/50 bg-muted/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            announcement.type === 'info' ? 'bg-blue-500/20 text-blue-600'
                            : announcement.type === 'success' ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-amber-500/20 text-amber-600'
                          }`}>
                            {announcement.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{announcement.date}</span>
                        </div>
                        <h4 className="font-medium text-sm">{announcement.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                      </div>
                      <Switch 
                        checked={announcement.active} 
                        onCheckedChange={() => toggleAnnouncementActive(announcement.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            {/* Customer Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl border-2 border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-3xl font-bold">{customerStats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl border-2 border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New This Month</p>
                    <p className="text-3xl font-bold">{customerStats.thisMonth}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl border-2 border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-3xl font-bold text-emerald-500">+{customerStats.growth}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Breakdown */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Customer Breakdown</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Customers</p>
                      <p className="text-2xl font-bold text-emerald-600">{customerStats.active}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(customerStats.active / customerStats.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Churned</p>
                      <p className="text-2xl font-bold text-muted-foreground">{customerStats.churned}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-muted-foreground/50 rounded-full"
                      style={{ width: `${(customerStats.churned / customerStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Monthly Comparison</h3>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold">{customerStats.thisMonth}</p>
                    <span className="text-sm text-emerald-500 pb-1">new signups</span>
                  </div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Last Month</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-muted-foreground">{customerStats.lastMonth}</p>
                    <span className="text-sm text-muted-foreground pb-1">signups</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email-templates':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Customize the emails sent to your customers. Use variables like {'{{customer_name}}'}, {'{{product_name}}'}, {'{{amount}}'}, and {'{{date}}'}.
            </p>

            {/* Welcome Email */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">Welcome Email</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Sent when a new customer signs up.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-subject">Subject Line</Label>
                  <Input 
                    id="welcome-subject"
                    value={welcomeEmailSubject}
                    onChange={(e) => setWelcomeEmailSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcome-body">Email Body</Label>
                  <Textarea 
                    id="welcome-body"
                    value={welcomeEmailBody}
                    onChange={(e) => setWelcomeEmailBody(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Save Template
                </Button>
              </div>
            </div>

            {/* Receipt Email */}
            <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Purchase Receipt</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Sent after a successful purchase.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt-subject">Subject Line</Label>
                  <Input 
                    id="receipt-subject"
                    value={receiptEmailSubject}
                    onChange={(e) => setReceiptEmailSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receipt-body">Email Body</Label>
                  <Textarea 
                    id="receipt-body"
                    value={receiptEmailBody}
                    onChange={(e) => setReceiptEmailBody(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                
                <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        );

      case 'marketing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Google Ads Tag */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <SiGoogle className="h-5 w-5 text-[#FBBC05]" />
                  <h3 className="font-semibold">Google Ads Tag</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Ads Tag account to track conversions and optimize your advertising campaigns. This integration allows you to measure the ROI of your ads.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="google-ads-id">Google Ads ID</Label>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="google-ads-id"
                    placeholder="AW-1234567890"
                    value={googleAdsId}
                    onChange={(e) => setGoogleAdsId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>

              {/* Google Tag Manager */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#246FDB] rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <h3 className="font-semibold">Google Tag Manager</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integrate Google Tag Manager to track conversions and optimize your advertising campaigns through multiple tags. This integration allows you to measure the ROI of your ads.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="gtm-id">Google Tag Manager ID</Label>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="gtm-id"
                    placeholder="GTM-XXXXXXX"
                    value={googleTagManagerId}
                    onChange={(e) => setGoogleTagManagerId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>

              {/* Meta Pixel */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <SiMeta className="h-5 w-5 text-[#0081FB]" />
                  <h3 className="font-semibold">Meta Pixel</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integrate Meta Pixel to track visitor activity on your website, measure the effectiveness of your Facebook and Instagram ads, and build targeted audiences for future ads.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="meta-pixel">Meta Pixel ID</Label>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="meta-pixel"
                    placeholder="123456789012345"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>

              {/* Meta Conversions API */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <SiMeta className="h-5 w-5 text-[#0081FB]" />
                  <h3 className="font-semibold">Meta Conversions API</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure the Facebook Access Token for server-side event tracking via the Conversions API. This enables better tracking accuracy and deduplication between client and server events.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="meta-access-token">Facebook Access Token</Label>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="meta-access-token"
                    placeholder="EAABsbCS1iHgBO7jZCZBpR8..."
                    value={metaAccessToken}
                    onChange={(e) => setMetaAccessToken(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Save
                </Button>
              </div>

              {/* TikTok Pixel */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <SiTiktok className="h-5 w-5" />
                  <h3 className="font-semibold">TikTok Pixel</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add the TikTok Pixel to your website to track visitor actions, measure the effectiveness of your TikTok ads, and build custom audiences for retargeting.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="tiktok-pixel">TikTok Pixel ID</Label>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="tiktok-pixel"
                    placeholder="C3ABCDEFGHIJKLMNOPQRST"
                    value={tiktokPixelId}
                    onChange={(e) => setTiktokPixelId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
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
        <h2 className="text-2xl font-bold text-foreground">Account</h2>
        <p className="text-muted-foreground mt-1">Manage your white-label app and customers</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
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
