import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight, Mail, Phone, Globe, Code, Image, FileText, Bell, Sparkles, ArrowRight, ArrowLeft, Zap, Clock, Target, Shield, Rocket, Brain, MessageSquare, Video, BarChart3, Layers, RefreshCw, User } from 'lucide-react';
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
    { id: 3, label: 'Agent', completed: currentStep > 3 },
    { id: 4, label: 'Profile', completed: currentStep > 4 },
    { id: 5, label: 'Capabilities', completed: currentStep > 7 },
    { id: 6, label: 'Launch', completed: currentStep > 10 },
  ];

  const getCurrentDisplayStep = () => {
    if (currentStep <= 1) return 1;
    if (currentStep <= 2) return 2;
    if (currentStep <= 3) return 3;
    if (currentStep <= 4) return 4;
    if (currentStep <= 7) return 5;
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
  color 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden p-5 rounded-2xl border border-slate-200 bg-white hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300 group cursor-default`}
  >
    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
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
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [showCustomAgentName, setShowCustomAgentName] = useState(false);
  const [customFirstName, setCustomFirstName] = useState('');
  const [customLastName, setCustomLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeToSms, setAgreeToSms] = useState(false);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [timezone, setTimezone] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(true);
  
  // Generate random agent names
  const [suggestedAgents, setSuggestedAgents] = useState<Array<{ name: string; email: string }>>([]);
  
  const firstNames = ['David', 'Michael', 'James', 'Sarah', 'Emily', 'Daniel', 'Christopher', 'Andrew', 'Jessica', 'Amanda', 'Matthew', 'Jennifer', 'William', 'Elizabeth', 'Robert', 'Ashley', 'Thomas', 'Sophia', 'Charles', 'Olivia'];
  const lastNames = ['Thompson', 'Johnson', 'Carter', 'Williams', 'Anderson', 'Harrington', 'Sullivan', 'McAllister', 'Bennett', 'Mitchell', 'Reynolds', 'Crawford', 'Morrison', 'Patterson', 'Henderson', 'Richardson', 'Montgomery', 'Wellington'];
  
  const generateAgentNames = () => {
    const agents: Array<{ name: string; email: string }> = [];
    const usedCombos = new Set<string>();
    
    while (agents.length < 3) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const combo = `${firstName} ${lastName}`;
      
      if (!usedCombos.has(combo)) {
        usedCombos.add(combo);
        agents.push({
          name: combo,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@revven.ai`
        });
      }
    }
    
    setSuggestedAgents(agents);
  };
  
  useEffect(() => {
    generateAgentNames();
  }, []);

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
  
  const handleAgentSetup = () => {
    if (agentName.trim()) {
      setCurrentStep(4);
    }
  };
  
  const selectAgentName = (agent: { name: string; email: string }) => {
    setAgentName(agent.name);
    setAgentEmail(agent.email);
    setShowCustomAgentName(false);
  };
  
  const handleCustomAgentName = () => {
    if (customFirstName.trim() && customLastName.trim()) {
      const name = `${customFirstName} ${customLastName}`;
      const email = `${customFirstName.toLowerCase()}.${customLastName.toLowerCase()}@revven.ai`;
      setAgentName(name);
      setAgentEmail(email);
    }
  };
  
  useEffect(() => {
    if (showCustomAgentName && customFirstName.trim() && customLastName.trim()) {
      handleCustomAgentName();
    }
  }, [customFirstName, customLastName, showCustomAgentName]);

  const handleAboutYou = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(5);
  };

  const handleGoBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
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
    setCurrentStep(9);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <SignupProgress currentStep={currentStep} />

      <div className="flex-1 flex flex-col min-h-screen">
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

            {/* Step 3: Name Your Agent */}
            {currentStep === 3 && (
              <motion.div
                key="agent"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
                    <User className="w-3 h-3" />
                    YOUR AI EMPLOYEE
                  </span>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Name Your Agent</h1>
                  <p className="text-lg text-slate-600">
                    Your agent will use this name when contacting people on your behalf, as if it were your employee.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {suggestedAgents.map((agent, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAgentName(agent)}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                        agentName === agent.name && !showCustomAgentName
                          ? 'border-green-600 bg-green-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{agent.name}</span>
                        <span className="text-sm text-slate-500">{agent.email}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => generateAgentNames()}
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium mb-6 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Give me new names
                </button>

                <div className="border-t border-slate-200 pt-6 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomAgentName(!showCustomAgentName);
                      if (!showCustomAgentName) {
                        setAgentName('');
                        setAgentEmail('');
                      }
                    }}
                    className={`text-sm font-medium transition-colors ${
                      showCustomAgentName ? 'text-green-600' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {showCustomAgentName ? '✓ Enter your own name' : 'I want to write my own name'}
                  </button>

                  {showCustomAgentName && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-4"
                    >
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Or Enter Your Own</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                          <Input
                            type="text"
                            placeholder="Christina"
                            value={customFirstName}
                            onChange={(e) => setCustomFirstName(e.target.value)}
                            className="h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                          <Input
                            type="text"
                            placeholder="Martinez"
                            value={customLastName}
                            onChange={(e) => setCustomLastName(e.target.value)}
                            className="h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      {customFirstName && customLastName && (
                        <p className="text-sm text-slate-500">
                          Agent email: <span className="font-medium text-slate-700">{customFirstName.toLowerCase()}.{customLastName.toLowerCase()}@revven.ai</span>
                        </p>
                      )}
                    </motion.div>
                  )}
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
                    onClick={handleAgentSetup}
                    disabled={!agentName.trim()}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8 disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Your Profile */}
            {currentStep === 4 && (
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
                    We'll customize your experience based on who you are.
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Get text alerts when critical tasks complete.
                    </p>
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
                        <span className="text-sm text-slate-500">Message & data rates may apply.</span>
                      </div>
                    </label>
                  )}

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
                      disabled={!role || !fullName.trim()}
                      className="bg-green-600 hover:bg-green-700 h-12 px-8 disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 5: What's Your Primary Goal */}
            {currentStep === 5 && (
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
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">What Brings You Here?</h1>
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
                    onClick={() => setCurrentStep(6)}
                    disabled={!primaryGoal}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8 disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: AI Capabilities Overview */}
            {currentStep === 6 && (
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
                    icon={Brain} 
                    title="Autonomous Agents" 
                    description="AI workers that execute multi-step tasks 24/7 without supervision"
                    color="bg-indigo-600"
                  />
                  <CapabilityCard 
                    icon={Phone} 
                    title="Voice AI & Cloning" 
                    description="Realistic AI voices, voice cloning, and automated phone calls"
                    color="bg-purple-600"
                  />
                  <CapabilityCard 
                    icon={Video} 
                    title="AI Video Generation" 
                    description="Create viral shorts, explainers, and talking avatars automatically"
                    color="bg-rose-600"
                  />
                  <CapabilityCard 
                    icon={Target} 
                    title="Predictive Analytics" 
                    description="Forecast trends, optimize campaigns, and predict outcomes"
                    color="bg-emerald-600"
                  />
                  <CapabilityCard 
                    icon={Globe} 
                    title="Deep Web Intelligence" 
                    description="Real-time scraping, competitor analysis, and market research"
                    color="bg-cyan-600"
                  />
                  <CapabilityCard 
                    icon={Layers} 
                    title="Multi-Modal Reasoning" 
                    description="Process text, images, documents, and data in unified workflows"
                    color="bg-amber-600"
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
                    onClick={() => setCurrentStep(7)}
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
                  <div className="w-20 h-20 rounded-3xl bg-indigo-500 flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Intelligent Pacing</h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    REVVEN knows when to wait. Whether it's waiting for an email reply, a website update, or the perfect moment to act — your AI pauses intelligently and picks back up automatically.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Set It & Forget It</h3>
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

            {/* Step 8: Browser Notifications */}
            {currentStep === 8 && (
              <motion.div
                key="notifications"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500 flex items-center justify-center mb-6 shadow-xl shadow-amber-200">
                    <Bell className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Never Miss a Moment</h1>
                  <p className="text-lg text-slate-600">
                    Get real-time browser notifications when your AI completes important work.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-8">
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
                      onClick={() => setCurrentStep(9)}
                      className="h-12 px-6 text-slate-500 hover:text-slate-700 flex-1"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 9: Ready to Launch */}
            {currentStep === 9 && (
              <motion.div
                key="launch"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-10">
                  <div className="w-24 h-24 rounded-3xl bg-green-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">You're Ready to Launch</h1>
                  <p className="text-lg text-slate-600 max-w-md mx-auto">
                    Your workspace is set up and your AI is ready to work. Think big — REVVEN handles the complexity.
                  </p>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-white">
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
                    className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold shadow-lg shadow-green-200"
                  >
                    Enter REVVEN
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Enterprise Ready - Fixed at bottom */}
        <div className="py-6 flex items-center justify-center gap-2 text-slate-400">
          <Shield className="w-4 h-4" />
          <span className="text-sm">Enterprise Ready — Your Data Is Encrypted And Secure At Every Step.</span>
        </div>
      </div>
    </div>
  );
}
