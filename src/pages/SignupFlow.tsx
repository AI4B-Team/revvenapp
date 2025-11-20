import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Progress sidebar component
const SignupProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Create Account', completed: true },
    { id: 2, label: 'Name Workspace', completed: currentStep > 3 },
    { id: 3, label: 'Your Profile', completed: currentStep > 3 },
    { id: 4, label: 'Agent Match', completed: currentStep > 10 },
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
              ) : step.id === currentStep || (step.id === 4 && currentStep >= 4) ? (
                <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  step.id === currentStep || (step.id === 4 && currentStep >= 4)
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
  const [qa1Answer, setQa1Answer] = useState('');
  const [qa2Answer, setQa2Answer] = useState('');
  const [qa3Answer, setQa3Answer] = useState('');

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Set Up Your Workspace</h1>
              <p className="text-gray-600 mb-2">
                This is how your workspace will be named and seen by collaborators.
              </p>
              <p className="text-gray-600 mb-8">
                You can change this later.
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

          {/* Step 3: Your Profile */}
          {currentStep === 3 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Tell Us About You</h1>

              <form onSubmit={handleAboutYou} className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    What Best Describes Your Role?
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
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    What Industry Are You In?
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

          {/* Step 4: Q&A 1 - Content Creation */}
          {currentStep === 4 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                What's your biggest content creation struggle?
              </h1>

              <div className="space-y-4">
                {[
                  'I never know what to post or say',
                  'Creating content takes me 3-4 hours per post',
                  "My content doesn't match my brand or convert",
                  'I post inconsistently—whenever I remember',
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setQa1Answer(option);
                      setCurrentStep(5);
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors"
                  >
                    <span className="text-gray-900">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Meet Dolmar & Keisha */}
          {currentStep === 5 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Meet Dolmar & Keisha — Your Content Creation Engine
              </h1>

              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">What They Solve:</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Dolmar</strong> creates your visual identity — Generates branded graphics, videos, and your AI Avatar that posts in your voice
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Keisha</strong> writes everything — Converts your ideas into viral posts, sales pages, emails, and digital products in minutes
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                  <p className="text-gray-800 font-semibold">
                    Their Promise:
                  </p>
                  <p className="text-gray-800 italic">
                    "We'll turn your scattered ideas into 30 days of branded content before you finish your coffee."
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(6)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
              >
                That Sounds Perfect! Continue
              </Button>
            </div>
          )}

          {/* Step 6: Q&A 2 - Revenue */}
          {currentStep === 6 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Where are you losing the most money right now?
              </h1>

              <div className="space-y-4">
                {[
                  'I get views but no one buys',
                  'My launches flop—no momentum or urgency',
                  "I have leads but can't close them",
                  'I\'m invisible—no one finds me online',
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setQa2Answer(option);
                      setCurrentStep(7);
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors"
                  >
                    <span className="text-gray-900">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Meet Francis & Rich */}
          {currentStep === 7 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Meet Francis & Rich — Your Revenue Growth Team
              </h1>

              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">What They Solve:</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Francis</strong> builds your marketing engine — Crafts offers, builds funnels, and launches marketing campaigns that brings qualified buyers to you
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Rich</strong> turns interest into income — Automates follow-ups, writes conversion-focused sales scripts, and closes deals 24/7
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                  <p className="text-gray-800 font-semibold">
                    Their Promise:
                  </p>
                  <p className="text-gray-800 italic">
                    "We'll fill your calendar with ready-to-buy leads and convert them while you sleep."
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(8)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
              >
                YES, I Need This! Continue
              </Button>
            </div>
          )}

          {/* Step 8: Q&A 3 - Time & Energy */}
          {currentStep === 8 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                What's draining your time and energy the most?
              </h1>

              <div className="space-y-4">
                {[
                  'I\'m switching between 10 tools all day',
                  'Everything is manual—posting, emailing, scheduling',
                  'I\'m handling tasks I hate instead of growing the business',
                  'There\'s no system—it\'s all chaos and firefighting',
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setQa3Answer(option);
                      setCurrentStep(9);
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors"
                  >
                    <span className="text-gray-900">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Meet Brian & Damoi */}
          {currentStep === 9 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Meet Brian & Damoi — Your Business Automation Team
              </h1>

              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">What They Solve:</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Brian</strong> builds your automated systems — Connects your tools, creates automated workflows, and makes everything run on autopilot
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Damoi</strong> organizes and executes — Manages projects, keeps everything on track, and scales operations without the overwhelm
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                  <p className="text-gray-800 font-semibold">
                    Their Promise:
                  </p>
                  <p className="text-gray-800 italic">
                    "We'll eliminate 80% of your busywork and give you back 20+ hours per week."
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(10)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
              >
                Sign Me Up! Continue
              </Button>
            </div>
          )}

          {/* Step 10: Complete Analysis */}
          {currentStep === 10 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Analysis</h1>
              <p className="text-gray-600 mb-8">
                We've analyzed your needs and matched you with the perfect AI team
              </p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your AI Team is Ready</h2>
                <p className="text-gray-700 mb-6">
                  Based on your responses, we've assembled the ideal combination of AI agents to help you succeed.
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">Dolmar & Keisha</span>
                      <span className="text-gray-600"> — Content Creation Engine</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">Francis & Rich</span>
                      <span className="text-gray-600"> — Revenue Growth Team</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">Brian & Damoi</span>
                      <span className="text-gray-600"> — Business Automation Team</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 px-8"
              >
                Start Working With Your Team →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
