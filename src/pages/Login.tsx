import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Session } from '@supabase/supabase-js';
import RevvenLogo from '@/components/RevvenLogo';
import AuthShowcase from '@/components/auth/AuthShowcase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkInviteCodeValidation = async (userId: string): Promise<boolean> => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code_validated')
        .eq('id', userId)
        .single();
      
      return profile?.invite_code_validated === true;
    };

    const handleAuthRedirect = async (session: Session) => {
      const isValidated = await checkInviteCodeValidation(session.user.id);
      if (isValidated) {
        navigate('/onboarding-dashboard');
      } else {
        navigate('/invite-verification');
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Defer to avoid Supabase deadlock
          setTimeout(() => {
            handleAuthRedirect(session);
          }, 0);
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        handleAuthRedirect(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      setSession(null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate invite code is provided
    if (!inviteCode.trim()) {
      toast({
        title: "Invite Code Required",
        description: "Please enter your exclusive invite code to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    // Validate that the invite code exists and is not already used
    const { data: codeData, error: codeError } = await supabase
      .from('invite_codes')
      .select('id, is_used')
      .eq('code', inviteCode.toUpperCase())
      .single();

    if (codeError || !codeData) {
      setIsLoading(false);
      toast({
        title: "Invalid Invite Code",
        description: "This invite code does not exist. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    if (codeData.is_used) {
      setIsLoading(false);
      toast({
        title: "Code Already Used",
        description: "This invite code has already been used. Please request a new one.",
        variant: "destructive",
      });
      return;
    }

    // Proceed with signup
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding-dashboard`,
        data: {
          full_name: fullName,
          invite_code: inviteCode,
        }
      }
    });

    if (error) {
      setIsLoading(false);
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Upload avatar if provided
    let avatarUrl = '';
    if (avatarFile && authData.user) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${authData.user.id}/avatar.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        avatarUrl = publicUrl;

        // Update user metadata with avatar URL
        await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl }
        });

        // Update profile with avatar URL
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', authData.user.id);
      }
    }

    // Mark the invite code as used and store the new user's info
    await supabase
      .from('invite_codes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by_email: email,
        used_by_name: fullName,
        used_by_user_id: authData.user?.id,
      })
      .eq('code', inviteCode.toUpperCase());

    // Mark the user's invite code as validated in their profile
    if (authData.user) {
      await supabase
        .from('profiles')
        .update({ invite_code_validated: true })
        .eq('id', authData.user.id);
    }

    setIsLoading(false);
    toast({
      title: "Success!",
      description: "Your account has been created. You can now sign in.",
    });
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/invite-verification`,
      }
    });

    if (error) {
      toast({
        title: "Error with Google sign in",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Shared Auth Showcase */}
      <AuthShowcase />

      {/* Right Side - Login Form */}
      <div className="flex-1 min-h-0 bg-white flex flex-col">
        {/* Fixed Login / Sign Up Toggle Tabs */}
        <div className="flex-shrink-0 p-8 pb-0">
          <div className="max-w-md mx-auto">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  !isSignUp 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  isSignUp 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-6">
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-md">

          {/* Logout Button - Shows when user is logged in */}
          {session && (
            <div className="mb-8 flex flex-col items-center gap-4">
              <p className="text-gray-600">You are already logged in</p>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full max-w-xs"
              >
                Log Out
              </Button>
            </div>
          )}

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Start Automating Your Business In Under 10 Minutes' : 'Please Enter Your Details'}
            </p>
          </div>

          {/* Login/Signup Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {/* Full Name Input - Only for Sign Up */}
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-white border-2 border-gray-400 focus:border-green-600"
                  required
                />
              </div>
            )}

            {/* Invite Code Input - Only for Sign Up */}
            {isSignUp && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  Exclusive Invite Code
                  <span className="text-cyan-500">✨ Required</span>
                </label>
                <Input
                  type="text"
                  placeholder="ENTER YOUR INVITE CODE"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="h-12 bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:border-cyan-500"
                  required
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Access Is By Invitation Only</p>
                  <a 
                    href="#waitlist" 
                    className="text-xs text-cyan-500 hover:text-cyan-600 font-medium"
                  >
                    No Code? Join Waitlist
                  </a>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <Input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white border-2 border-gray-400 focus:border-green-600"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white border-2 border-gray-400 focus:border-green-600"
                required
                minLength={6}
              />
            </div>

            {/* Forgot Password - Only for Sign In */}
            {!isSignUp && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-brand-green hover:opacity-80">
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-brand-green hover:opacity-90 text-white font-medium rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-12 border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-500"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign In With Google
            </Button>

            {/* Toggle Sign In/Sign Up */}
            <div className="text-center text-sm text-gray-600 mt-6">
              {isSignUp ? 'Already Have An Account?' : "Don't Have An Account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-brand-green hover:opacity-80 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Create Your Account'}
              </button>
            </div>

            {/* Terms & Privacy */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By continuing, you agree to our{' '}
              <Link 
                to="/terms-of-service" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-green hover:opacity-80 underline"
              >
                Terms of Service
              </Link>
              {' & '}
              <Link 
                to="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-green hover:opacity-80 underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
