import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Session } from '@supabase/supabase-js';
import { Pause, Play } from 'lucide-react';
import RevvenLogo from '@/components/RevvenLogo';

// Showcase slides data - Pastel color backgrounds with hypnotic copy
const showcaseSlides = [
  {
    title: "Idea To Video In Seconds",
    description: "Stop waiting weeks for video content. Type your idea, and watch AI transform it into scroll-stopping videos that captivate your audience instantly.",
    features: ["Text-to-Video", "AI Scripts", "Auto Editing"],
    bgColor: "bg-violet-50",
    accentColor: "text-violet-700",
    pillBg: "bg-violet-200/60",
  },
  {
    title: "Create Digital Products",
    description: "Launch eBooks and courses in minutes, not months. AI writes, designs, and packages your expertise into products that sell while you sleep.",
    features: ["eBook Creator", "Course Builder", "Instant Design"],
    bgColor: "bg-rose-50",
    accentColor: "text-rose-700",
    pillBg: "bg-rose-200/60",
  },
  {
    title: "AI Music & Audio Studio",
    description: "Compose original soundtracks, jingles, and audio that's 100% yours. No licensing fees. No copyright strikes. Just pure creativity.",
    features: ["Music Generation", "Sound Effects", "Voice Cloning"],
    bgColor: "bg-teal-50",
    accentColor: "text-teal-700",
    pillBg: "bg-teal-200/60",
  },
  {
    title: "Professional Video Editing",
    description: "Hollywood-level editing without the learning curve. AI handles the cuts, transitions, and effects—you just approve the magic.",
    features: ["Smart Cuts", "Auto Captions", "Effects Library"],
    bgColor: "bg-amber-50",
    accentColor: "text-amber-700",
    pillBg: "bg-amber-200/60",
  },
  {
    title: "Product Video Photoshoot",
    description: "Turn any product photo into a stunning video ad. No studio. No crew. No budget. Just upload and let AI create video magic.",
    features: ["Product Ads", "Lifestyle Shots", "Brand Videos"],
    bgColor: "bg-blue-50",
    accentColor: "text-blue-700",
    pillBg: "bg-blue-200/60",
  },
  {
    title: "AI Digital Characters",
    description: "Create lifelike AI influencers and spokespersons that work 24/7. Your brand's new face never takes a day off.",
    features: ["AI Avatars", "Voice Cloning", "Talking Photos"],
    bgColor: "bg-fuchsia-50",
    accentColor: "text-fuchsia-700",
    pillBg: "bg-fuchsia-200/60",
  },
  {
    title: "Build Apps In Minutes",
    description: "No coding required. Describe your dream app and watch AI build it before your eyes. From idea to launch in a single session.",
    features: ["No-Code Builder", "AI Development", "Instant Deploy"],
    bgColor: "bg-emerald-50",
    accentColor: "text-emerald-700",
    pillBg: "bg-emerald-200/60",
  },
  {
    title: "Custom Business CRM",
    description: "Manage leads, automate follow-ups, and close more deals. Your AI-powered command center for unstoppable business growth.",
    features: ["Lead Tracking", "Auto Follow-ups", "Smart Analytics"],
    bgColor: "bg-slate-100",
    accentColor: "text-slate-700",
    pillBg: "bg-slate-200/60",
  },
  {
    title: "Social Content Empire",
    description: "30 days of content in 30 seconds. AI creates, schedules, and posts across every platform. Dominate social while you focus on business.",
    features: ["Auto Scheduling", "Multi-Platform", "Viral Content"],
    bgColor: "bg-sky-50",
    accentColor: "text-sky-700",
    pillBg: "bg-sky-200/60",
  },
  {
    title: "AI Image Generation",
    description: "Create stunning visuals that stop thumbs and turn heads. Professional-quality images for ads, posts, and products—generated in seconds.",
    features: ["Photo-Realistic", "Art Styles", "Brand Assets"],
    bgColor: "bg-indigo-50",
    accentColor: "text-indigo-700",
    pillBg: "bg-indigo-200/60",
  },
  {
    title: "Voice & Audio Magic",
    description: "Clone any voice. Generate voiceovers. Create podcasts. Your audio content game is about to become absolutely unstoppable.",
    features: ["Voice Cloning", "AI Voiceovers", "Podcast Creation"],
    bgColor: "bg-red-50",
    accentColor: "text-red-700",
    pillBg: "bg-red-200/60",
  },
  {
    title: "Video Translation",
    description: "Reach the world in 90+ languages. AI translates your videos with perfect lip-sync—your content, every language, zero barriers.",
    features: ["90+ Languages", "Lip-Sync", "Voice Matching"],
    bgColor: "bg-lime-50",
    accentColor: "text-lime-700",
    pillBg: "bg-lime-200/60",
  },
  {
    title: "AI Agents That Work 24/7",
    description: "Deploy intelligent agents that automate your entire workflow—from lead follow-ups to customer support. They never sleep, never complain, never miss a beat.",
    features: ["Workflow Automation", "Smart Responses", "Always On"],
    bgColor: "bg-orange-50",
    accentColor: "text-orange-700",
    pillBg: "bg-orange-200/60",
  },
  {
    title: "Automated Lead Generation",
    description: "Find and capture high-quality leads on autopilot. AI identifies your ideal customers, reaches out, and fills your pipeline while you focus on closing.",
    features: ["Smart Targeting", "Auto Outreach", "Lead Scoring"],
    bgColor: "bg-cyan-50",
    accentColor: "text-cyan-700",
    pillBg: "bg-cyan-200/60",
  },
  {
    title: "White-Label Your Empire",
    description: "Rebrand the entire platform as your own and sell to clients. Build a SaaS empire without writing a single line of code. Your brand, your business, your profits.",
    features: ["Custom Branding", "Client Portals", "Recurring Revenue"],
    bgColor: "bg-purple-50",
    accentColor: "text-purple-700",
    pillBg: "bg-purple-200/60",
  },
  {
    title: "AI-Powered Ad Campaigns",
    description: "Create scroll-stopping ads and launch campaigns across Meta, Google, and TikTok in minutes. AI optimizes your spend and maximizes ROAS automatically.",
    features: ["Ad Creative AI", "Multi-Platform Launch", "Auto-Optimization"],
    bgColor: "bg-red-50",
    accentColor: "text-red-700",
    pillBg: "bg-red-200/60",
  },
  {
    title: "Auto-Pilot Social Media",
    description: "Create, schedule, and post content across all platforms automatically. AI writes captions, designs graphics, and posts at peak engagement times.",
    features: ["Multi-Platform Posting", "AI Captions", "Smart Scheduling"],
    bgColor: "bg-sky-50",
    accentColor: "text-sky-700",
    pillBg: "bg-sky-200/60",
  },
  {
    title: "Competitor Intelligence",
    description: "Spy on competitors' ads, emails, social strategies, and websites. Know exactly what's working for them—then do it better.",
    features: ["Ad Spy Tools", "Email Tracking", "Strategy Analysis"],
    bgColor: "bg-slate-50",
    accentColor: "text-slate-700",
    pillBg: "bg-slate-200/60",
  },
  {
    title: "Your Brand, Every Output",
    description: "Every piece of content—videos, images, copy, emails—automatically matches your brand identity, voice, and style guidelines. Perfect consistency at scale.",
    features: ["Brand Voice AI", "Style Matching", "Visual Consistency"],
    bgColor: "bg-fuchsia-50",
    accentColor: "text-fuchsia-700",
    pillBg: "bg-fuchsia-200/60",
  },
  {
    title: "Revenue Dashboard & Analytics",
    description: "Track every dollar, every conversion, every metric in one beautiful dashboard. AI predicts trends and suggests optimizations to maximize profit.",
    features: ["Real-Time Revenue", "AI Predictions", "ROI Tracking"],
    bgColor: "bg-emerald-50",
    accentColor: "text-emerald-700",
    pillBg: "bg-emerald-200/60",
  },
  {
    title: "One-Click Funnels & Websites",
    description: "Build high-converting funnels and websites in seconds. AI designs, writes copy, and optimizes for conversions—no designers or developers needed.",
    features: ["Funnel Builder", "AI Copywriting", "Conversion Optimized"],
    bgColor: "bg-amber-50",
    accentColor: "text-amber-700",
    pillBg: "bg-amber-200/60",
  },
  {
    title: "Stunning Websites in Minutes",
    description: "Describe your vision and watch AI build beautiful, responsive landing pages and websites instantly. Edit with drag-and-drop. Launch in one click.",
    features: ["AI Website Builder", "Drag & Drop", "Instant Publish"],
    bgColor: "bg-teal-50",
    accentColor: "text-teal-700",
    pillBg: "bg-teal-200/60",
  },
  {
    title: "And So Much More...",
    description: "Clone yourself with AI avatars. Build entire agencies on autopilot. Scale without hiring a single employee. This isn't just a tool—it's your unfair advantage.",
    features: ["Replace Entire Teams", "Scale Without Limits", "Unfair Advantage"],
    bgColor: "bg-gradient-to-br from-brand-green/10 to-emerald-50",
    accentColor: "text-brand-green",
    pillBg: "bg-brand-green/20",
  },
];

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

  // Auto-sliding carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides (slower: 7 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Auto-Sliding Showcase with Pastel Backgrounds */}
      <div className={`hidden lg:flex flex-1 ${showcaseSlides[currentSlide].bgColor} p-12 flex-col justify-center relative overflow-hidden transition-all duration-700`}>
        {/* Slide Content */}
        <div className="max-w-xl relative z-10">
          <div className="mb-8">
            <span className={`inline-block px-4 py-1.5 ${showcaseSlides[currentSlide].pillBg} backdrop-blur-sm rounded-full ${showcaseSlides[currentSlide].accentColor} text-sm font-medium mb-6`}>
              ✨ Powered By AI
            </span>
            <h2 className={`text-4xl md:text-5xl font-bold ${showcaseSlides[currentSlide].accentColor} mb-4 leading-tight transition-all duration-500`}>
              {showcaseSlides[currentSlide].title}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed transition-all duration-500">
              {showcaseSlides[currentSlide].description}
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 mb-12">
            {showcaseSlides[currentSlide].features.map((feature, idx) => (
              <span 
                key={idx}
                className={`px-4 py-2 ${showcaseSlides[currentSlide].pillBg} backdrop-blur-sm rounded-full ${showcaseSlides[currentSlide].accentColor} text-sm font-medium`}
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Slide Indicators + Pause Button */}
          <div className="flex items-center gap-3">
            {showcaseSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? `w-8 ${showcaseSlides[currentSlide].accentColor.replace('text-', 'bg-').replace('-700', '-500')}` 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
            
            {/* Pause/Play Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`ml-2 p-2 rounded-full ${showcaseSlides[currentSlide].pillBg} ${showcaseSlides[currentSlide].accentColor} hover:opacity-80 transition-opacity`}
              aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 justify-center">
              <RevvenLogo size={40} />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">REVVEN</span>
            </div>
          </div>

          {/* Login / Sign Up Toggle Tabs */}
          <div className="mb-8">
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
  );
}
