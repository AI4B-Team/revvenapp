import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Scale,
  Shield,
  FileText,
  Cookie,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface LegalSectionProps {
  productName?: string;
}

interface LegalDocument {
  id: string;
  title: string;
  icon: React.ElementType;
  enabled: boolean;
  content: string;
  lastUpdated: string;
}

const defaultLegalDocs: LegalDocument[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: FileText,
    enabled: true,
    content: `1. ACCEPTANCE OF TERMS
By accessing and using this platform, you accept and agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
Our platform provides AI-powered tools and automation features designed to help businesses grow and optimize their operations.

3. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.

4. PAYMENT TERMS
Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in our refund policy.

5. ACCEPTABLE USE
You agree not to use the service for any unlawful purpose or in any way that could damage, disable, or impair the service.

6. INTELLECTUAL PROPERTY
All content, features, and functionality of the service are owned by us and are protected by international copyright, trademark, and other intellectual property laws.

7. LIMITATION OF LIABILITY
We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.

8. MODIFICATIONS
We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.`,
    lastUpdated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: Shield,
    enabled: true,
    content: `1. INFORMATION WE COLLECT
We collect information you provide directly, such as account details, payment information, and usage data.

2. HOW WE USE YOUR INFORMATION
We use collected information to provide and improve our services, process transactions, and communicate with you about updates and offers.

3. DATA SECURITY
We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure.

4. THIRD-PARTY SERVICES
We may share information with trusted third-party service providers who assist us in operating our platform and serving you.

5. COOKIES AND TRACKING
We use cookies and similar technologies to enhance your experience and gather usage analytics.

6. YOUR RIGHTS
You have the right to access, correct, or delete your personal data. Contact us to exercise these rights.

7. DATA RETENTION
We retain your data for as long as your account is active or as needed to provide services and comply with legal obligations.

8. CONTACT US
For privacy-related inquiries, please contact our privacy team through the support channels.`,
    lastUpdated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    icon: Scale,
    enabled: true,
    content: `1. MONEY-BACK GUARANTEE
We offer a 14-day money-back guarantee on all subscription plans. If you're not satisfied, request a full refund within 14 days of purchase.

2. ELIGIBILITY
Refunds are available for first-time subscribers who have not previously received a refund from us.

3. HOW TO REQUEST
To request a refund, contact our support team with your account email and reason for the refund request.

4. PROCESSING TIME
Refunds are typically processed within 5-10 business days and will be credited to your original payment method.

5. PARTIAL REFUNDS
After the 14-day period, we may offer partial refunds on a case-by-case basis for annual subscriptions.

6. NON-REFUNDABLE ITEMS
Setup fees, custom development work, and add-on purchases are non-refundable.

7. SUBSCRIPTION CANCELLATION
You may cancel your subscription at any time. Access continues until the end of the current billing period.`,
    lastUpdated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    icon: Cookie,
    enabled: true,
    content: `1. WHAT ARE COOKIES
Cookies are small text files stored on your device when you visit our platform.

2. TYPES OF COOKIES WE USE
- Essential Cookies: Required for basic platform functionality
- Analytics Cookies: Help us understand how visitors interact with our platform
- Preference Cookies: Remember your settings and preferences
- Marketing Cookies: Used to deliver relevant advertisements

3. MANAGING COOKIES
You can control cookies through your browser settings. Disabling certain cookies may limit functionality.

4. THIRD-PARTY COOKIES
Some cookies are placed by third-party services that appear on our pages, such as analytics providers.

5. COOKIE CONSENT
By continuing to use our platform, you consent to our use of cookies as described in this policy.

6. UPDATES
We may update this cookie policy periodically. Check back for the latest information.`,
    lastUpdated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  }
];

