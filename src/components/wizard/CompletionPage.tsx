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
      title: 'Create An eBook',
      description: 'Generate a professional ebook using your brand voice and style',
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/create'),
    },
    {
      icon: Sparkles,
      title: 'Generate Content',
      description: 'Create engaging content that matches your brand',
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/create'),
    },
    {
      icon: Rocket,
      title: 'Launch A Campaign',
      description: 'Start a marketing campaign with AI-powered content creation',
      color: 'from-pink-500 to-pink-600',
      action: () => navigate('/create'),
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

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Success Message */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 animate-scale-in shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            CONGRATULATIONS!
          </h1>
          <p className="text-2xl text-foreground mb-2">
            Your Brand Profile Is Complete
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            You're All Set To Start Creating Amazing Content With Your Personalized Brand Profile
          </p>
        </div>

        {/* Next Steps Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-3">
            What Would You Like To Do Next?
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Choose From These Suggested Actions To Get Started With Your Brand
          </p>

          <div className="grid grid-cols-4 gap-6">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="group bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/50 flex flex-col"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {step.description}
                  </p>
                  <Button
                    onClick={step.action}
                    className="w-full gap-2"
                    size="sm"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
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
