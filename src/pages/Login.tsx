import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Session } from '@supabase/supabase-js';
import RevvenLogo from '@/components/RevvenLogo';
import AuthShowcase from '@/components/auth/AuthShowcase';
import { Eye, EyeOff, Check, Circle, ChevronDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from '@/hooks/useTranslation';

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'pt-br', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [fullName, setFullName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const languageSearchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
  
  // Find the selected language object based on current language code
  const selectedLanguage = useMemo(() => {
    return LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];
  }, [language]);

  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) return LANGUAGES;
    const search = languageSearch.toLowerCase();
    return LANGUAGES.filter(lang => 
      lang.name.toLowerCase().includes(search) || 
      lang.code.toLowerCase().includes(search)
    );
  }, [languageSearch]);

  useEffect(() => {
    if (languageDropdownOpen && languageSearchRef.current) {
      languageSearchRef.current.focus();
    }
  }, [languageDropdownOpen]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      symbol: /[#$&@!%^*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (passedChecks === 3) strength = 'strong';
    else if (passedChecks === 2) strength = 'medium';
    
    return { checks, strength, passedChecks };
  }, [password]);

  const strengthColors = {
    weak: 'bg-orange-400',
    medium: 'bg-yellow-400',
    strong: 'bg-green-500',
  };

  const strengthLabels = useMemo(() => ({
    weak: t('password.weak', 'Weak'),
    medium: t('password.medium', 'Medium'),
    strong: t('password.strong', 'Strong'),
  }), [t]);

  useEffect(() => {
    const checkInviteCodeValidation = async (userId: string): Promise<boolean> => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code_validated')
        .eq('id', userId)
        .single();
      
      return profile?.invite_code_validated === true;
    };

    const checkIfFirstLogin = (userId: string): boolean => {
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${userId}`);
      return !hasCompletedOnboarding;
    };

    const getLastVisitedRoute = (): string => {
      return localStorage.getItem('last_visited_route') || '/create';
    };

    const handleAuthRedirect = async (session: Session) => {
      const isValidated = await checkInviteCodeValidation(session.user.id);
      if (!isValidated) {
        navigate('/invite-verification');
        return;
      }
      
      // Check if first-time user (hasn't completed onboarding)
      const isFirstLogin = checkIfFirstLogin(session.user.id);
      if (isFirstLogin) {
        navigate('/onboarding');
      } else {
        // Returning user: restore last state
        const lastRoute = getLastVisitedRoute();
        navigate(lastRoute);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        // Only redirect on actual sign in, not on token refresh
        if (session && event === 'SIGNED_IN') {
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
    setEmailNotFound(false);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      // Check if error indicates user not found
      if (error.message.toLowerCase().includes('invalid login credentials') || 
          error.message.toLowerCase().includes('user not found') ||
          error.message.toLowerCase().includes('no user found')) {
        setEmailNotFound(true);
      }
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

    // Validate that the invite code exists and is not already used using secure RPC function
    const { data: codeCheck, error: codeError } = await supabase
      .rpc('check_invite_code', { code_to_check: inviteCode.toUpperCase() });

    if (codeError || !codeCheck || codeCheck.length === 0 || !codeCheck[0].is_valid) {
      setIsLoading(false);
      toast({
        title: "Invalid Invite Code",
        description: "This invite code does not exist. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    if (codeCheck[0].is_used) {
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
        emailRedirectTo: `${window.location.origin}/dashboard`,
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

    // Mark the invite code as used using secure RPC function
    await supabase.rpc('redeem_invite_code', {
      code_to_redeem: inviteCode.toUpperCase(),
      redeemer_email: email,
      redeemer_name: fullName
    });

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
        redirectTo: `${window.location.origin}/dashboard`,
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
        {/* Fixed Login / Sign Up Toggle Tabs + Language Selector */}
        <div className="flex-shrink-0 p-8 pb-0">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between gap-4">
              {/* Login/SignUp Tabs - Left side */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    !isSignUp 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('auth.login', 'Login')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    isSignUp 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('auth.signUp', 'Sign Up')}
                </button>
              </div>

              {/* Language Dropdown - Right side */}
              <Popover open={languageDropdownOpen} onOpenChange={setLanguageDropdownOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{selectedLanguage.flag}</span>
                    <span className="text-sm font-medium text-gray-700">{selectedLanguage.name}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-64 p-0 bg-white border border-gray-200 shadow-lg z-50" 
                  align="end"
                  sideOffset={8}
                >
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={languageSearchRef}
                        type="text"
                        placeholder={t('auth.searchLanguages', 'Search Languages...')}
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Language List */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            setLanguageDropdownOpen(false);
                            setLanguageSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                            selectedLanguage.code === lang.code ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-sm text-gray-700">{lang.name}</span>
                          {selectedLanguage.code === lang.code && (
                            <Check className="ml-auto h-4 w-4 text-brand-green" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        {t('auth.noLanguagesFound', 'No languages found')}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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
              <p className="text-gray-600">{t('auth.alreadyLoggedIn', 'You are already logged in')}</p>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full max-w-xs"
              >
                {t('auth.logOut', 'Log Out')}
              </Button>
            </div>
          )}

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? t('auth.createAccount', 'Create Account') : t('auth.welcome', 'Welcome')}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? t('auth.startAutomating', 'Start Automating Your Business In Under 10 Minutes') : t('auth.pleaseEnterDetails', 'Please Enter Your Details')}
            </p>
          </div>

          {/* Login/Signup Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {/* Full Name Input - Only for Sign Up */}
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder={t('auth.fullName', 'Full Name')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-white border-2 border-gray-400 focus:border-green-600"
                />
              </div>
            )}

            {/* Invite Code Input - Only for Sign Up */}
            {isSignUp && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  {t('auth.exclusiveInviteCode', 'Exclusive Invite Code')}
                  <span className="text-cyan-500">✨ {t('auth.required', 'Required')}</span>
                </label>
                <Input
                  type="text"
                  placeholder={t('auth.enterInviteCode', 'ENTER YOUR INVITE CODE')}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="h-12 bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:border-cyan-500"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">{t('auth.accessByInvitation', 'Access Is By Invitation Only')}</p>
                  <a 
                    href="#waitlist" 
                    className="text-xs text-cyan-500 hover:text-cyan-600 font-medium"
                  >
                    {t('auth.noCodeJoinWaitlist', 'No Code? Join Waitlist')}
                  </a>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <Input
                type="email"
                placeholder={t('auth.enterEmail', 'Enter Email')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailNotFound(false);
                }}
                className={`h-12 bg-white border-2 ${
                  emailNotFound && !isSignUp
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-400 focus:border-green-600'
                }`}
              />
              {emailNotFound && !isSignUp && (
                <p className="mt-1.5 text-sm text-red-500">
                  {t('auth.emailNotFound', 'Email Not Found,')}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-amber-500 hover:text-amber-600 font-medium"
                  >
                    {t('auth.joinUs', 'Join Us')}
                  </button>
                </p>
              )}
            </div>

            {/* Password Input with Strength Indicator */}
            <div className="relative">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.enterPassword', 'Enter Password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="h-12 bg-white border-2 border-gray-400 focus:border-green-600 pr-24"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {/* Strength Badge - Only show in Sign Up mode when password has content */}
                  {isSignUp && password.length > 0 && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      passwordStrength.strength === 'weak' ? 'text-orange-600' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {strengthLabels[passwordStrength.strength]}
                    </span>
                  )}
                  {/* Show/Hide Password Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Password Requirements - Only show in Sign Up mode when focused */}
              {isSignUp && isPasswordFocused && password.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 shadow-lg rounded-md p-4 z-50">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {passwordStrength.strength === 'weak' ? t('password.weakPassword', 'Weak Password') :
                         passwordStrength.strength === 'medium' ? t('password.mediumPassword', 'Medium Password') :
                         t('password.strongPassword', 'Strong Password')}
                      </h4>
                      {/* Strength Bar */}
                      <div className="flex gap-1">
                        <div className={`h-1 flex-1 rounded ${passwordStrength.passedChecks >= 1 ? strengthColors[passwordStrength.strength] : 'bg-gray-200'}`} />
                        <div className={`h-1 flex-1 rounded ${passwordStrength.passedChecks >= 2 ? strengthColors[passwordStrength.strength] : 'bg-gray-200'}`} />
                        <div className={`h-1 flex-1 rounded ${passwordStrength.passedChecks >= 3 ? strengthColors[passwordStrength.strength] : 'bg-gray-200'}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{t('password.mustInclude', 'Password Must Include:')}</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm">
                          {passwordStrength.checks.length ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Circle size={14} className="text-gray-300" />
                          )}
                          <span className={passwordStrength.checks.length ? 'text-gray-700' : 'text-gray-500'}>
                            {t('password.atLeast8Chars', 'At Least 8 Characters')}
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          {passwordStrength.checks.upperLower ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Circle size={14} className="text-gray-300" />
                          )}
                          <span className={passwordStrength.checks.upperLower ? 'text-gray-700' : 'text-gray-500'}>
                            {t('password.upperLowerCase', 'Upper & Lower Case Letters')}
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          {passwordStrength.checks.symbol ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Circle size={14} className="text-gray-300" />
                          )}
                          <span className={passwordStrength.checks.symbol ? 'text-gray-700' : 'text-gray-500'}>
                            {t('password.aSymbol', 'A Symbol (#$&)')}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Forgot Password - Only for Sign In */}
            {!isSignUp && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-brand-green hover:opacity-80">
                  {t('auth.forgotPassword', 'Forgot Password?')}
                </a>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-brand-green hover:opacity-90 text-white font-medium rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? t('auth.loading', 'Loading...') : (isSignUp ? t('auth.signUp', 'Sign Up') : t('auth.signIn', 'Sign In'))}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('auth.or', 'OR')}</span>
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
              {t('auth.signInWithGoogle', 'Sign In With Google')}
            </Button>

            {/* Toggle Sign In/Sign Up */}
            <div className="text-center text-sm text-gray-600 mt-6">
              {isSignUp ? t('auth.alreadyHaveAccount', 'Already Have An Account?') : t('auth.dontHaveAccount', "Don't Have An Account?")}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-brand-green hover:opacity-80 font-medium"
              >
                {isSignUp ? t('auth.signIn', 'Sign In') : t('auth.createYourAccount', 'Create Your Account')}
              </button>
            </div>

            {/* Terms & Privacy */}
            <p className="text-center text-xs text-gray-500 mt-6">
              {t('auth.byContinuing', 'By continuing, you agree to our')}{' '}
              <Link 
                to="/terms-of-service" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-green hover:opacity-80 underline"
              >
                {t('auth.termsOfService', 'Terms of Service')}
              </Link>
              {' '}{t('auth.and', '&')}{' '}
              <Link 
                to="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-green hover:opacity-80 underline"
              >
                {t('auth.privacyPolicy', 'Privacy Policy')}
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
