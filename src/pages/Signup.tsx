import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Check, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

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
  
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

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
      
      // Mark invite code as used
      const pendingInviteCode = localStorage.getItem('pendingInviteCode');
      if (pendingInviteCode) {
        await supabase
          .from('invite_codes')
          .update({ 
            is_used: true, 
            used_at: new Date().toISOString()
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
      {/* Left Side - Green Gradient (same as login) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 p-12 flex-col justify-center relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2 text-white">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-semibold">REVVEN</span>
        </div>

        {/* Main Content */}
        <div className="max-w-xl">
          <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
            Let REVVEN Run Your Business While You Sleep
          </h2>
          <h3 className="text-2xl font-semibold text-green-100 mb-6">
            Your 24/7 AI Engine For Content, Connection & Growth
          </h3>
          <p className="text-green-50 text-lg mb-12 leading-relaxed">
            Automate your entire business with intelligent AI that never clocks out. 
            Write, design, post, and reply in seconds while your business grows on autopilot.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Create Digital Products With AI
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Create eBooks, guides, and offers ready to sell 24/7.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Create Social Content
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Turn ideas into scroll-stopping posts, videos, and carousels in seconds.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🚀</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Post Social Content
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Schedule and publish automatically across every platform for nonstop visibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💬</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Reply To Comments, DMs & Stories
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Keep your followers engaged with instant AI replies that sound like you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
          <div className="absolute inset-0 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">REVVEN</span>
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
                      className={`h-12 pl-10 uppercase ${
                        inviteCodeValid === true 
                          ? 'border-green-500 focus:border-green-500' 
                          : inviteCodeValid === false 
                            ? 'border-red-500 focus:border-red-500' 
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
                    <p className="text-sm text-green-600 mt-1">
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
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
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
                  <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
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
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <Button
                onClick={() => handleOtpSubmit()}
                disabled={loading || otp.some(d => !d)}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium mb-4"
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
                    className="text-green-600 hover:text-green-700 font-medium"
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
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email verified!</h1>
              <p className="text-gray-600 mb-6">
                Setting up your workspace...
              </p>
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
