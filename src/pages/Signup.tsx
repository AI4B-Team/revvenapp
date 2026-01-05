import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Check, Ticket, Pause, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
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
    description: "Run your entire business on autopilot. Outpace competitors while they're still hiring. This isn't just a tool—it's the unfair advantage they'll never see coming.",
    features: ["Automate Everything", "Outwork Anyone", "Unfair Advantage"],
    bgColor: "bg-gradient-to-br from-brand-green/10 to-emerald-50",
    accentColor: "text-brand-green",
    pillBg: "bg-brand-green/20",
  },
];

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite') || '');
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  // Auto-sliding carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-advance slides (slower: 7 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Validate invite code from URL on mount
  useEffect(() => {
    const codeFromUrl = searchParams.get('invite');
    if (codeFromUrl) {
      validateInviteCode(codeFromUrl);
    }
  }, [searchParams]);

  const validateInviteCode = async (code: string) => {
    if (!code || code.length < 6) {
      setInviteCodeValid(null);
      return;
    }

    setValidatingCode(true);
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
      setValidatingCode(false);
    }
  };

  const handleInviteCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setInviteCode(upperValue);
    setInviteCodeValid(null);
    
    // Debounce validation
    if (upperValue.length >= 6) {
      validateInviteCode(upperValue);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate invite code first
    if (!inviteCode) {
      setError('Please enter an invite code to sign up.');
      return;
    }

    if (inviteCodeValid === false) {
      setError('Invalid or already used invite code. Please enter a valid code.');
      return;
    }

    if (inviteCodeValid === null) {
      // Validate the code before proceeding
      setValidatingCode(true);
      const { data, error } = await supabase
        .from('invite_codes')
        .select('id, is_used')
        .eq('code', inviteCode.toUpperCase())
        .single();
      setValidatingCode(false);

      if (error || !data || data.is_used) {
        setInviteCodeValid(false);
        setError('Invalid or already used invite code. Please enter a valid code.');
        return;
      }
      setInviteCodeValid(true);
    }

    setLoading(true);

    try {
      // TODO: Call your API to send OTP
      // const response = await api.signup({ firstName, lastName, email });
      
      // Store invite code for later use after signup completes
      localStorage.setItem('pendingInviteCode', inviteCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Sending OTP to:', { firstName, lastName, email, inviteCode });
      
      setStep('otp');
      setResendTimer(60); // Start 60 second countdown
      setLoading(false);
      
      // Auto-focus first OTP input
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    // TODO: Implement Google OAuth flow
    // window.location.href = '/auth/google';
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    // Focus last filled input or trigger submit
    const lastIndex = pastedData.length - 1;
    if (lastIndex === 5) {
      handleOtpSubmit(pastedData);
    } else {
      otpInputs.current[lastIndex + 1]?.focus();
    }
  };

  const handleOtpSubmit = async (otpString?: string) => {
    const code = otpString || otp.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // TODO: Call your API to verify OTP
      // const response = await api.verifyOtp({ email, otp: code });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Verifying OTP:', { email, code });
      
      // Mark invite code as used and store the name and email of the person who signed up
      const pendingInviteCode = localStorage.getItem('pendingInviteCode');
      if (pendingInviteCode) {
        const fullName = `${firstName} ${lastName}`.trim();
        await supabase
          .from('invite_codes')
          .update({ 
            is_used: true, 
            used_at: new Date().toISOString(),
            used_by_email: email,
            used_by_name: fullName
          })
          .eq('code', pendingInviteCode);
        
        localStorage.removeItem('pendingInviteCode');
      }
      
      // Show success state briefly
      setStep('success');
      setLoading(false);
      
      // Redirect to workspace setup (Step 2 of SignupFlow)
      setTimeout(() => {
        window.location.href = '/signup/workspace';
        // Or use your router: navigate('/signup/workspace')
      }, 1500);
      
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      setLoading(false);
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError('');
    setLoading(true);

    try {
      // TODO: Call your API to resend OTP
      // await api.resendOtp({ email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Resending OTP to:', email);
      
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setLoading(false);
      otpInputs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

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

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2.5 justify-center">
              <RevvenLogo size={32} />
              <span className="text-xl font-bold text-gray-900 tracking-tight">REVVEN</span>
            </div>
          </div>

          {/* Step 1: Signup Form */}
          {step === 'form' && (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
                <p className="text-gray-600">
                  Start automating your business in under 3 minutes
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                {/* Invite Code Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invite Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter your invite code"
                      value={inviteCode}
                      onChange={(e) => handleInviteCodeChange(e.target.value)}
                      className={`h-12 pl-10 uppercase !bg-white !text-gray-900 !border-gray-300 placeholder:!text-gray-500 ${
                        inviteCodeValid === true 
                          ? '!border-green-500 focus:!border-green-500' 
                          : inviteCodeValid === false 
                            ? '!border-red-500 focus:!border-red-500' 
                            : ''
                      }`}
                      required
                    />
                    {validatingCode && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                      </div>
                    )}
                    {!validatingCode && inviteCodeValid === true && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {inviteCodeValid === false && (
                    <p className="text-sm text-red-500 mt-1">
                      Invalid or already used invite code
                    </p>
                  )}
                  {inviteCodeValid === true && (
                    <p className="text-sm text-brand-green mt-1">
                      Valid invite code!
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    You need a valid invite code to sign up. Ask a friend for one!
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-brand-green hover:opacity-90 text-white font-medium rounded-xl"
                >
                  {loading ? 'Sending verification code...' : 'Continue'}
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

                {/* Google Signup */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignup}
                  className="w-full h-12 border-gray-300 hover:bg-gray-50"
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
                  Sign up with Google
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{' '}
                  <a href="/login" className="text-brand-green hover:opacity-80 font-medium">
                    Sign in
                  </a>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div>
              {/* Back Button */}
              <button
                onClick={handleBackToForm}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-brand-green" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Check your email
                </h1>
                <p className="text-gray-600 text-center">
                  We sent a 6-digit verification code to
                  <br />
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
                  {error}
                </div>
              )}

              {/* OTP Input */}
              <div className="mb-6">
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-brand-green focus:outline-none transition-colors"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <Button
                onClick={() => handleOtpSubmit()}
                disabled={loading || otp.some(d => !d)}
                className="w-full h-12 bg-brand-green hover:opacity-90 text-white font-medium rounded-xl mb-4"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              {/* Resend Code */}
              <div className="text-center text-sm text-gray-600">
                Didn't receive the code?{' '}
                {resendTimer > 0 ? (
                  <span className="text-gray-400">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-brand-green hover:opacity-80 font-medium"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Success State */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-brand-green" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email verified!</h1>
              <p className="text-gray-600 mb-6">
                Setting up your workspace...
              </p>
              <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
