import { useState } from 'react';
import { Check, X, Zap, Star, Crown, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Free',
      icon: Zap,
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for trying out the platform',
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const,
      popular: false,
      color: 'bg-brand-purple',
      href: '/signup',
    },
    {
      name: 'Starter',
      icon: Star,
      monthlyPrice: 9,
      annualPrice: 7,
      description: 'Great for individuals getting started',
      buttonText: 'Start Free',
      buttonVariant: 'outline' as const,
      popular: false,
      color: 'bg-blue-500',
      href: '/signup?plan=starter',
    },
    {
      name: 'Creator',
      icon: Sparkles,
      monthlyPrice: 59,
      annualPrice: 47,
      description: 'For creators who want to grow faster',
      buttonText: 'Start Free',
      buttonVariant: 'default' as const,
      popular: true,
      color: 'bg-brand-green',
      href: '/signup?plan=creator',
    },
    {
      name: 'Pro',
      icon: Crown,
      monthlyPrice: 119,
      annualPrice: 97,
      description: 'For professionals and teams',
      buttonText: 'Start Free',
      buttonVariant: 'outline' as const,
      popular: false,
      color: 'bg-amber-500',
      href: '/signup?plan=pro',
    },
  ];

  const featureCategories = [
    {
      name: 'Content Creation',
      features: [
        { name: 'AI Image Generation', free: '10/mo', starter: '100/mo', creator: '500/mo', pro: 'Unlimited' },
        { name: 'AI Video Generation', free: '2/mo', starter: '20/mo', creator: '100/mo', pro: 'Unlimited' },
        { name: 'AI Voiceovers', free: '5 min/mo', starter: '60 min/mo', creator: '300 min/mo', pro: 'Unlimited' },
        { name: 'Blog Writer', free: '3 articles', starter: '30/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Social Post Generator', free: '10/mo', starter: '100/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Email Generator', free: false, starter: '50/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Script Writer', free: false, starter: '20/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Ad Copy Writer', free: false, starter: '30/mo', creator: 'Unlimited', pro: 'Unlimited' },
      ],
    },
    {
      name: 'Video Tools',
      features: [
        { name: 'Video Editor', free: true, starter: true, creator: true, pro: true },
        { name: 'AI Influencer Videos', free: false, starter: '5/mo', creator: '50/mo', pro: 'Unlimited' },
        { name: 'Explainer Videos', free: false, starter: '5/mo', creator: '30/mo', pro: 'Unlimited' },
        { name: 'Viral Shorts Creator', free: '3/mo', starter: '30/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'AI Story Videos', free: false, starter: '10/mo', creator: '50/mo', pro: 'Unlimited' },
        { name: 'AutoYT Publishing', free: false, starter: false, creator: true, pro: true },
        { name: 'Video Downloader', free: true, starter: true, creator: true, pro: true },
        { name: '4K Export Quality', free: false, starter: false, creator: true, pro: true },
      ],
    },
    {
      name: 'Audio Tools',
      features: [
        { name: 'Voice Cloning', free: false, starter: '3 voices', creator: '10 voices', pro: 'Unlimited' },
        { name: 'Voice Changer', free: '5 min/mo', starter: '60 min/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Noise Remover', free: true, starter: true, creator: true, pro: true },
        { name: 'Audio Dubber', free: false, starter: '30 min/mo', creator: '180 min/mo', pro: 'Unlimited' },
        { name: 'Transcription', free: '30 min/mo', starter: '180 min/mo', creator: '600 min/mo', pro: 'Unlimited' },
        { name: 'Music Generation', free: false, starter: '10 tracks', creator: '50 tracks', pro: 'Unlimited' },
      ],
    },
    {
      name: 'Image Tools',
      features: [
        { name: 'Background Remover', free: '10/mo', starter: '100/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Image Upscaler', free: '5/mo', starter: '50/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Image Enhancer', free: '5/mo', starter: '50/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'AI Image Styles', free: '5 styles', starter: 'All styles', creator: 'All styles', pro: 'All styles' },
        { name: 'Reference Image Upload', free: true, starter: true, creator: true, pro: true },
      ],
    },
    {
      name: 'Publishing & Automation',
      features: [
        { name: 'Social Media Calendar', free: true, starter: true, creator: true, pro: true },
        { name: 'Auto-Scheduling', free: false, starter: true, creator: true, pro: true },
        { name: 'Multi-Platform Publishing', free: false, starter: '3 platforms', creator: 'All platforms', pro: 'All platforms' },
        { name: 'AI Agents Automation', free: false, starter: false, creator: '3 agents', pro: 'Unlimited' },
        { name: 'Content Recycling', free: false, starter: false, creator: true, pro: true },
        { name: 'Best Time to Post AI', free: false, starter: false, creator: true, pro: true },
      ],
    },
    {
      name: 'eBooks & Documents',
      features: [
        { name: 'eBook Creator', free: '1 ebook', starter: '10 ebooks', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Article Hub', free: '5 articles', starter: '50 articles', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'PDF Export', free: true, starter: true, creator: true, pro: true },
        { name: 'Custom Branding', free: false, starter: false, creator: true, pro: true },
        { name: 'Templates Library', free: '10 templates', starter: 'All templates', creator: 'All templates', pro: 'All templates' },
      ],
    },
    {
      name: 'Brand & Assets',
      features: [
        { name: 'Brand Kit', free: '1 brand', starter: '3 brands', creator: '10 brands', pro: 'Unlimited' },
        { name: 'Asset Storage', free: '500 MB', starter: '5 GB', creator: '50 GB', pro: '500 GB' },
        { name: 'Custom Fonts', free: false, starter: true, creator: true, pro: true },
        { name: 'Brand Voice AI', free: false, starter: false, creator: true, pro: true },
        { name: 'Team Asset Library', free: false, starter: false, creator: false, pro: true },
      ],
    },
    {
      name: 'Monetization',
      features: [
        { name: 'Digital Products Store', free: false, starter: '5 products', creator: '50 products', pro: 'Unlimited' },
        { name: 'Payment Processing', free: false, starter: '5% fee', creator: '2% fee', pro: '0% fee' },
        { name: 'Funnels Builder', free: false, starter: false, creator: '5 funnels', pro: 'Unlimited' },
        { name: 'Lead Generation', free: false, starter: '100 leads/mo', creator: '1000 leads/mo', pro: 'Unlimited' },
        { name: 'Newsletter Tool', free: false, starter: '500 subs', creator: '5000 subs', pro: 'Unlimited' },
        { name: 'Revenue Analytics', free: false, starter: true, creator: true, pro: true },
      ],
    },
    {
      name: 'AI & Intelligence',
      features: [
        { name: 'AI Assistant Chat', free: '50 msgs/mo', starter: '500 msgs/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'SEO Optimizer', free: false, starter: true, creator: true, pro: true },
        { name: 'Content Score', free: true, starter: true, creator: true, pro: true },
        { name: 'AI Model Versus', free: '5/mo', starter: '50/mo', creator: 'Unlimited', pro: 'Unlimited' },
        { name: 'Priority AI Processing', free: false, starter: false, creator: true, pro: true },
        { name: 'Custom AI Training', free: false, starter: false, creator: false, pro: true },
      ],
    },
    {
      name: 'Collaboration & Support',
      features: [
        { name: 'Team Members', free: '1 user', starter: '1 user', creator: '3 users', pro: '10 users' },
        { name: 'Guest Access', free: false, starter: false, creator: true, pro: true },
        { name: 'Comments & Feedback', free: false, starter: true, creator: true, pro: true },
        { name: 'Version History', free: false, starter: '7 days', creator: '30 days', pro: 'Unlimited' },
        { name: 'Priority Support', free: false, starter: false, creator: true, pro: true },
        { name: 'Dedicated Account Manager', free: false, starter: false, creator: false, pro: true },
      ],
    },
    {
      name: 'Integrations & API',
      features: [
        { name: 'Social Media Connections', free: '2 accounts', starter: '5 accounts', creator: '15 accounts', pro: 'Unlimited' },
        { name: 'YouTube Integration', free: false, starter: true, creator: true, pro: true },
        { name: 'Facebook Pages', free: false, starter: true, creator: true, pro: true },
        { name: 'API Access', free: false, starter: false, creator: false, pro: true },
        { name: 'Webhooks', free: false, starter: false, creator: true, pro: true },
        { name: 'White Label', free: false, starter: false, creator: false, pro: true },
      ],
    },
  ];

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All paid plans include a 7-day free trial. No credit card required to start. You can explore all features before committing.',
    },
    {
      question: 'Can I change my plan anytime?',
      answer: 'Absolutely! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately for upgrades, or at the end of your billing cycle for downgrades.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans.',
    },
    {
      question: 'What happens when I exceed my limits?',
      answer: 'We\'ll notify you when you\'re approaching your limits. You can either upgrade your plan or purchase additional credits as needed.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact us within 30 days of purchase for a full refund.',
    },
    {
      question: 'Is there a discount for annual billing?',
      answer: 'Yes! Save up to 20% when you choose annual billing. The prices shown with the annual toggle reflect this discount.',
    },
    {
      question: 'Can I use the content commercially?',
      answer: 'Yes! All content created with our platform is yours to use commercially. This includes AI-generated images, videos, and text content.',
    },
    {
      question: 'Do you offer team or enterprise plans?',
      answer: 'Yes! Our Pro plan supports teams up to 10 users. For larger teams or custom enterprise needs, please contact our sales team.',
    },
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-green-500 mx-auto" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Start For Free. Upgrade When You Need More Power. Cancel Anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Save 20%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              
              return (
                <Card
                  key={plan.name}
                  className={`relative p-6 ${plan.popular ? 'border-2 border-brand-green shadow-lg lg:scale-105' : 'border'}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-green text-white">
                      Most Popular
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${plan.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${price}</span>
                      {price > 0 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="line-through text-muted-foreground/60">${plan.monthlyPrice}/mo</span>
                        {' '}· Billed annually (${price * 12}/year)
                      </p>
                    )}
                    {!isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed monthly
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.description}
                  </p>

                  <Link to={plan.href}>
                    <Button
                      className={`w-full mb-6 ${plan.buttonVariant === 'outline' ? 'border-brand-green text-brand-green hover:bg-brand-green hover:text-white' : 'bg-brand-green hover:bg-brand-green/90 text-white'}`}
                      variant={plan.buttonVariant}
                    >
                      {plan.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>

                  {/* Quick feature highlights */}
                  <ul className="space-y-2 text-sm">
                    {plan.name === 'Free' && (
                      <>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />10 AI images/month</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />2 AI videos/month</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Basic video editor</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />500 MB storage</li>
                      </>
                    )}
                    {plan.name === 'Starter' && (
                      <>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />100 AI images/month</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />20 AI videos/month</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Voice cloning (3 voices)</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />5 GB storage</li>
                      </>
                    )}
                    {plan.name === 'Creator' && (
                      <>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />500 AI images/month</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />100 AI videos/month</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />AI Agents (3 automations)</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />50 GB storage</li>
                      </>
                    )}
                    {plan.name === 'Pro' && (
                      <>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Unlimited AI generation</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />White label & API access</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />10 team members</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />500 GB storage</li>
                      </>
                    )}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Compare All Features</h2>
          <p className="text-muted-foreground text-center mb-12">
            See exactly what you get with each plan
          </p>

          {/* Sticky Header for Desktop */}
          <div className="hidden lg:block sticky top-0 z-10 bg-background border-b mb-0">
            <div className="grid grid-cols-5 gap-4 py-4 px-6">
              <div className="font-semibold">Features</div>
              {plans.map((plan) => (
                <div key={plan.name} className="text-center font-semibold">
                  {plan.name}
                  <div className="text-sm font-normal text-muted-foreground">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}/mo
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Categories */}
          <div className="space-y-8">
            {featureCategories.map((category) => (
              <div key={category.name} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-muted/50 px-6 py-4 border-b">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </div>
                
                <div className="divide-y">
                  {category.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-2 lg:grid-cols-5 gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="col-span-2 lg:col-span-1 flex items-center gap-2">
                        <span className="text-sm">{feature.name}</span>
                      </div>
                      
                      {/* Mobile: Show all plans in grid */}
                      <div className="col-span-2 lg:hidden grid grid-cols-4 gap-2 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Free</div>
                        <div className="text-xs text-muted-foreground mb-1">Starter</div>
                        <div className="text-xs text-muted-foreground mb-1">Creator</div>
                        <div className="text-xs text-muted-foreground mb-1">Pro</div>
                        <div>{renderFeatureValue(feature.free)}</div>
                        <div>{renderFeatureValue(feature.starter)}</div>
                        <div>{renderFeatureValue(feature.creator)}</div>
                        <div>{renderFeatureValue(feature.pro)}</div>
                      </div>

                      {/* Desktop */}
                      <div className="hidden lg:block text-center">
                        {renderFeatureValue(feature.free)}
                      </div>
                      <div className="hidden lg:block text-center">
                        {renderFeatureValue(feature.starter)}
                      </div>
                      <div className="hidden lg:block text-center">
                        {renderFeatureValue(feature.creator)}
                      </div>
                      <div className="hidden lg:block text-center">
                        {renderFeatureValue(feature.pro)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Need a Custom Enterprise Plan?</h3>
                <p className="text-slate-300">
                  For large teams, custom integrations, dedicated support, and volume pricing.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Custom AI model training
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    SLA & priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    SSO & advanced security
                  </li>
                </ul>
              </div>
              <a href="mailto:sales@revven.com?subject=Enterprise%20Plan%20Inquiry">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shrink-0">
                  Contact Sales
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-center mb-12">
            Everything you need to know about our pricing
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-card border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of creators who are already using Revven to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-medium">Revven</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span>© 2026 Revven. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
