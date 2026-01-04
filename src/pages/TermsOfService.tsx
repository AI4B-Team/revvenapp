import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';

const TermsOfService = () => {
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">Last updated: January 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing and using REVVEN, you accept and agree to be bound by the terms and provisions of this agreement.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Use License</h2>
            <p>Permission is granted to temporarily use REVVEN for personal, non-commercial transitory viewing only.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Disclaimer</h2>
            <p>The materials on REVVEN are provided on an 'as is' basis. REVVEN makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Limitations</h2>
            <p>In no event shall REVVEN or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use REVVEN.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Contact</h2>
            <p>If you have any questions about these Terms, please contact us.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
