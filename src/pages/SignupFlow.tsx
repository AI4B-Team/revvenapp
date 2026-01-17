import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight, Mail, Phone, Globe, Code, Image, FileText, Bell, Sparkles, ArrowRight, ArrowLeft, Zap, Clock, Target, Shield, Rocket, Brain, MessageSquare, Video, BarChart3, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Progress sidebar component
const SignupProgress = ({ currentStep }: { currentStep: number }) => {
  const getStepStatus = (stepId: number) => {
    const stepMappings: { [key: number]: number[] } = {
      1: [1],
      2: [2],
      3: [3],
      4: [4, 5, 6],
      5: [7, 8],
      6: [9, 10],
    };

    for (const [displayStep, actualSteps] of Object.entries(stepMappings)) {
      if (actualSteps.includes(stepId)) {
        return { displayStep: parseInt(displayStep), isActive: actualSteps.includes(currentStep) };
      }
    }
    return { displayStep: 0, isActive: false };
  };

  const steps = [
    { id: 1, label: 'Account', completed: currentStep > 1 },
    { id: 2, label: 'Space', completed: currentStep > 2 },
    { id: 3, label: 'Profile', completed: currentStep > 3 },
    { id: 4, label: 'Capabilities', completed: currentStep > 6 },
    { id: 5, label: 'Connect', completed: currentStep > 8 },
    { id: 6, label: 'Launch', completed: currentStep > 10 },
  ];

  const getCurrentDisplayStep = () => {
    if (currentStep <= 1) return 1;
    if (currentStep <= 2) return 2;
    if (currentStep <= 3) return 3;
    if (currentStep <= 6) return 4;
    if (currentStep <= 8) return 5;
    return 6;
  };

  const currentDisplayStep = getCurrentDisplayStep();

  return (
    <div className="w-80 bg-gradient-to-b from-slate-50 to-white p-8 min-h-screen border-r border-slate-200">
      <div className="mb-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">REVVEN</span>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-5">
          Your Journey
        </h3>
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isActive = step.id === currentDisplayStep;
            const isCompleted = step.completed || step.id < currentDisplayStep;

            return (
              <div key={step.id} className="relative">
                <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-green-50' : ''}`}>
                  {isCompleted && !isActive ? (
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 shadow-sm ring-4 ring-green-100">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex-shrink-0 bg-white" />
                  )}
                  <span
                    className={`text-sm transition-all ${
                      isActive
                        ? 'text-green-700 font-semibold'
                        : isCompleted
                        ? 'text-slate-600 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute left-[19px] top-[38px] w-0.5 h-3 ${isCompleted ? 'bg-green-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// Capability card component
const CapabilityCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden p-5 rounded-2xl border border-slate-200 bg-white hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300 group cursor-default`}
  >
    <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

// Goal option component
const GoalOption = ({ 
  selected, 
  onClick, 
  icon: Icon, 
  title, 
  description 
}: { 
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
      selected
        ? 'border-green-600 bg-green-50 shadow-lg shadow-green-100'
        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? 'bg-green-600' : 'bg-slate-100'}`}>
        <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-slate-500'}`} />
      </div>
      <div>
        <span className="font-semibold text-slate-900 block">{title}</span>
        <span className="text-sm text-slate-500">{description}</span>
      </div>
    </div>
  </button>
);

// Main signup flow component
export default function SignupFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(2);
  const [workspaceName, setWorkspaceName] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeToSms, setAgreeToSms] = useState(false);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [timezone, setTimezone] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Detect timezone on mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detectedTimezone);
    } catch (e) {
      setTimezone('UTC');
    }
  }, []);

  const handleWorkspaceSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (workspaceName.trim()) {
      setCurrentStep(3);
    }
  };

  const handleAboutYou = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handleGoBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEmailSave = () => {
    if (email.trim()) {
      toast.success('Email preferences saved!');
    }
    setCurrentStep(8);
  };

  const handlePhoneSave = () => {
    if (phoneNumber.trim() && agreeToSms) {
      toast.success('Phone number saved!');
    }
    setCurrentStep(9);
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
    setCurrentStep(10);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <SignupProgress currentStep={currentStep} />

      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step 2: Workspace Setup */}
            {currentStep === 2 && (
              <motion.div
                key="workspace"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-4">
                    <Layers className="w-3 h-3" />
                    SPACE SETUP
                  </span>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Name Your Command Center</h1>
                  <p className="text-lg text-slate-600">
                    This is your main Space where all AI-powered projects live. Choose a name that represents your brand or mission.
                  </p>
                </div>

                <form onSubmit={handleWorkspaceSetup} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Workspace Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Acme Marketing, My Studio, Growth Labs"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="h-14 text-lg border-slate-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      You can always change this later in settings.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={!workspaceName.trim()}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8 text-base font-medium disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Your Profile */}
            {currentStep === 3 && (
              <motion.div
                key="profile"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-4">
                    <Brain className="w-3 h-3" />
                    PERSONALIZATION
                  </span>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Tell Us About Yourself</h1>
                  <p className="text-lg text-slate-600">
                    We'll customize your experience based on your role and industry.
                  </p>
                </div>

                <form onSubmit={handleAboutYou} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Jane Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      What describes you best?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'Entrepreneur', label: 'Entrepreneur', desc: 'Building something new' },
                        { value: 'Content Creator', label: 'Creator', desc: 'Making content & media' },
                        { value: 'Marketing Professional', label: 'Marketer', desc: 'Growing brands' },
                        { value: 'Business Owner', label: 'Business Owner', desc: 'Running operations' },
                        { value: 'Freelancer', label: 'Freelancer', desc: 'Independent professional' },
                        { value: 'Agency Owner', label: 'Agency', desc: 'Serving clients' },
                      ].map((roleOption) => (
                        <button
                          key={roleOption.value}
                          type="button"
                          onClick={() => setRole(roleOption.value)}
                          className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                            role === roleOption.value
                              ? 'border-green-600 bg-green-50 shadow-md'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-semibold text-slate-900 block">{roleOption.label}</span>
                          <span className="text-xs text-slate-500">{roleOption.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Your Industry
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        'E-commerce',
                        'Consulting',
                        'Real Estate',
                        'SaaS / Tech',
                        'Health',
                        'Education',
                        'Finance',
                        'Creative',
                        'Other',
                      ].map((industryOption) => (
                        <button
                          key={industryOption}
                          type="button"
                          onClick={() => setIndustry(industryOption)}
                          className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                            industry === industryOption
                              ? 'border-green-600 bg-green-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-sm font-medium text-slate-900">{industryOption}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoBack}
                      className="h-12 px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!role || !industry || !fullName.trim()}
                      className="bg-green-600 hover:bg-green-700 h-12 px-8 disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 4: What's Your Primary Goal */}
            {currentStep === 4 && (
              <motion.div
                key="goal"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-4">
                    <Target className="w-3 h-3" />
                    YOUR FOCUS
                  </span>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">What brings you here?</h1>
                  <p className="text-lg text-slate-600">
                    Select your primary goal and we'll prioritize the right tools for you.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  <GoalOption
                    selected={primaryGoal === 'content'}
                    onClick={() => setPrimaryGoal('content')}
                    icon={Video}
                    title="Create Content Faster"
                    description="Videos, images, copy — all generated at scale"
                  />
                  <GoalOption
                    selected={primaryGoal === 'marketing'}
                    onClick={() => setPrimaryGoal('marketing')}
                    icon={BarChart3}
                    title="Grow My Audience"
                    description="Automate marketing, ads, and outreach campaigns"
                  />
                  <GoalOption
                    selected={primaryGoal === 'automation'}
                    onClick={() => setPrimaryGoal('automation')}
                    icon={Zap}
                    title="Automate My Business"
                    description="Save hours with AI-powered workflows"
                  />
                  <GoalOption
                    selected={primaryGoal === 'explore'}
                    onClick={() => setPrimaryGoal('explore')}
                    icon={Rocket}
                    title="Explore Everything"
                    description="I want to see all that REVVEN can do"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    disabled={!primaryGoal}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8 disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: AI Capabilities Overview */}
            {currentStep === 5 && (
              <motion.div
                key="capabilities"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                    <Sparkles className="w-3 h-3" />
                    YOUR TOOLKIT
                  </span>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Your AI Arsenal</h1>
                  <p className="text-lg text-slate-600">
                    REVVEN gives you access to powerful capabilities that work together seamlessly.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <CapabilityCard 
                    icon={Mail} 
                    title="Email Intelligence" 
                    description="Draft, send, and manage emails automatically"
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  />
                  <CapabilityCard 
                    icon={Phone} 
                    title="Voice AI" 
                    description="AI-powered calls and voice synthesis"
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                  />
                  <CapabilityCard 
                    icon={Globe} 
                    title="Web Research" 
                    description="Deep internet research and data extraction"
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                  />
                  <CapabilityCard 
                    icon={Code} 
                    title="Code & Apps" 
                    description="Build automations and integrations"
                    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                  />
                  <CapabilityCard 
                    icon={Image} 
                    title="Visual Creation" 
                    description="Generate images, videos, and graphics"
                    gradient="bg-gradient-to-br from-pink-500 to-pink-600"
                  />
                  <CapabilityCard 
                    icon={FileText} 
                    title="Document AI" 
                    description="Create, edit, and analyze documents"
                    gradient="bg-gradient-to-br from-slate-500 to-slate-600"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(6)}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Smart Pacing Explanation */}
            {currentStep === 6 && (
              <motion.div
                key="pacing"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Intelligent Pacing</h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    REVVEN knows when to wait. Whether it's waiting for an email reply, a website update, or the perfect moment to act — your AI pauses intelligently and picks back up automatically.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Set it and forget it</h3>
                      <p className="text-slate-600">
                        You don't need to babysit your AI. It works in the background, respecting rate limits and optimal timing while you focus on what matters.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(7)}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 7: Email Preferences */}
            {currentStep === 7 && (
              <motion.div
                key="email"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
                    <Mail className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Stay In The Loop</h1>
                  <p className="text-lg text-slate-600">
                    Where should we send important updates about your AI projects?
                  </p>
                </div>

                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 text-lg border-slate-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/30 transition-all">
                    <input
                      type="checkbox"
                      checked={emailUpdates}
                      onChange={(e) => setEmailUpdates(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900 block">Send me weekly insights</span>
                      <span className="text-sm text-slate-500">Tips, updates, and ways to get more from REVVEN</span>
                    </div>
                  </label>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>We respect your inbox. Unsubscribe anytime.</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleEmailSave}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 8: Phone Number */}
            {currentStep === 8 && (
              <motion.div
                key="phone"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Get Instant Alerts</h1>
                  <p className="text-lg text-slate-600">
                    Receive text notifications when critical tasks complete or need your attention.
                  </p>
                </div>

                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mobile Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-14 text-lg border-slate-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {phoneNumber.trim() && (
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/30 transition-all">
                      <input
                        type="checkbox"
                        checked={agreeToSms}
                        onChange={(e) => setAgreeToSms(e.target.checked)}
                        className="mt-0.5 h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <span className="font-medium text-slate-900 block">I agree to receive SMS updates</span>
                        <span className="text-sm text-slate-500">Message & data rates may apply. Reply STOP to cancel.</span>
                      </div>
                    </label>
                  )}

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>We detected your timezone: <span className="font-medium text-slate-900">{timezone}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePhoneSave}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 9: Browser Notifications */}
            {currentStep === 9 && (
              <motion.div
                key="notifications"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-amber-200">
                    <Bell className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Never Miss a Moment</h1>
                  <p className="text-lg text-slate-600">
                    Get real-time browser notifications when your AI completes important work.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Instant updates</h3>
                      <p className="text-slate-600">
                        We'll only notify you about meaningful progress — completed tasks, important milestones, and items needing review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleEnableNotifications}
                    className="bg-green-600 hover:bg-green-700 h-14 text-base font-medium"
                  >
                    Enable Notifications
                    <Bell className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleGoBack}
                      className="h-12 px-6 flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep(10)}
                      className="h-12 px-6 text-slate-500 hover:text-slate-700 flex-1"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 10: Ready to Launch */}
            {currentStep === 10 && (
              <motion.div
                key="launch"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-10">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">You're Ready to Launch</h1>
                  <p className="text-lg text-slate-600 max-w-md mx-auto">
                    Your workspace is set up and your AI is ready to work. Think big — REVVEN handles the complexity.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-8 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-amber-400">Pro Tip</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    Don't start with small tasks. Give REVVEN something ambitious:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-xs">✕</div>
                      <span className="line-through">"Send an email to John"</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-400">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-medium">"Launch a 30-day content campaign for my new product"</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="h-14 px-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 text-lg font-semibold shadow-lg shadow-green-200"
                  >
                    Enter REVVEN
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enterprise Ready - Bottom of main panel */}
          <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Enterprise Ready — Your data is encrypted and secure at every step.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
