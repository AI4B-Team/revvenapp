import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useTutorial } from '@/contexts/TutorialContext';

interface TutorialTriggerProps {
  tutorialId: string;
  steps: { id: string; title: string; description: string }[];
  className?: string;
}

const TutorialTrigger: React.FC<TutorialTriggerProps> = ({ tutorialId, steps, className }) => {
  const { startTutorial, hasCompletedTutorial } = useTutorial();

  const handleClick = () => {
    // Force start by temporarily removing from completed list
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    const filtered = completedTutorials.filter((id: string) => id !== tutorialId);
    localStorage.setItem('completedTutorials', JSON.stringify(filtered));
    
    // Small delay to ensure state updates
    setTimeout(() => {
      startTutorial(tutorialId, steps);
    }, 50);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={className}
      title="Show tutorial"
    >
      <HelpCircle className="w-4 h-4 mr-1.5" />
      Help
    </Button>
  );
};

export default TutorialTrigger;
