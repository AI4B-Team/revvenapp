import React, { useState } from 'react';
import { Gamepad2, Play, Mic, Volume2, Target, Trophy, Clock, BarChart3, Star, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  duration: string;
  completions: number;
  avgScore: number;
}

const MCPractice = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const scenarios: Scenario[] = [
    {
      id: '1',
      title: 'Cold Call Opener',
      description: 'Practice grabbing attention in the first 10 seconds of a cold call',
      difficulty: 'easy',
      category: 'Prospecting',
      duration: '5 min',
      completions: 24,
      avgScore: 85,
    },
    {
      id: '2',
      title: 'Discovery Questions',
      description: 'Master the art of asking powerful discovery questions',
      difficulty: 'medium',
      category: 'Discovery',
      duration: '10 min',
      completions: 18,
      avgScore: 78,
    },
    {
      id: '3',
      title: 'Price Objection',
      description: 'Handle "It\'s too expensive" like a pro',
      difficulty: 'medium',
      category: 'Objection Handling',
      duration: '8 min',
      completions: 32,
      avgScore: 72,
    },
    {
      id: '4',
      title: 'Competitor Comparison',
      description: 'Navigate competitive situations without bashing competitors',
      difficulty: 'hard',
      category: 'Objection Handling',
      duration: '12 min',
      completions: 15,
      avgScore: 68,
    },
    {
      id: '5',
      title: 'Closing Techniques',
      description: 'Practice various closing techniques and trial closes',
      difficulty: 'hard',
      category: 'Closing',
      duration: '15 min',
      completions: 21,
      avgScore: 75,
    },
    {
      id: '6',
      title: 'Handling "Not Interested"',
      description: 'Turn rejection into engagement',
      difficulty: 'easy',
      category: 'Objection Handling',
      duration: '5 min',
      completions: 28,
      avgScore: 82,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const stats = [
    { label: 'Total Sessions', value: '87', icon: Gamepad2, color: 'text-purple-500' },
    { label: 'Avg Score', value: '78%', icon: Target, color: 'text-emerald-500' },
    { label: 'Time Practiced', value: '12h', icon: Clock, color: 'text-blue-500' },
    { label: 'Streak', value: '5 days', icon: Trophy, color: 'text-yellow-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Practice Mode</h1>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              <Gamepad2 className="w-3 h-3 mr-1" />
              AI Roleplay
            </Badge>
          </div>
          <p className="text-muted-foreground">Practice sales scenarios with AI-powered roleplay</p>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          Random Scenario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Practice Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className={`bg-card border rounded-xl p-6 cursor-pointer transition-all hover:border-purple-300 hover:shadow-md ${
                selectedScenario?.id === scenario.id ? 'border-purple-500 ring-1 ring-purple-500' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <Badge className={getDifficultyColor(scenario.difficulty)}>
                  {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">{scenario.duration}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{scenario.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{scenario.completions} completions</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{scenario.avgScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Session Panel */}
      {selectedScenario && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedScenario.title}</h2>
              <p className="text-muted-foreground">{selectedScenario.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(selectedScenario.difficulty)}>
                {selectedScenario.difficulty}
              </Badge>
              <Badge variant="outline">{selectedScenario.category}</Badge>
            </div>
          </div>

          {!isSessionActive ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Practice?</h3>
              <p className="text-muted-foreground mb-6">
                You'll have a conversation with an AI prospect. Speak naturally and practice your techniques.
              </p>
              <Button 
                size="lg" 
                className="bg-purple-500 hover:bg-purple-600"
                onClick={() => setIsSessionActive(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Practice Session
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Session UI */}
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  <span className="font-medium text-purple-700 dark:text-purple-400">Session Active</span>
                </div>
                <span className="font-mono text-purple-700 dark:text-purple-400">02:34</span>
              </div>

              {/* Conversation */}
              <div className="space-y-4 min-h-[200px]">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      "Hi, I'm really busy right now. Can you make this quick?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
                <Button variant="outline" size="lg">
                  <Volume2 className="w-5 h-5" />
                </Button>
                <Button size="lg" className="bg-purple-500 hover:bg-purple-600 w-32 h-16 rounded-full">
                  <Mic className="w-6 h-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsSessionActive(false)}
                >
                  End
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Performance */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4">Recent Performance</h2>
        <div className="space-y-4">
          {[
            { scenario: 'Cold Call Opener', score: 92, date: 'Today' },
            { scenario: 'Price Objection', score: 78, date: 'Yesterday' },
            { scenario: 'Discovery Questions', score: 85, date: '2 days ago' },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{session.scenario}</p>
                <p className="text-sm text-muted-foreground">{session.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={session.score} className="w-24 h-2" />
                <span className="font-bold text-foreground w-12 text-right">{session.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCPractice;
