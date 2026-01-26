import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plug,
  Calendar,
  CreditCard,
  Mail,
  MessageCircle,
  HelpCircle,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface IntegrationConfig {
  // Scheduling
  calendlyUrl: string;
  calComUrl: string;
  // Payments
  stripePublishableKey: string;
  paypalClientId: string;
  // Email Marketing
  mailchimpApiKey: string;
  convertKitApiKey: string;
  // Chat/Support
  intercomAppId: string;
  crispWebsiteId: string;
}

interface IntegrationsSectionProps {
  integrationConfig?: IntegrationConfig;
  onIntegrationConfigChange?: (config: IntegrationConfig) => void;
}

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  inputLabel: string;
  inputPlaceholder: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
  learnMoreUrl?: string;
}

function IntegrationCard({
  title,
  description,
  icon,
  inputLabel,
  inputPlaceholder,
  value,
  onChange,
  helpText,
  learnMoreUrl,
}: IntegrationCardProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isSaved, setIsSaved] = useState(false);
  const [isEnabled, setIsEnabled] = useState(!!value);

  const handleSave = () => {
    onChange(localValue);
    setIsSaved(true);
    toast.success(`${title} saved!`);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-5 rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-colors flex flex-col h-full min-h-[220px]">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              className="shrink-0"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>

      {isEnabled && (
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-medium">{inputLabel}</Label>
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Input
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={inputPlaceholder}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between mt-auto pt-4">
            {learnMoreUrl && (
              <a 
                href={learnMoreUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Setup Guide
              </a>
            )}
            <Button 
              onClick={handleSave}
              size="sm"
              className={`gap-2 ml-auto ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      )}

      {!isEnabled && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Enable to configure</p>
        </div>
      )}
    </div>
  );
}

export function IntegrationsSection({ integrationConfig, onIntegrationConfigChange }: IntegrationsSectionProps) {
  const [config, setConfig] = useState<IntegrationConfig>(integrationConfig || {
    calendlyUrl: '',
    calComUrl: '',
    stripePublishableKey: '',
    paypalClientId: '',
    mailchimpApiKey: '',
    convertKitApiKey: '',
    intercomAppId: '',
    crispWebsiteId: '',
  });

  const updateConfig = (key: keyof IntegrationConfig, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onIntegrationConfigChange?.(newConfig);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Integrations</h2>
        <p className="text-muted-foreground mt-1">
          Connect third-party services to enhance your landing page and customer experience.
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-foreground">Extend Your Functionality</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add scheduling, payments, email marketing, and live chat to convert more visitors into customers.
          </p>
        </div>
      </div>

      {/* Scheduling Integrations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Scheduling</h3>
        </div>
        <p className="text-sm text-muted-foreground">Let visitors book demos and consultations directly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntegrationCard
            title="Calendly"
            description="Allow visitors to schedule meetings and demos with your team."
            icon={<Calendar className="h-5 w-5" />}
            inputLabel="Calendly URL"
            inputPlaceholder="https://calendly.com/your-link"
            value={config.calendlyUrl}
            onChange={(value) => updateConfig('calendlyUrl', value)}
            helpText="Paste your Calendly scheduling link here"
            learnMoreUrl="https://calendly.com"
          />

          <IntegrationCard
            title="Cal.com"
            description="Open-source scheduling for meetings, appointments, and events."
            icon={<Calendar className="h-5 w-5" />}
            inputLabel="Cal.com URL"
            inputPlaceholder="https://cal.com/your-link"
            value={config.calComUrl}
            onChange={(value) => updateConfig('calComUrl', value)}
            helpText="Paste your Cal.com scheduling link here"
            learnMoreUrl="https://cal.com"
          />
        </div>
      </div>

      {/* Payment Integrations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Payments</h3>
        </div>
        <p className="text-sm text-muted-foreground">Accept payments and manage subscriptions seamlessly.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntegrationCard
            title="Stripe"
            description="Industry-leading payment processing for subscriptions and one-time payments."
            icon={<CreditCard className="h-5 w-5" />}
            inputLabel="Publishable Key"
            inputPlaceholder="pk_live_..."
            value={config.stripePublishableKey}
            onChange={(value) => updateConfig('stripePublishableKey', value)}
            helpText="Find this in your Stripe Dashboard under Developers > API keys"
            learnMoreUrl="https://stripe.com"
          />

          <IntegrationCard
            title="PayPal"
            description="Accept PayPal payments and reach millions of PayPal users worldwide."
            icon={<CreditCard className="h-5 w-5" />}
            inputLabel="Client ID"
            inputPlaceholder="Your PayPal Client ID"
            value={config.paypalClientId}
            onChange={(value) => updateConfig('paypalClientId', value)}
            helpText="Find this in your PayPal Developer Dashboard"
            learnMoreUrl="https://developer.paypal.com"
          />
        </div>
      </div>

      {/* Email Marketing Integrations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Email Marketing</h3>
        </div>
        <p className="text-sm text-muted-foreground">Capture leads and nurture them with automated email sequences.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntegrationCard
            title="Mailchimp"
            description="Build email lists and send automated marketing campaigns."
            icon={<Mail className="h-5 w-5" />}
            inputLabel="API Key"
            inputPlaceholder="Your Mailchimp API Key"
            value={config.mailchimpApiKey}
            onChange={(value) => updateConfig('mailchimpApiKey', value)}
            helpText="Find this in Mailchimp under Account > Extras > API keys"
            learnMoreUrl="https://mailchimp.com"
          />

          <IntegrationCard
            title="ConvertKit"
            description="Email marketing platform designed for creators and online businesses."
            icon={<Mail className="h-5 w-5" />}
            inputLabel="API Key"
            inputPlaceholder="Your ConvertKit API Key"
            value={config.convertKitApiKey}
            onChange={(value) => updateConfig('convertKitApiKey', value)}
            helpText="Find this in ConvertKit Settings > Advanced > API"
            learnMoreUrl="https://convertkit.com"
          />
        </div>
      </div>

      {/* Chat/Support Integrations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Chat & Support</h3>
        </div>
        <p className="text-sm text-muted-foreground">Engage visitors with live chat and automated support.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntegrationCard
            title="Intercom"
            description="Customer messaging platform with live chat and automated support."
            icon={<MessageCircle className="h-5 w-5" />}
            inputLabel="App ID"
            inputPlaceholder="Your Intercom App ID"
            value={config.intercomAppId}
            onChange={(value) => updateConfig('intercomAppId', value)}
            helpText="Find this in Intercom Settings > Installation"
            learnMoreUrl="https://intercom.com"
          />

          <IntegrationCard
            title="Crisp"
            description="All-in-one customer messaging with chat, helpdesk, and knowledge base."
            icon={<MessageCircle className="h-5 w-5" />}
            inputLabel="Website ID"
            inputPlaceholder="Your Crisp Website ID"
            value={config.crispWebsiteId}
            onChange={(value) => updateConfig('crispWebsiteId', value)}
            helpText="Find this in Crisp Settings > Website Settings"
            learnMoreUrl="https://crisp.chat"
          />
        </div>
      </div>

      {/* Documentation Link */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">Need Help Setting Up?</p>
          <p className="text-sm text-muted-foreground">View our documentation for step-by-step integration guides.</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <ExternalLink className="h-4 w-4" />
          View Docs
        </Button>
      </div>
    </div>
  );
}
