import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import IdentityPage from './IdentityPage';
import VoicePage from './VoicePage';
import KnowledgeBasePage from './KnowledgeBasePage';
import IntelligencePage from './IntelligencePage';
import CharactersPage from './CharactersPage';
import ReviewPage from './ReviewPage';
import CompletionPage from './CompletionPage';
import BrandWizardProgress from './BrandWizardProgress';

interface BrandWizardData {
  // Identity
  logo?: File | string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  
  // Voice
  toneOfVoice: string[];
  writingStyle: string;
  communicationGuidelines: string;
  brandPersonality: string[];
  dosList: string[];
  dontsList: string[];
  
  // Knowledge Base
  dataSources: any[];
  
  // Intelligence
  competitors: any[];
  emailCompetitors: any[];
  trackedContent: any[];
  
  // Characters
  selectedCharacters: string[];
  defaultCharacter: string;
}

const BrandWizard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIncompleteBanner, setShowIncompleteBanner] = useState(false);
  const [formData, setFormData] = useState<BrandWizardData>({
    brandName: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
    primaryFont: 'Inter',
    secondaryFont: 'Inter',
    toneOfVoice: [],
    writingStyle: '',
    communicationGuidelines: '',
    brandPersonality: [],
    dosList: [],
    dontsList: [],
    dataSources: [],
    competitors: [],
    emailCompetitors: [],
    trackedContent: [],
    selectedCharacters: [],
    defaultCharacter: '',
  });

  const steps = [
    'Identity',
    'Voice',
    'Knowledge Base',
    'Intelligence',
    'Characters',
    'Review',
    'Complete',
  ];

  const sectionToStepIndex: Record<string, number> = {
    identity: 0,
    voice: 1,
    'knowledge-base': 2,
    knowledge: 2,
    intelligence: 3,
    characters: 4,
    review: 5,
  };

  // Handle URL parameters for incomplete profile navigation or new brand creation
  useEffect(() => {
    const section = searchParams.get('section');
    const incomplete = searchParams.get('incomplete');
    const isNew = searchParams.get('new');
    
    if (isNew === 'true') {
      // Reset form for new brand
      setFormData({
        brandName: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        accentColor: '#10B981',
        primaryFont: 'Inter',
        secondaryFont: 'Inter',
        toneOfVoice: [],
        writingStyle: '',
        communicationGuidelines: '',
        brandPersonality: [],
        dosList: [],
        dontsList: [],
        dataSources: [],
        competitors: [],
        emailCompetitors: [],
        trackedContent: [],
        selectedCharacters: [],
        defaultCharacter: '',
      });
      setCurrentStep(0);
      setShowIncompleteBanner(false);
      // Clear the params after processing
      setSearchParams({});
      return;
    }
    
    if (section && sectionToStepIndex[section] !== undefined) {
      setCurrentStep(sectionToStepIndex[section]);
      
      if (incomplete === 'true') {
        setShowIncompleteBanner(true);
      }
      
      // Clear the params after processing
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const dismissBanner = () => {
    setShowIncompleteBanner(false);
  };

  const handleUpdate = (updates: Partial<BrandWizardData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const handleFinalComplete = () => {
    console.log('Brand Setup Complete!', formData);
    // Here you would typically:
    // 1. Save the data to your backend
    // 2. Redirect to the main dashboard
    // 3. Show a success message
    setCurrentStep(currentStep + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <IdentityPage
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            canGoBack={false}
          />
        );
      case 1:
        return (
          <VoicePage
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <KnowledgeBasePage
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <IntelligencePage
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <CharactersPage
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onBack={handleBack}
            canGoBack={true}
          />
        );
      case 5:
        return (
          <ReviewPage
            formData={formData}
            onEdit={handleEdit}
            onComplete={handleFinalComplete}
            onBack={handleBack}
          />
        );
      case 6:
        return <CompletionPage />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Incomplete Profile Banner */}
      {showIncompleteBanner && (
        <div className="bg-brand-yellow/10 border-b border-brand-yellow/30">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                <AlertCircle size={18} className="text-brand-yellow" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Complete Your Brand Profile</p>
                <p className="text-xs text-muted-foreground">Fill in the required information below to finish setting up this brand.</p>
              </div>
            </div>
            <button 
              onClick={dismissBanner}
              className="p-1.5 hover:bg-brand-yellow/20 rounded-md transition"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <BrandWizardProgress 
          currentStep={currentStep} 
          onStepClick={(stepIndex) => setCurrentStep(stepIndex)} 
        />
      </div>
      {renderStep()}
    </div>
  );
};

export default BrandWizard;
