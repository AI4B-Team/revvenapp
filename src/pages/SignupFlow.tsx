import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, ChevronRight } from 'lucide-react';

// Progress sidebar component
const SignupProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Create Account', completed: currentStep > 1 },
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
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');

  const handleGoogleSignup = () => {
    console.log('Google signup');
    setCurrentStep(2);
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email signup:', email);
    setCurrentStep(2);
  };

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
    <div className="flex min-h-screen max-h-screen overflow-hidden">
      {currentStep === 1 ? (
        <>
          {/* Left Side - Green Gradient */}
          <div className="flex-1 bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Main Content */}
            <div className="max-w-xl">
              <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                Let REVVEN Run Your Business While You Sleep
              </h2>
              <h3 className="text-2xl font-semibold text-green-100 mb-6 whitespace-nowrap">
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

          {/* Right Side - Signup Form */}
          <div className="flex-1 flex items-center justify-center bg-white p-8 overflow-y-auto">
            <div className="w-full max-w-md">
              <div className="text-center">
                <div className="mb-8">
                  <div className="flex items-center gap-2 justify-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <span className="text-2xl font-semibold text-gray-900">REVVEN</span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Your AI Revenue Engine
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    Build Your Business While You Sleep
                  </p>
                  <p className="text-lg text-gray-600 whitespace-nowrap text-center mx-auto max-w-xl">
                    Meet The AI Team That Automates Your Content, Marketing & Sales 24/7.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleGoogleSignup}
                    variant="outline"
                    className="w-full h-14 border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-500"
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
                    Continue With Google
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-14 border-2 border-gray-400 focus:border-green-600"
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-14 border-2 border-gray-400 focus:border-green-600"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Enter Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 border-2 border-gray-400 focus:border-green-600"
                      required
                    />
                    
                    {/* Invite Code Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-900">
                          Exclusive Invite Code
                        </label>
                        <span className="text-sm text-red-600">*Required</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter Your Invite Code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="h-14 border-2 border-gray-400 focus:border-green-600 uppercase"
                        required
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Access Is By Invitation Only</span>
                        <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                          No Code? Join Waitlist
                        </a>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-14 bg-green-600 hover:bg-green-700">
                      Get Started FREE
                    </Button>
                  </form>

                  <p className="text-sm text-gray-500 mt-6">
                    No Credit Card Required. Start With Our Free Plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Progress Sidebar - Show for steps 2+ */}
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
                    placeholder="My Workspace"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">
                  Continue
                </Button>
              </form>
            </div>
          )}

          {/* Step 3: About You */}
          {currentStep === 3 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Tell us about you</h1>

              <form onSubmit={handleAboutYou} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your role?
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. CEO, Digital Marketer, Course Creator, Coach..."
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What industry are you in?
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-12 border border-gray-300 rounded-md px-3"
                    required
                  >
                    <option value="">Select an industry...</option>
                    <option value="digital-marketing">Digital Marketing</option>
                    <option value="coaching">Coaching/Consulting</option>
                    <option value="content-creator">Content Creator</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="agency">Agency</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">
                  Meet My Team →
                </Button>
              </form>
            </div>
          )}

          {/* Agent Reveal Steps */}
          {(currentStep === 4 || currentStep === 5 || currentStep === 6) && (
            <AgentRevealStep
              step={currentStep - 3}
              onContinue={handleAgentReveal}
              onSkip={handleSkip}
            />
          )}

          {/* Step 7: Benchmark/Analysis */}
          {currentStep === 7 && <AnalysisStep onContinue={() => setCurrentStep(8)} />}

          {/* Step 8: Enter Dashboard */}
          {currentStep === 8 && (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h1>
                <p className="text-lg text-gray-600">
                  Ready to meet your AI team and start building your business?
                </p>
              </div>

              <Button
                onClick={() => (window.location.href = '/dashboard')}
                className="w-full max-w-md h-14 bg-green-600 hover:bg-green-700 text-lg"
              >
                Enter Dashboard →
              </Button>
            </div>
          )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Agent Reveal Component
const AgentRevealStep = ({
  step,
  onContinue,
  onSkip,
}: {
  step: number;
  onContinue: () => void;
  onSkip: () => void;
}) => {
  const agents = [
    {
      step: 1,
      headline: 'Struggling to create consistent, on-brand content?',
      subhead:
        "Most business owners spend 10+ hours a week writing posts, designing graphics, and creating content that doesn't convert. Meanwhile, your competitors are everywhere, and you're stuck staring at a blank screen.",
      title: 'Meet Dolmar & Keisha — Your Content Creation Engine',
      agent1: {
        name: 'Dolmar — The Visionary',
        benefits: [
          'Creates your AI Avatar that posts in your voice',
          'Generates branded visuals, videos, and graphics',
          'Designs content that stops the scroll',
        ],
      },
      agent2: {
        name: 'Keisha — The Creator',
        benefits: [
          'Writes viral posts, emails, and sales pages',
          'Builds digital products (eBooks, courses, lead magnets)',
          'Produces 30 days of content in 30 minutes',
        ],
      },
      promise:
        '"We\'ll give your brand a voice and face that creates content 24/7—so you never have to choose between showing up and running your business."',
    },
    {
      step: 2,
      headline: 'Getting views but not making sales?',
      subhead:
        "You're posting. People are seeing your content. But your DMs are dry, your offers aren't converting, and you're leaving money on the table every single day. You need a system that turns attention into revenue.",
      title: 'Meet Francis & Rich — Your Revenue Growth Team',
      agent1: {
        name: 'Francis — The Strategist',
        benefits: [
          'Builds marketing funnels that convert cold traffic',
          'Creates SEO-optimized content that ranks on Google',
          'Designs campaigns that drive real buyers to your door',
        ],
      },
      agent2: {
        name: 'Rich — The Closer',
        benefits: [
          'Writes sales scripts and follow-up sequences',
          'Automates lead nurturing and conversion',
          'Turns conversations into cash while you sleep',
        ],
      },
      promise:
        '"We\'ll fill your pipeline with qualified leads and close them automatically—so you stop guessing and start earning."',
    },
    {
      step: 3,
      headline: 'Drowning in busywork and switching between 10 tools?',
      subhead:
        "You're juggling social media schedulers, email platforms, CRMs, design tools, and project management apps. Everything is manual. Nothing talks to each other. And you're spending more time managing tools than growing your business.",
      title: 'Meet Brian & Damoi — Your Business Automation Team',
      agent1: {
        name: 'Brian — The Architect',
        benefits: [
          'Builds automated workflows across all your tools',
          'Connects your systems so they work together',
          'Creates the tech infrastructure that scales your business',
        ],
      },
      agent2: {
        name: 'Damoi — The Operator',
        benefits: [
          'Manages projects and keeps everything on track',
          'Organizes your business so nothing falls through the cracks',
          'Executes systems with precision and consistency',
        ],
      },
      promise:
        '"We\'ll eliminate 80% of your repetitive tasks and give you back 20+ hours every week—so you can focus on strategy, not survival."',
    },
  ];

  const currentAgent = agents[step - 1];

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-sm text-gray-500 mb-4">{step} / 3</div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentAgent.headline}</h1>
      <p className="text-gray-600 mb-8">{currentAgent.subhead}</p>

      {/* Agent Illustrations Placeholder */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
        <div className="text-center mb-6">
          <div className="w-32 h-32 bg-green-200 rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentAgent.title}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{currentAgent.agent1.name}</h3>
            <ul className="space-y-3">
              {currentAgent.agent1.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{currentAgent.agent2.name}</h3>
            <ul className="space-y-3">
              {currentAgent.agent2.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <p className="text-green-900 font-medium text-center">{currentAgent.promise}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={onContinue} className="w-full h-14 bg-green-600 hover:bg-green-700">
          {step === 3 ? "I'm ready to automate →" : "That's exactly what I need →"}
        </Button>
        <button
          onClick={onSkip}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

// Analysis/Benchmark Step
const AnalysisStep = ({ onContinue }: { onContinue: () => void }) => {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <div className="mb-8">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Analyzing success patterns from Digital Marketing businesses we've helped...
          </h1>
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          <div className="flex items-center gap-3 justify-center text-gray-600">
            <Check className="w-5 h-5 text-green-600" />
            <span>1,089 Similar Businesses Found</span>
          </div>
          <div className="flex items-center gap-3 justify-center text-gray-600">
            <Check className="w-5 h-5 text-green-600" />
            <span>Time Optimization Potential: 23 hours/week</span>
          </div>
          <div className="flex items-center gap-3 justify-center text-gray-600">
            <Check className="w-5 h-5 text-green-600" />
            <span>Identifying Growth Areas</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        You're all set — let's see how your business compares
      </h1>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">448 Digital Marketing Companies Found</span>
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Time Optimization Potential</span>
            <span className="text-2xl font-bold text-green-600">19 hours/week</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Growth Areas Identified</span>
            <Check className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Key Insights:</strong> Content consistency, lead nurturing, and automation gaps
          </p>
        </div>
      </div>

      <Button onClick={onContinue} className="w-full h-14 bg-green-600 hover:bg-green-700">
        Enter Dashboard →
      </Button>
    </div>
  );
};
