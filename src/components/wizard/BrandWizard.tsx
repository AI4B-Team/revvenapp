import React, { useState } from 'react';
import IdentityPage from './IdentityPage';
import VoicePage from './VoicePage';
import KnowledgeBasePage from './KnowledgeBasePage';
import IntelligencePage from './IntelligencePage';
import CharactersPage from './CharactersPage';
import ReviewPage from './ReviewPage';
import CompletionPage from './CompletionPage';

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
  trackedContent: any[];
  
  // Characters
  selectedCharacters: string[];
  defaultCharacter: string;
}

const BrandWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
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
    <div className="w-full h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
};

export default BrandWizard;
