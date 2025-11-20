import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Play, Users, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function OnboardingDashboard() {
  const navigate = useNavigate();
  const userName = 'Brian'; // This would come from your auth context

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header with AI Team Message */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome, {userName} 👋
            </h1>
            <Button 
              variant="outline" 
              className="text-gray-700 hover:text-green-600"
              onClick={() => navigate('/dashboard')}
            >
              Skip to Dashboard
            </Button>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your AI Team Is Ready To Work — But They Need To Learn Your Brand First
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Complete your brand profile to activate Francis, Brian, Rich, Dolmar, Keisha, and Damoi. Once they know your voice, colors, and style, they'll start creating content, building campaigns, and automating your business 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Start */}
          <div className="lg:col-span-2">
            <Card className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Start</h2>
                <p className="text-gray-600">
                  Get started with REVVEN by completing the following steps.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">29% Completed</span>
                  <span className="text-sm text-gray-500">3 of 4 steps remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '29%' }}></div>
                </div>
              </div>

              {/* Getting Started Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">1. Getting Started</h3>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    4 steps left
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Step 1 - Completed */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Create Your First Project
                      </h4>
                      <p className="text-sm text-gray-600">
                        Kickstart your REVVEN journey by creating your first project
                      </p>
                    </div>
                  </div>

                  {/* Step 2 - Watch Video */}
                  <div className="flex items-start gap-4 p-4 bg-white border-2 border-green-600 rounded-lg">
                    <div className="w-8 h-8 bg-white border-2 border-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Get To Know The REVVEN Platform
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        See what you'll be able to do with REVVEN
                      </p>
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white h-9">
                        Play Video
                      </Button>
                    </div>
                  </div>

                  {/* Step 3 - Build Profile */}
                  <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-600 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Create Your Brand Profile
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Build your complete brand profile by creating your identity, defining your
                        voice, adding knowledge, conducting competitor analysis, and selecting your
                        AI character to be the spokesperson for your brand
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700 text-white h-9">
                        Build Profile
                      </Button>
                    </div>
                  </div>

                  {/* Step 4 - Invite Team */}
                  <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-600 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Invite Your Team Members
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Invite other admins and moderators to collaborate
                      </p>
                      <Button variant="outline" className="h-9">
                        Invite
                      </Button>
                    </div>
                  </div>

                  {/* Step 5 - Register Workshop */}
                  <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-600 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Register For The FREE 3-Day Virtual AI Workshop
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Connect with the community, learn automation strategies, and unlock bonus AI
                        templates
                      </p>
                      <Button variant="outline" className="h-9">
                        Register Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">2. Create</h3>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    3 steps left
                  </button>
                </div>
                <p className="text-sm text-gray-600">Launch Your Creative Engine</p>
              </div>

              {/* Monetize Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">3. Monetize</h3>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    2 steps left
                  </button>
                </div>
                <p className="text-sm text-gray-600">Activate Your Profit System</p>
              </div>

              {/* Automate Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">4. Automate</h3>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    2 steps left
                  </button>
                </div>
                <p className="text-sm text-gray-600">Let Your AI Take Over</p>
              </div>
            </Card>
          </div>

          {/* Right Column - Video Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-2">
                Watch This 3 Minute Overview
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get started with REVVEN by watching this video.
              </p>

              {/* Video Thumbnail */}
              <div className="relative rounded-xl overflow-hidden mb-4 bg-gray-100 aspect-video">
                <img
                  src="/api/placeholder/400/225"
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                  </button>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                Play Overview
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
