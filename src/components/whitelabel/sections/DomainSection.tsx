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
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>(
    license?.domainSettings?.customDomain ? 'custom' : 'subdomain'
  );

  const subdomainUrl = `https://${subdomain}.revven.app`;

  const handleSave = () => {
    onUpdate({ 
      subdomain, 
      customDomain: domainType === 'custom' ? customDomain : undefined 
    });
    toast.success('Domain settings saved!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choose Your Domain</h2>
        <p className="text-muted-foreground mt-1">Your app's home on the internet</p>
      </div>

      {/* Subdomain Option */}
      <div 
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
          domainType === 'subdomain' 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-card hover:border-muted-foreground/50'
        }`}
        onClick={() => setDomainType('subdomain')}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Input 
                value={subdomain} 
                onChange={(e) => {
                  e.stopPropagation();
                  setSubdomain(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1"
                placeholder="your-subdomain"
              />
              {domainType === 'subdomain' && (
                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
              )}
              <span className="text-muted-foreground bg-muted px-3 py-2 rounded-md text-sm font-medium shrink-0">.revven.app</span>
            </div>
          </div>
        </div>
        
        {domainType === 'subdomain' && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <a 
              href={subdomainUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-4 w-4" /> 
              {subdomainUrl}
            </a>
          </div>
        )}
      </div>

      {/* Custom Domain Option */}
      <div className="space-y-3">
        <div 
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            domainType === 'custom' 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-card hover:border-muted-foreground/50'
          } ${!canUseCustomDomain ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={() => canUseCustomDomain && setDomainType('custom')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Use My Own Domain</span>
            </div>
            <div className="flex items-center gap-2">
              {!canUseCustomDomain && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Premium
                </span>
              )}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                domainType === 'custom' ? 'border-primary bg-primary' : 'border-muted-foreground/50'
              }`}>
                {domainType === 'custom' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          </div>
        </div>

        {domainType === 'custom' && canUseCustomDomain && (
          <div className="space-y-3">
            <Input 
              value={customDomain} 
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="yourdomain.com"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground text-center">
              Custom domains require a paid plan. You can set this up later.
            </p>
          </div>
        )}
      </div>

      {/* DNS Instructions - Only show when custom domain is selected and has a value */}
      {domainType === 'custom' && customDomain && canUseCustomDomain && (
        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
          <h4 className="font-medium text-foreground">DNS Configuration</h4>
          <p className="text-sm text-muted-foreground">
            Point your domain's DNS records to REVVEN:
          </p>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <span className="text-muted-foreground">Type:</span>
              <span className="text-foreground">A</span>
              <span className="text-muted-foreground ml-4">Value:</span>
              <span className="text-foreground">185.158.133.1</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <span className="text-muted-foreground">Type:</span>
              <span className="text-foreground">CNAME</span>
              <span className="text-muted-foreground ml-4">Value:</span>
              <span className="text-foreground">revven.app</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Domain Settings
        </Button>
      </div>
    </div>
  );
}
