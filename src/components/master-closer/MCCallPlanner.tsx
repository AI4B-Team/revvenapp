import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

const MCCallPlanner: React.FC = () => {
  const [expandedPhase, setExpandedPhase] = useState('discovery');

  const callStructure = [
    {
      id: 'intro',
      name: 'Introduction',
      duration: '2-3 min',
      objectives: ['Build rapport', 'Set agenda', 'Get permission'],
      scripts: [
        { title: 'Warm Opening', content: 'Hey [Name]! Thanks for taking the time. How is your day going so far?' },
        { title: 'Set Expectations', content: 'I promised this would only take [X] minutes and I respect your time, so here is how I would like to use it...' }
      ]
    },
    {
      id: 'discovery',
      name: 'Discovery & Discussion',
      duration: '10-15 min',
      objectives: ['Uncover pain points', 'Understand current situation', 'Build urgency'],
      scripts: [
        { title: 'Current State', content: 'Walk me through how you are currently handling [problem area]...' },
        { title: 'Pain Exploration', content: 'What is the biggest challenge you face with your current approach?' },
        { title: 'Impact Questions', content: 'How is this affecting your revenue, team, or growth?' }
      ]
    },
    {
      id: 'solution',
      name: 'Solution & Recommendation',
      duration: '5-7 min',
      objectives: ['Present solution', 'Connect to pain points', 'Show ROI'],
      scripts: [
        { title: 'Tailored Solution', content: 'Based on what you shared, here is specifically how we would solve [their pain]...' },
        { title: 'ROI Statement', content: 'This would mean [specific outcome] for you, which translates to [quantified benefit]' }
      ]
    },
    {
      id: 'close',
      name: 'Next Steps & Close',
      duration: '3-5 min',
      objectives: ['Address concerns', 'Gain commitment', 'Schedule next action'],
      scripts: [
        { title: 'Trial Close', content: 'Does this make sense for your situation?' },
        { title: 'Direct Ask', content: 'Are you ready to move forward with this?' },
        { title: 'Next Steps', content: 'Great! Here is exactly what happens next...' }
      ]
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-foreground">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          Call Planner
        </h1>
        <p className="text-muted-foreground">Your proven framework for every sales conversation</p>
      </div>

      <div className="space-y-4">
        {callStructure.map((phase) => (
          <div key={phase.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
            <button
              onClick={() => setExpandedPhase(expandedPhase === phase.id ? '' : phase.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <div className="text-left">
                  <h3 className="text-lg font-bold text-foreground">{phase.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {phase.duration}
                  </p>
                </div>
              </div>
              {expandedPhase === phase.id ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {expandedPhase === phase.id && (
              <div className="p-6 pt-0 space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3">Objectives</h4>
                  <div className="flex flex-wrap gap-2">
                    {phase.objectives.map((obj, idx) => (
                      <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3">Scripts & Questions</h4>
                  <div className="space-y-3">
                    {phase.scripts.map((script, idx) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-sm text-foreground">{script.title}</h5>
                          <Edit3 className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-emerald-500" />
                        </div>
                        <p className="text-sm text-foreground">{script.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCCallPlanner;