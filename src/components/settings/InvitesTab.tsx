import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Infinity, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteCode {
  id: string;
  code: string;
  is_used: boolean;
  used_at: string | null;
  used_by_email: string | null;
  used_by_name: string | null;
  created_at: string;
}

export default function InvitesTab() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing invite codes
  useEffect(() => {
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('creator_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invite codes:', error);
        toast.error('Failed to load invite codes');
      } else {
        setInviteCodes(data || []);
      }
    } catch (err) {
      console.error('Error loading invite codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = async () => {
    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to generate invite codes');
        setIsGenerating(false);
        return;
      }

      // Generate unique 8-character code
      const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data, error } = await supabase
        .from('invite_codes')
        .insert({
          code: randomCode,
          creator_user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invite code:', error);
        toast.error('Failed to generate invite code');
      } else if (data) {
        setInviteCodes([data, ...inviteCodes]);
        toast.success('Invite code generated!');
        // Sync with invite modal
        localStorage.setItem('latestInviteCode', randomCode);
      }
    } catch (err) {
      console.error('Error generating invite code:', err);
      toast.error('Failed to generate invite code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyLink = (code: string) => {
    const shareUrl = `${window.location.origin}/signup?invite=${code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(code);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <p className="text-muted-foreground mt-1">Each code can only be used once</p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading invite codes...</p>
          </div>
        ) : inviteCodes.length === 0 ? (
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
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Signed Up User</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Created</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
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
                        variant={invite.is_used ? 'secondary' : 'default'}
                        className={
                          invite.is_used
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-brand-blue/20 text-brand-blue hover:bg-brand-blue/30'
                        }
                      >
                        {invite.is_used ? 'Used' : 'Active'}
                      </Badge>
                    </td>

                    {/* Signed Up User */}
                    <td className="px-8 py-5">
                      {invite.is_used && (invite.used_by_name || invite.used_by_email) ? (
                        <div>
                          <span className="text-foreground font-medium block">
                            {invite.used_by_name || 'Unknown'}
                          </span>
                          {invite.used_by_email && (
                            <span className="text-sm text-muted-foreground">{invite.used_by_email}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-8 py-5">
                      <span className="text-muted-foreground">{formatDate(invite.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyCode(invite.code)}
                          variant="ghost"
                          size="sm"
                          className="text-foreground hover:text-foreground hover:bg-muted"
                          disabled={invite.is_used}
                        >
                          {copiedCode === invite.code ? (
                            <>
                              <Check className="w-4 h-4 mr-2 text-brand-green" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Code
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => copyLink(invite.code)}
                          variant="ghost"
                          size="sm"
                          className="text-foreground hover:text-foreground hover:bg-muted"
                          disabled={invite.is_used}
                        >
                          {copiedLink === invite.code ? (
                            <>
                              <Check className="w-4 h-4 mr-2 text-brand-green" />
                              Copied
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Link
                            </>
                          )}
                        </Button>
                      </div>
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
                <span>Each code can only be used once by a new user during signup</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Share just the code or the full invite link with friends</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You have unlimited invites available to generate</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}