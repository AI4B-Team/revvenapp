import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Ticket, Check, Loader2, LogOut } from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';

export default function InviteVerificationPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUserEmail(session.user.email || null);
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null);

      // Check if user already has a validated invite code
      const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code_validated')
        .eq('id', session.user.id)
        .single();

      if (profile?.invite_code_validated) {
        navigate('/onboarding-dashboard');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInviteCode = async (code: string) => {
    if (!code || code.length < 6) {
      setInviteCodeValid(null);
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('id, is_used')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !data) {
        setInviteCodeValid(false);
      } else if (data.is_used) {
        setInviteCodeValid(false);
      } else {
        setInviteCodeValid(true);
      }
    } catch (err) {
      setInviteCodeValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInviteCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setInviteCode(upperValue);
    setInviteCodeValid(null);
    
    if (upperValue.length >= 6) {
      validateInviteCode(upperValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: "Invite Code Required",
        description: "Please enter your exclusive invite code to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Validate the invite code
    const { data: codeData, error: codeError } = await supabase
      .from('invite_codes')
      .select('id, is_used')
      .eq('code', inviteCode.toUpperCase())
      .single();

    if (codeError || !codeData) {
      setIsLoading(false);
      setInviteCodeValid(false);
      toast({
        title: "Invalid Invite Code",
        description: "This invite code does not exist. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    if (codeData.is_used) {
      setIsLoading(false);
      setInviteCodeValid(false);
      toast({
        title: "Code Already Used",
        description: "This invite code has already been used. Please request a new one.",
        variant: "destructive",
      });
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsLoading(false);
      navigate('/login');
      return;
    }

    // Mark the invite code as used
    await supabase
      .from('invite_codes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by_email: user.email,
        used_by_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        used_by_user_id: user.id,
      })
      .eq('code', inviteCode.toUpperCase());

    // Update profile to mark invite code as validated
    await supabase
      .from('profiles')
      .update({ invite_code_validated: true })
      .eq('id', user.id);

    setIsLoading(false);
    
    toast({
      title: "Welcome to REVVEN!",
      description: "Your invite code has been verified successfully.",
    });

    navigate('/onboarding-dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Green */}
      <div className="hidden lg:flex flex-1 bg-brand-green p-12 flex-col justify-center relative overflow-hidden">
        <div className="max-w-xl">
          <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
            One More Step!
          </h2>
          <h3 className="text-2xl font-semibold text-white/80 mb-6">
            Enter Your Invite Code to Continue
          </h3>
          <p className="text-white/70 text-lg mb-12 leading-relaxed">
            REVVEN is invite-only to ensure quality for our community. 
            Enter your exclusive invite code to unlock full access.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <Card className="bg-white p-4 rounded-xl shadow-lg border-0">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎟️</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Exclusive Access
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Your invite code grants you full access to all REVVEN features.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-4 rounded-xl shadow-lg border-0">
              <div className="flex items-start gap-3">
                <div className="text-2xl">👥</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Quality Community
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Join a curated community of creators and entrepreneurs.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-4 rounded-xl shadow-lg border-0">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🚀</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    No Code? No Problem!
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Ask a friend or join our waitlist to get an invite code.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
          <div className="absolute inset-0 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Side - Invite Code Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 justify-center">
              <RevvenLogo size={40} />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">REVVEN</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {userName}!
            </h1>
            <p className="text-gray-600">
              Enter your invite code to complete registration
            </p>
            {userEmail && (
              <p className="text-sm text-gray-500 mt-2">
                Signed in as {userEmail}
              </p>
            )}
          </div>

          {/* Invite Code Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                Exclusive Invite Code
                <span className="text-cyan-500">✨ Required</span>
              </label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ENTER YOUR INVITE CODE"
                  value={inviteCode}
                  onChange={(e) => handleInviteCodeChange(e.target.value)}
                  className={`h-14 pl-10 text-lg bg-white text-gray-900 placeholder:text-gray-500 border-2 ${
                    inviteCodeValid === true 
                      ? 'border-green-500 focus:border-green-500' 
                      : inviteCodeValid === false 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-cyan-500'
                  }`}
                  required
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                )}
                {!isValidating && inviteCodeValid === true && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {inviteCodeValid === false && (
                <p className="text-sm text-red-500">
                  Invalid or already used invite code
                </p>
              )}
              {inviteCodeValid === true && (
                <p className="text-sm text-green-600">
                  Valid invite code!
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-600">Access is by invitation only</p>
                <a 
                  href="#waitlist" 
                  className="text-xs text-cyan-500 hover:text-cyan-600 font-medium"
                >
                  No Code? Join Waitlist
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Continue to REVVEN'
              )}
            </Button>

            {/* Sign Out Option */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Sign out and use a different account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