export function LegalSection({ productName = 'Your App' }: LegalSectionProps) {
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>(defaultLegalDocs);
  const [expandedDoc, setExpandedDoc] = useState<string | null>('terms');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Your Company Name');
  const [companyEmail, setCompanyEmail] = useState('legal@yourcompany.com');
  const [companyAddress, setCompanyAddress] = useState('123 Business Street, City, Country');
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [requireAgeVerification, setRequireAgeVerification] = useState(false);

  const toggleDocEnabled = (id: string) => {
    setLegalDocs(docs => docs.map(doc => 
      doc.id === id ? { ...doc, enabled: !doc.enabled } : doc
    ));
  };

  const updateDocContent = (id: string, content: string) => {
    setLegalDocs(docs => docs.map(doc => 
      doc.id === id ? { ...doc, content, lastUpdated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) } : doc
    ));
  };

  const handleGenerateWithAI = async (docId: string) => {
    setIsGenerating(docId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const doc = legalDocs.find(d => d.id === docId);
    if (doc) {
      const updatedContent = doc.content.replace(/Your Company Name/g, companyName)
        .replace(/\[Company Name\]/g, companyName)
        .replace(/\[Platform Name\]/g, productName);
      updateDocContent(docId, updatedContent);
    }
    
    setIsGenerating(null);
    toast.success(`${legalDocs.find(d => d.id === docId)?.title} updated with AI!`);
  };

  const handleSave = () => {
    toast.success('Legal documents saved!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Legal & Compliance</h2>
        <p className="text-muted-foreground mt-1">
          Configure legal documents and compliance settings for your platform
        </p>
      </div>

      {/* Company Information */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Company Information</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          This information will be used across all legal documents
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Inc."
            />
          </div>
          <div className="space-y-2">
            <Label>Legal Email</Label>
            <Input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="legal@company.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Business Address</Label>
          <Input
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="123 Business Street, City, State, Country"
          />
        </div>
      </div>

      {/* Compliance Settings */}
      <div className="p-6 rounded-xl border-2 border-border bg-card space-y-4">
        <h3 className="font-semibold text-foreground">Compliance Settings</h3>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <Cookie className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Cookie Consent Banner</p>
              <p className="text-sm text-muted-foreground">Show GDPR-compliant cookie notice</p>
            </div>
          </div>
          <Switch checked={showCookieBanner} onCheckedChange={setShowCookieBanner} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-foreground">Age Verification</p>
              <p className="text-sm text-muted-foreground">Require users to confirm they are 18+</p>
            </div>
          </div>
          <Switch checked={requireAgeVerification} onCheckedChange={setRequireAgeVerification} />
        </div>
      </div>

      {/* Legal Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Legal Documents</h3>
          <span className="text-sm text-muted-foreground">
            {legalDocs.filter(d => d.enabled).length} of {legalDocs.length} Enabled
          </span>
        </div>

        {legalDocs.map((doc) => {
          const Icon = doc.icon;
          const isExpanded = expandedDoc === doc.id;

          return (
            <div 
              key={doc.id}
              className={`rounded-xl border-2 transition-all ${
                doc.enabled ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              {/* Document Header */}
              <div 
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  doc.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">{doc.title}</span>
                  <p className="text-xs text-muted-foreground">Last Updated: {doc.lastUpdated}</p>
                </div>
                
                <Switch
                  checked={doc.enabled}
                  onCheckedChange={() => toggleDocEnabled(doc.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Document Content Editor */}
              {isExpanded && doc.enabled && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  <Textarea
                    value={doc.content}
                    onChange={(e) => updateDocContent(doc.id, e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleGenerateWithAI(doc.id)}
                      disabled={isGenerating === doc.id}
                      className="gap-2"
                    >
                      {isGenerating === doc.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Customize With AI
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      AI will personalize this document with your company details
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Important Notice */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Legal Disclaimer</p>
          <p className="text-sm text-muted-foreground mt-1">
            These templates are provided as a starting point. We recommend having a legal professional review 
            all documents before publishing to ensure compliance with local laws and regulations.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          Save Legal Settings
        </Button>
      </div>
    </div>
  );
}
