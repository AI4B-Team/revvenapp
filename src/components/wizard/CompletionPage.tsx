import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { CheckCircle, BookOpen, Rocket, Sparkles, Users, TrendingUp, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const nextSteps = [
    {
      icon: BookOpen,
      title: 'Create an Ebook',
      description: 'Generate a professional ebook using your brand voice and style',
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/create'),
    },
    {
      icon: Rocket,
      title: 'Launch a Campaign',
      description: 'Start a marketing campaign with AI-powered content creation',
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/create'),
    },
    {
      icon: Users,
      title: 'Generate Social Content',
      description: 'Create engaging social media posts that match your brand',
      color: 'from-pink-500 to-pink-600',
      action: () => navigate('/create'),
    },
    {
      icon: Mail,
      title: 'Design Email Templates',
      description: 'Build branded email templates for your marketing campaigns',
      color: 'from-green-500 to-green-600',
      action: () => navigate('/create'),
    },
    {
      icon: TrendingUp,
      title: 'Track Performance',
      description: 'Monitor your content performance and analytics',
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/'),
    },
    {
      icon: Sparkles,
      title: 'Explore AI Tools',
      description: 'Discover more AI-powered features to grow your brand',
      color: 'from-indigo-500 to-indigo-600',
      action: () => navigate('/create'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Success Message */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 animate-scale-in shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Congratulations!
          </h1>
          <p className="text-2xl text-foreground mb-2">
            Your brand setup is complete.
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            You're all set to start creating amazing content with your personalized brand kit
          </p>
        </div>

        {/* Next Steps Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-3">
            What would you like to do next?
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Choose from these suggested actions to get started with your brand
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  key={index}
                  onClick={step.action}
                  className="group bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-all duration-300 text-left hover:scale-105 hover:border-primary/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="gap-2 shadow-lg"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
