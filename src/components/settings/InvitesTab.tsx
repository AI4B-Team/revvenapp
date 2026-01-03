import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Infinity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function InvitesTab() {
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load existing invite codes
  useEffect(() => {
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    // TODO: Replace with actual API call
    // Mock data for demo
    setInviteCodes([
      {
        id: '1',
        code: 'WBHUUMEC',
        uses: 0,
        maxUses: 1,
        status: 'Active',
        createdAt: '10/30/2025',
        isActive: true
      },
      {
        id: '2',
        code: 'DAZUPL09',
        uses: 1,
        maxUses: 1,
        status: 'Used',
        createdAt: '10/30/2025',
        isActive: false
      }
    ]);
  };

  const generateInviteCode = async () => {
    setIsGenerating(true);

    // Generate unique 8-character code
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newCode = {
      id: Date.now().toString(),
      code: randomCode,
      uses: 0,
      maxUses: 1,
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-US'),
      isActive: true
    };

    setInviteCodes([newCode, ...inviteCodes]);
    // Sync with invite modal
    localStorage.setItem('latestInviteCode', randomCode);
    setIsGenerating(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Exclusive Invites</h2>
        <p className="text-muted-foreground">
          Share the magic with your inner circle
        </p>
      </div>

      {/* Available Invites Card */}
      <div className="bg-gradient-to-br from-sidebar-background to-sidebar-active rounded-2xl p-12 mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-blue/20 rounded-2xl mb-6">
          <Infinity className="w-12 h-12 text-brand-blue" strokeWidth={2.5} />
        </div>
        
        <h3 className="text-xl font-semibold text-sidebar-text mb-2">Available Invites</h3>
        <p className="text-sidebar-text-muted mb-8">Unlimited invites to share</p>
        
        <Button
          onClick={generateInviteCode}
          disabled={isGenerating}
          className="bg-gradient-to-r from-brand-purple via-brand-red to-brand-red hover:opacity-90 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg h-auto"
        >
          {isGenerating ? 'Generating...' : 'Generate Invite Code'}
        </Button>
      </div>

      {/* Your Invite Codes */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-border">
          <h3 className="text-2xl font-bold text-foreground">Your Invite Codes</h3>
          <p className="text-muted-foreground mt-1">Share these codes with people you trust</p>
        </div>

        {inviteCodes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Infinity className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-6">
              No invite codes yet. Generate your first one above!
            </p>
            <Button
              onClick={generateInviteCode}
              className="bg-gradient-to-r from-brand-purple via-brand-red to-brand-red hover:opacity-90 text-white"
            >
              Generate Your First Code
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Code</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Uses</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Created</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {inviteCodes.map((invite, index) => (
                  <tr
                    key={invite.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index === inviteCodes.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    {/* Code */}
                    <td className="px-8 py-5">
                      <code className="text-lg font-bold text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-lg">
                        {invite.code}
                      </code>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5">
                      <Badge
                        variant={invite.status === 'Active' ? 'default' : 'secondary'}
                        className={
                          invite.status === 'Active'
                            ? 'bg-brand-blue/20 text-brand-blue hover:bg-brand-blue/30'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {invite.status}
                      </Badge>
                    </td>

                    {/* Uses */}
                    <td className="px-8 py-5">
                      <span className="text-foreground font-medium">
                        {invite.uses} / {invite.maxUses}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-8 py-5">
                      <span className="text-muted-foreground">{invite.createdAt}</span>
                    </td>

                    {/* Action */}
                    <td className="px-8 py-5">
                      <Button
                        onClick={() => copyToClipboard(invite.code)}
                        variant="ghost"
                        size="sm"
                        className="text-foreground hover:text-foreground hover:bg-muted"
                      >
                        {copiedCode === invite.code ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-brand-green" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Infinity className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">How Invite Codes Work</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Each code can be used once by a new user during signup</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Share your invite link or code directly with friends</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You have unlimited invites available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
