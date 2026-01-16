import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight, Mail, Phone, Globe, Code, Image, FileText, Bell, Sparkles, ArrowRight, ArrowLeft, Zap, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Progress sidebar component
const SignupProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Create Account', completed: true },
    { id: 2, label: 'Workspace', completed: currentStep > 2 },
    { id: 3, label: 'Your Profile', completed: currentStep > 3 },
    { id: 4, label: 'Platform Tour', completed: currentStep > 7 },
    { id: 5, label: 'Get Started', completed: currentStep > 8 },
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
              ) : step.id === Math.min(currentStep, 5) || (currentStep >= 4 && currentStep <= 7 && step.id === 4) || (currentStep >= 8 && step.id === 5) ? (
                <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  step.id === Math.min(currentStep, 5) || (currentStep >= 4 && currentStep <= 7 && step.id === 4) || (currentStep >= 8 && step.id === 5)
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

// Toolkit item component
const ToolkitItem = ({ icon: Icon, label, description }: { icon: React.ElementType; label: string; description: string }) => (
  <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-green-600" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900">{label}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

// Main signup flow component
export default function SignupFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (workspace)
  const [workspaceName, setWorkspaceName] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeToSms, setAgreeToSms] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleWorkspaceSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleAboutYou = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handlePhoneSave = () => {
    if (phoneNumber.trim()) {
      toast.success('Phone number saved!');
    }
    setCurrentStep(7);
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
    setCurrentStep(8);
  };

  const handleSkipNotifications = () => {
    setCurrentStep(8);
  };

  const handleGoBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
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
                  <label className="block text-lg font-bold text-gray-900 mb-2">
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
                    Your Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

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
                  disabled={!role || !industry || !fullName.trim()}
                  className="bg-green-600 hover:bg-green-700 h-12 px-8 disabled:opacity-50"
                >
                  Continue
                </Button>
              </form>
            </div>
          )}

          {/* Step 4: Your Toolkit Overview */}
          {currentStep === 4 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your AI Toolkit</h1>
              <p className="text-gray-600 mb-8">
                REVVEN has powerful tools to get real work done for you
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <ToolkitItem icon={Mail} label="Email" description="Send and manage emails" />
                <ToolkitItem icon={Phone} label="Phone" description="Make calls with AI voice" />
                <ToolkitItem icon={Globe} label="Browser" description="Deep web research" />
                <ToolkitItem icon={Code} label="Code" description="Build apps and automations" />
                <ToolkitItem icon={Image} label="Images" description="Generate visual content" />
                <ToolkitItem icon={FileText} label="Documents" description="Create and edit files" />
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
                  className="bg-green-600 hover:bg-green-700 h-12 px-8"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: How It Works - Self Reflection */}
          {currentStep === 5 && (
            <div>
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Smart Pacing</h1>
                <p className="text-gray-600 text-lg">
                  Your AI can pause and restart itself when it needs to wait for things to unfold. 
                  Waiting for an email reply? Waiting for a website to update? 
                  Your AI will pause, then pick back up when the time is right.
                </p>
                <p className="text-green-600 font-medium mt-4">No worries about it overworking.</p>
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
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Add Your Phone */}
          {currentStep === 6 && (
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Your Phone</h1>
              <p className="text-gray-600 mb-8">
                Want updates via text? Add your phone number below. This is optional.
              </p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12"
                  />
                </div>

                {phoneNumber.trim() && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToSms}
                      onChange={(e) => setAgreeToSms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to receive SMS from REVVEN. Message/data rates may apply. Reply STOP to cancel.
                    </span>
                  </label>
                )}

                <p className="text-sm text-gray-500">
                  You can skip this and add it later in Settings.
                </p>
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
                  {phoneNumber.trim() ? 'Save & Continue' : 'Skip for Now'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 7: Enable Notifications */}
          {currentStep === 7 && (
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enable Notifications</h1>
              <p className="text-gray-600 mb-8">
                Get notified when your tasks complete, even when you're in another tab.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Stay in the loop</h3>
                    <p className="text-sm text-gray-600">
                      We'll only send important updates about your projects and AI activity.
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
                  variant="outline"
                  onClick={handleSkipNotifications}
                  className="h-12 px-6"
                >
                  Not now
                </Button>
                <Button
                  onClick={handleEnableNotifications}
                  className="bg-green-600 hover:bg-green-700 h-12 px-8"
                >
                  Enable
                </Button>
              </div>
            </div>
          )}

          {/* Step 8: Ready to Start */}
          {currentStep === 8 && (
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Think Projects, Not Tasks</h1>
              <p className="text-gray-600 mb-8">
                REVVEN works best on big, ambitious goals. Give it something meaningful to work on.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-xs">✕</span>
                  </div>
                  <span className="line-through">"Send an email to John"</span>
                </div>
                <div className="flex items-center gap-3 text-green-600">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="font-medium">"Launch a newsletter and get 100 subscribers"</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Pro tip</span>
                </div>
                <p className="text-green-700">
                  Give REVVEN the thing that is most stressing you out right now. 
                  Let it handle the complexity while you focus on what matters.
                </p>
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
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 px-8"
                >
                  Let's Get Started!
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
