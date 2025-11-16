import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in:', { email, password });
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Green Gradient */}
      <div className="flex-1 bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 p-12 flex flex-col justify-center relative overflow-hidden">
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
            <Card className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
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
            </Card>

            <Card className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
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
            </Card>

            <Card className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
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
            </Card>

            <Card className="bg-white p-4 rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
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
            </Card>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
          <div className="absolute inset-0 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">REVVEN</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Please enter your details</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Input */}
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white border-gray-300"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white border-gray-300"
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a href="#" className="text-sm text-green-600 hover:text-green-700">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              Sign in
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
              Sign in with Google
            </Button>

            {/* Create Account Link */}
            <div className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Create your account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
