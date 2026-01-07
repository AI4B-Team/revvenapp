import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="w-full px-6 py-4 flex items-center gap-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <RevvenLogo />
          <span className="text-lg font-bold text-foreground tracking-tight">REVVEN</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">Last updated: January 7, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>REVVEN ("we," "us," "our," or the "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered content creation platform and related services (collectively, the "Service").</p>
            <p>By using the Service, you consent to the data practices described in this Privacy Policy. If you do not agree with these practices, please do not use the Service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-foreground">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password, profile picture, and invite code when you register</li>
              <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by our payment processors)</li>
              <li><strong>User Content:</strong> Images, videos, audio files, text, prompts, and other content you upload or create using the Service</li>
              <li><strong>Communications:</strong> Messages, feedback, and support requests you send to us</li>
              <li><strong>Preferences:</strong> Your settings, customizations, and feature preferences</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Features used, content generated, interactions with the Service, timestamps, and frequency of use</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, IP address, and screen resolution</li>
              <li><strong>Cookies and Tracking:</strong> Session cookies, persistent cookies, and similar technologies to enhance your experience</li>
              <li><strong>Log Data:</strong> Server logs including access times, pages viewed, and referring URLs</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground">2.3 Information from Third Parties</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Social Login:</strong> If you sign in via Google or other OAuth providers, we receive your name, email, and profile picture</li>
              <li><strong>Integrated Services:</strong> Data from third-party services you connect to your account (social media platforms, cloud storage, etc.)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain the Service</li>
              <li>Process your transactions and manage your subscriptions</li>
              <li>Generate AI-powered content based on your prompts and inputs</li>
              <li>Personalize and improve your experience</li>
              <li>Communicate with you about updates, security alerts, and support</li>
              <li>Send promotional communications (with your consent, where required)</li>
              <li>Analyze usage patterns to improve our Service and develop new features</li>
              <li>Train and improve our AI models (see Section 4 for details)</li>
              <li>Detect, prevent, and address fraud, abuse, and security issues</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. AI Training and Content Processing</h2>
            <p><strong>How Your Content is Processed:</strong> When you use our AI features, your prompts and inputs are sent to AI processing systems to generate outputs. This processing is necessary to provide the Service.</p>
            <p><strong>AI Model Training:</strong> We may use aggregated, de-identified data derived from user interactions to improve our AI models and Service quality. We do NOT use your specific User Content or Generated Content to train AI models without your explicit opt-in consent.</p>
            <p><strong>Third-Party AI Providers:</strong> Some AI features are powered by third-party providers who process data according to their own privacy policies. We select providers with strong privacy commitments and enter into data processing agreements with them.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Information Sharing and Disclosure</h2>
            <p>We do NOT sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With vendors who perform services on our behalf (cloud hosting, payment processing, analytics, customer support)</li>
              <li><strong>AI Processing Partners:</strong> With third-party AI providers to deliver AI-powered features</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, court order, or to protect our rights and safety</li>
              <li><strong>With Your Consent:</strong> When you authorize sharing with specific third parties</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide the Service. Specifically:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Data:</strong> Retained until you delete your account</li>
              <li><strong>User Content:</strong> Retained until you delete it or your account, plus a reasonable backup period</li>
              <li><strong>Generated Content:</strong> Stored according to your plan limits and retention settings</li>
              <li><strong>Usage Logs:</strong> Typically retained for 12-24 months for analytics and security purposes</li>
              <li><strong>Payment Records:</strong> Retained as required by tax and financial regulations (typically 7 years)</li>
            </ul>
            <p>After account deletion, we may retain anonymized data for research and analytics purposes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit (TLS/SSL) and at rest (AES-256)</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Employee training on data protection practices</li>
              <li>Incident response procedures</li>
            </ul>
            <p>However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security, and you use the Service at your own risk.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
              <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            </ul>
            <p>To exercise these rights, please contact us at privacy@revven.ai. We will respond within 30 days (or as required by applicable law).</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">9. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep you logged in and remember your preferences</li>
              <li>Understand how you use the Service</li>
              <li>Personalize your experience</li>
              <li>Analyze Service performance and improve features</li>
            </ul>
            <p>You can control cookies through your browser settings. Disabling certain cookies may limit functionality of the Service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">10. International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have different data protection laws. We ensure appropriate safeguards are in place for such transfers, including Standard Contractual Clauses where required.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">11. Children's Privacy</h2>
            <p>The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child under 18, we will take steps to delete that information promptly.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">12. California Privacy Rights (CCPA)</h2>
            <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to know what personal information is collected, used, shared, or sold</li>
              <li>The right to delete personal information held by us</li>
              <li>The right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">13. European Privacy Rights (GDPR)</h2>
            <p>If you are in the European Economic Area (EEA), UK, or Switzerland, you have rights under the General Data Protection Regulation (GDPR) including access, rectification, erasure, restriction, portability, and objection. Our legal bases for processing include contract performance, legitimate interests, legal obligations, and consent where applicable.</p>
            <p>For GDPR inquiries or to contact our Data Protection Officer, email: dpo@revven.ai</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">14. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will provide additional notice via email or in-app notification.</p>
            <p>We encourage you to review this Privacy Policy periodically.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">15. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <p>Email: privacy@revven.ai</p>
            <p>For data subject access requests: dsar@revven.ai</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
