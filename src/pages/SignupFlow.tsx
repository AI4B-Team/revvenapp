import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Progress sidebar component
const SignupProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Create Account', completed: true },
    { id: 2, label: 'Name Your Workspace', completed: currentStep > 2 },
    { id: 3, label: 'Tell Us About You', completed: currentStep > 3 },
    { id: 4, label: 'Meet Dolmar & Keisha', completed: currentStep > 4 },
    { id: 5, label: 'Meet Francis & Rich', completed: currentStep > 5 },
    { id: 6, label: 'Meet Brian & Damoi', completed: currentStep > 6 },
    { id: 7, label: 'Analysis Complete', completed: currentStep > 7 },
    { id: 8, label: 'Enter Dashboard', completed: false },
  ];

  return (
    <div className="w-80 bg-gray-50 p-8 min-h-screen border-r border-gray-200">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">REVVEN</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          SETUP PROGRESS
        </h3>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              {step.completed ? (
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : step.id === currentStep ? (
                <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  step.id === currentStep
                    ? 'text-green-600 font-medium'
                    : step.completed
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main signup flow component
export default function SignupFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (workspace)
  const [workspaceName, setWorkspaceName] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');

  const handleWorkspaceSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleAboutYou = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handleAgentReveal = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="flex min-h-screen">
      {/* Progress Sidebar */}
      <SignupProgress currentStep={currentStep} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-2xl">
          {/* Step 2: Workspace Setup */}
          {currentStep === 2 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's set up your workspace</h1>
              <p className="text-gray-600 mb-8">
                This is how your workspace will be named and seen by collaborators. You can change
                this later.
              </p>

              <form onSubmit={handleWorkspaceSetup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workspace Name
                  </label>
                  <Input
                    type="text"
                    placeholder="My Business"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="h-12"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This could be your company name, personal brand, or project name.
                  </p>
                </div>

                <Button type="submit" className="bg-green-600 hover:bg-green-700 h-12 px-8">
                  Continue
                </Button>
              </form>
            </div>
          )}

          {/* Step 3: Tell Us About You */}
          {currentStep === 3 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tell us about you</h1>
              <p className="text-gray-600 mb-8">
                This helps us personalize your experience and tailor our AI agents to your specific needs.
              </p>

              <form onSubmit={handleAboutYou} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What best describes your role?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Entrepreneur',
                      'Content Creator',
                      'Marketing Professional',
                      'Business Owner',
                      'Freelancer',
                      'Agency Owner',
                    ].map((roleOption) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => setRole(roleOption)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          role === roleOption
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{roleOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What industry are you in?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'E-commerce',
                      'Coaching/Consulting',
                      'Real Estate',
                      'SaaS/Tech',
                      'Health & Wellness',
                      'Other',
                    ].map((industryOption) => (
                      <button
                        key={industryOption}
                        type="button"
                        onClick={() => setIndustry(industryOption)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          industry === industryOption
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{industryOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!role || !industry}
                  className="bg-green-600 hover:bg-green-700 h-12 px-8 disabled:opacity-50"
                >
                  Continue
                </Button>
              </form>
            </div>
          )}

          {/* Step 4: Meet Dolmar & Keisha */}
          {currentStep === 4 && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Meet Dolmar & Keisha — Your Content Creation Team
              </h1>
              <p className="text-gray-600 mb-8">
                They create your social posts, videos, carousels, and talking reels 24/7
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    D
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Dolmar</h3>
                  <p className="text-gray-600 text-sm mb-3">Content Strategy</p>
                  <p className="text-gray-700 text-sm">
                    Plans your content calendar, identifies trends, and ensures every post aligns with your goals
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    K
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Keisha</h3>
                  <p className="text-gray-600 text-sm mb-3">Content Creation</p>
                  <p className="text-gray-700 text-sm">
                    Writes your posts, designs carousels, and creates scroll-stopping visuals in your brand voice
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleSkip} variant="outline" className="h-12 px-6">
                  Skip for now
                </Button>
                <Button onClick={handleAgentReveal} className="bg-green-600 hover:bg-green-700 h-12 px-8">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Meet Francis & Rich */}
          {currentStep === 5 && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Meet Francis & Rich — Your Product & Sales Team
              </h1>
              <p className="text-gray-600 mb-8">
                They create digital products, sales pages, and funnels that convert 24/7
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    F
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Francis</h3>
                  <p className="text-gray-600 text-sm mb-3">Product Creation</p>
                  <p className="text-gray-700 text-sm">
                    Creates eBooks, guides, courses, and digital products ready to sell immediately
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    R
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Rich</h3>
                  <p className="text-gray-600 text-sm mb-3">Sales & Funnels</p>
                  <p className="text-gray-700 text-sm">
                    Builds landing pages, sales pages, and automated funnels that convert visitors to customers
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleSkip} variant="outline" className="h-12 px-6">
                  Skip for now
                </Button>
                <Button onClick={handleAgentReveal} className="bg-green-600 hover:bg-green-700 h-12 px-8">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Meet Brian & Damoi */}
          {currentStep === 6 && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Meet Brian & Damoi — Your Engagement & Growth Team
              </h1>
              <p className="text-gray-600 mb-8">
                They manage comments, DMs, stories, and grow your audience on autopilot
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    B
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Brian</h3>
                  <p className="text-gray-600 text-sm mb-3">Community Engagement</p>
                  <p className="text-gray-700 text-sm">
                    Replies to comments, DMs, and stories with personalized responses in your voice
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    D
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Damoi</h3>
                  <p className="text-gray-600 text-sm mb-3">Audience Growth</p>
                  <p className="text-gray-700 text-sm">
                    Engages with your target audience, builds relationships, and grows your following organically
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleSkip} variant="outline" className="h-12 px-6">
                  Skip for now
                </Button>
                <Button onClick={handleAgentReveal} className="bg-green-600 hover:bg-green-700 h-12 px-8">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 7: Analysis/Benchmark */}
          {currentStep === 7 && (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Analyzing Your Business...
                </h1>
                <p className="text-gray-600">
                  Your AI team is learning about your industry, competitors, and target audience
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl max-w-md mx-auto">
                <div className="space-y-4">
                  {[
                    'Analyzing market trends',
                    'Identifying content opportunities',
                    'Setting up your brand voice',
                    'Preparing your AI agents',
                  ].map((task) => (
                    <div key={task} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAgentReveal}
                className="mt-8 bg-green-600 hover:bg-green-700 h-12 px-8"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 8: Success */}
          {currentStep === 8 && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">You're All Set!</h1>
              <p className="text-gray-600 mb-8">
                Your AI team is ready to start working. Let's complete your brand profile to activate them.
              </p>

              <Button
                onClick={() => navigate('/onboarding-dashboard')}
                className="bg-green-600 hover:bg-green-700 h-12 px-8"
              >
                Enter Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
