import React, { useState } from 'react';
import { AppLicense } from '@/lib/marketplace/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  ExternalLink, 
  Check, 
  Lock, 
  ArrowRight, 
  HelpCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DomainSectionProps {
  license?: AppLicense;
  onUpdate: (settings: Partial<AppLicense['domainSettings']>) => void;
  canUseCustomDomain?: boolean;
}

type DomainStatus = 'none' | 'pending' | 'verifying' | 'active' | 'failed';

export function DomainSection({ license, onUpdate, canUseCustomDomain = true }: DomainSectionProps) {
  const [subdomain, setSubdomain] = useState(license?.domainSettings?.subdomain || 'myapp');
  const [customDomain, setCustomDomain] = useState(license?.domainSettings?.customDomain || '');
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>(
    license?.domainSettings?.customDomain ? 'custom' : 'subdomain'
  );
  const [domainStatus, setDomainStatus] = useState<DomainStatus>(
    license?.domainSettings?.customDomain ? 'active' : 'none'
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDNSSteps, setShowDNSSteps] = useState(false);

  const subdomainUrl = `https://${subdomain}.revven.app`;

  const handleConnectDomain = async () => {
    if (!customDomain.trim()) {
      toast.error('Please enter a domain name');
      return;
    }
    
    setIsConnecting(true);
    setDomainStatus('verifying');
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDomainStatus('pending');
    setShowDNSSteps(true);
    setIsConnecting(false);
    toast.success('Domain added! Configure your DNS records to complete setup.');
  };

  const handleVerifyDomain = async () => {
    setDomainStatus('verifying');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDomainStatus('active');
    toast.success('Domain verified and active!');
  };

  const handleSave = () => {
    onUpdate({ 
      subdomain, 
      customDomain: domainType === 'custom' ? customDomain : undefined 
    });
    toast.success('Domain settings saved!');
  };

  const getStatusBadge = () => {
    switch (domainStatus) {
      case 'active':
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        );
      case 'verifying':
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <RefreshCw className="h-3 w-3 animate-spin" /> Verifying
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" /> Pending DNS
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <AlertCircle className="h-3 w-3" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Domain Settings</h2>
          <p className="text-muted-foreground mt-1">Connect your custom domain for a fully branded experience</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Setup Guide
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>Learn how to configure DNS records for your custom domain</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Connected Domains Status */}
      <div className="p-4 rounded-xl border-2 border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Your Domains</h3>
          {domainStatus !== 'none' && getStatusBadge()}
        </div>
        
        {domainStatus === 'none' && domainType === 'subdomain' ? (
          <div className="text-center py-6 text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Using REVVEN subdomain</p>
            <a 
              href={subdomainUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              {subdomainUrl} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : domainStatus !== 'none' && customDomain ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{customDomain}</p>
                  <p className="text-xs text-muted-foreground">Custom Domain</p>
                </div>
              </div>
              {domainStatus === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVerifyDomain}
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Verify
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{subdomainUrl}</p>
                  <p className="text-xs text-muted-foreground">Subdomain (Fallback)</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No custom domain connected yet</p>
          </div>
        )}
      </div>

      {/* Subdomain Configuration */}
      <Collapsible defaultOpen={domainType === 'subdomain'}>
        <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                domainType === 'subdomain' ? 'border-primary bg-primary' : 'border-muted-foreground/50'
              }`}>
                {domainType === 'subdomain' && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="font-medium text-foreground">REVVEN Subdomain</span>
              <span className="text-xs text-muted-foreground">(Free)</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Input 
                  value={subdomain} 
                  onChange={(e) => {
                    setSubdomain(e.target.value);
                    setDomainType('subdomain');
                  }}
                  className="flex-1"
                  placeholder="your-subdomain"
                />
                <span className="text-muted-foreground bg-muted px-3 py-2 rounded-md text-sm font-medium shrink-0">.revven.app</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your app will be accessible at {subdomainUrl}
              </p>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Custom Domain Configuration */}
      <Collapsible defaultOpen={domainType === 'custom'}>
        <div className={`rounded-xl border-2 bg-card overflow-hidden ${
          !canUseCustomDomain ? 'border-border opacity-60' : 'border-border'
        }`}>
          <CollapsibleTrigger 
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            disabled={!canUseCustomDomain}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                domainType === 'custom' ? 'border-primary bg-primary' : 'border-muted-foreground/50'
              }`}>
                {domainType === 'custom' && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="font-medium text-foreground">Custom Domain</span>
              {!canUseCustomDomain && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Premium
                </span>
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your own domain for a fully branded experience. Your subdomain will remain active as a fallback.
              </p>
              
              <div className="space-y-2">
                <Input 
                  value={customDomain} 
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setDomainType('custom');
                  }}
                  placeholder="yourdomain.com"
                  className="w-full"
                  disabled={!canUseCustomDomain}
                />
                
                <Button 
                  onClick={handleConnectDomain}
                  disabled={!canUseCustomDomain || isConnecting || !customDomain.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Connecting...
                    </>
                  ) : (
                    <>
                      Connect Domain <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* DNS Instructions */}
              {showDNSSteps && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">Configure Your DNS Records</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Add these records at your domain registrar. Changes may take up to 48 hours to propagate.
                  </p>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center gap-3 p-2 bg-white rounded border border-amber-200">
                      <span className="text-amber-600 font-semibold w-14">A</span>
                      <span className="text-muted-foreground">@</span>
                      <span className="text-foreground ml-auto">185.158.133.1</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded border border-amber-200">
                      <span className="text-amber-600 font-semibold w-14">A</span>
                      <span className="text-muted-foreground">www</span>
                      <span className="text-foreground ml-auto">185.158.133.1</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleVerifyDomain}
                    className="w-full mt-2 gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Check DNS Status
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Domain Settings
        </Button>
      </div>
    </div>
  );
}
