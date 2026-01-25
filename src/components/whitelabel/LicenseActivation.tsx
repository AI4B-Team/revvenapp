import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MarketplaceApp } from '@/lib/marketplace/types';
import { getAppThumbnail } from '@/utils/appThumbnails';
import { 
  Sparkles, 
  Check, 
  Shield, 
  Zap, 
  DollarSign,
  Palette,
  Globe,
  ArrowRight,
  Lock
} from 'lucide-react';

interface LicenseActivationProps {
  app: MarketplaceApp;
  onActivate: () => void;
}

export function LicenseActivation({ app, onActivate }: LicenseActivationProps) {
  const [isActivating, setIsActivating] = useState(false);
  const thumbnail = getAppThumbnail(app.name);

  const handleActivate = () => {
    setIsActivating(true);
    // Simulate activation delay
    setTimeout(() => {
      onActivate();
    }, 1500);
  };

  const benefits = [
    { icon: Palette, title: 'Custom Branding', description: 'Your logo, colors, and identity' },
    { icon: DollarSign, title: 'Set Your Prices', description: 'Control pricing and keep profits' },
    { icon: Globe, title: 'Custom Domain', description: 'Use your own domain name' },
    { icon: Shield, title: 'Full Ownership', description: 'Sell as your own product' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-muted/50 border-2 border-border overflow-hidden flex-shrink-0 shadow-lg">
                {thumbnail ? (
                  <img src={thumbnail} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{app.icon}</div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Activate White-Label License
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Unlock the ability to rebrand and resell <span className="font-semibold text-foreground">{app.name}</span>
          </p>
          <p className="text-muted-foreground text-lg">
            as your own product.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap size={18} className="text-emerald-500" />
            What's Included
          </h3>
          <div className="space-y-3">
            {[
              'Full white-label customization',
              'Custom landing page builder',
              'Flexible pricing controls',
              'Subdomain hosting included',
              'Custom domain support',
              'Integrated checkout system',
              'Revenue tracking dashboard'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check size={12} className="text-emerald-500" />
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activate Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleActivate}
            disabled={isActivating}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
          >
            {isActivating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Activating License...
              </>
            ) : (
              <>
                <Lock size={20} className="mr-2" />
                Activate White-Label License
                <ArrowRight size={20} className="ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            By activating, you agree to our white-label terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
