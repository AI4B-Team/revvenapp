import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, ExternalLink, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface DomainSectionProps {
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['domainSettings']>) => void;
  canUseCustomDomain?: boolean;
}

export function DomainSection({ license, onUpdate, canUseCustomDomain = true }: DomainSectionProps) {
  const [subdomain, setSubdomain] = useState(license?.domainSettings?.subdomain || 'myapp');
  const [customDomain, setCustomDomain] = useState(license?.domainSettings?.customDomain || '');

  const subdomainUrl = `https://${subdomain}.revven.app`;

  const handleSave = () => {
    onUpdate({ subdomain, customDomain: customDomain || undefined });
    toast.success('Domain settings saved!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Domain Settings</h2>
        <p className="text-muted-foreground mt-1">Configure where your app is accessible</p>
      </div>

      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">REVVEN Subdomain</h3>
        </div>
        <div className="space-y-2">
          <Label>Subdomain</Label>
          <div className="flex items-center gap-2">
            <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} className="flex-1" />
            <span className="text-muted-foreground">.revven.app</span>
          </div>
        </div>
        <a href={subdomainUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <Globe className="h-4 w-4" /> {subdomainUrl} <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Custom Domain</h3>
          {!canUseCustomDomain && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Premium</span>}
        </div>
        <div className="space-y-2">
          <Label>Your Domain</Label>
          <Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="app.yourdomain.com" disabled={!canUseCustomDomain} />
          <p className="text-xs text-muted-foreground">{canUseCustomDomain ? "Point your domain's DNS to revven.app" : "Upgrade to use custom domains"}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">Save Domain Settings</Button>
      </div>
    </div>
  );
}
