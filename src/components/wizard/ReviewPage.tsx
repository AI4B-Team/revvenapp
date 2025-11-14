import React from 'react';
import { Palette, MessageSquare, Database, Brain, Users, Edit2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewPageProps {
  formData: any;
  onEdit: (step: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

const ReviewPage: React.FC<ReviewPageProps> = ({
  formData,
  onEdit,
  onComplete,
  onBack,
}) => {
  const sections = [
    {
      title: 'Brand Identity',
      icon: Palette,
      step: 0,
      items: [
        { label: 'Brand Name', value: formData.brandName },
        { label: 'Primary Color', value: formData.primaryColor, isColor: true },
        { label: 'Secondary Color', value: formData.secondaryColor, isColor: true },
        { label: 'Primary Font', value: formData.primaryFont },
      ]
    },
    {
      title: 'Brand Voice',
      icon: MessageSquare,
      step: 1,
      items: [
        { label: 'Tone of Voice', value: formData.toneOfVoice?.join(', ') || 'Not set' },
        { label: 'Writing Style', value: formData.writingStyle || 'Not set' },
        { label: 'Personality Traits', value: formData.brandPersonality?.join(', ') || 'Not set' },
      ]
    },
    {
      title: 'Knowledge Base',
      icon: Database,
      step: 2,
      items: [
        { label: 'Data Sources', value: `${formData.dataSources?.length || 0} sources added` },
      ]
    },
    {
      title: 'Intelligence',
      icon: Brain,
      step: 3,
      items: [
        { label: 'Competitors', value: `${formData.competitors?.length || 0} tracked` },
        { label: 'Content Tracking', value: `${formData.trackedContent?.length || 0} items` },
      ]
    },
    {
      title: 'Characters',
      icon: Users,
      step: 4,
      items: [
        { label: 'Selected Characters', value: `${formData.selectedCharacters?.length || 0} characters` },
        { label: 'Default Character', value: formData.defaultCharacter || 'Not set' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Review Your Brand Setup
          </h1>
          <p className="text-muted-foreground text-lg">
            Take a moment to review your brand configuration before completing the setup
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  step === 6
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-primary/30'
                }`}
              />
            ))}
          </div>
          <span className="ml-4 text-sm text-muted-foreground">Step 6 of 7</span>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(section.step)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
                
                <div className="space-y-3 ml-13">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <span className="text-sm text-muted-foreground min-w-[140px]">
                        {item.label}:
                      </span>
                      {item.isColor ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: item.value }}
                          />
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium flex-1">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2"
          >
            Back
          </Button>
          <Button
            onClick={onComplete}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Brand Setup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
