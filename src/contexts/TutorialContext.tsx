import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: (tutorialId: string, steps: TutorialStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  hasCompletedTutorial: (tutorialId: string) => boolean;
  currentTutorialId: string | null;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentTutorialId, setCurrentTutorialId] = useState<string | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedTutorials');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }, [completedTutorials]);

  const startTutorial = (tutorialId: string, tutorialSteps: TutorialStep[]) => {
    if (!completedTutorials.includes(tutorialId)) {
      setCurrentTutorialId(tutorialId);
      setSteps(tutorialSteps);
      setCurrentStep(0);
      setIsActive(true);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    if (currentTutorialId) {
      setCompletedTutorials(prev => [...prev, currentTutorialId]);
    }
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    setCurrentTutorialId(null);
  };

  const completeTutorial = () => {
    if (currentTutorialId) {
      setCompletedTutorials(prev => [...prev, currentTutorialId]);
    }
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    setCurrentTutorialId(null);
  };

  const hasCompletedTutorial = (tutorialId: string) => {
    return completedTutorials.includes(tutorialId);
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        hasCompletedTutorial,
        currentTutorialId,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};
