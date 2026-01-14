import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Phone, Clock, Target, Award, Headphones, Bot, Play, Filter } from 'lucide-react';

type ModeFilter = 'all' | 'start-call' | 'voice-agent' | 'listen';

const MCAnalytics: React.FC = () => {
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');

  const allMetrics = {
    'all': [
      { label: 'Total Sessions', value: '1,247', change: '+23%', trend: 'up', icon: Phone, color: 'emerald' },
      { label: 'AI-Assisted', value: '892', change: '+45%', trend: 'up', icon: Target, color: 'emerald' },
      { label: 'Avg Duration', value: '18:43', change: '-3:12', trend: 'down', icon: Clock, color: 'blue' },
      { label: 'Close Rate', value: '67%', change: '+12%', trend: 'up', icon: Award, color: 'orange' }
    ],
    'start-call': [
      { label: 'Manual Calls', value: '523', change: '+15%', trend: 'up', icon: Play, color: 'emerald' },
      { label: 'Suggestions Used', value: '78%', change: '+8%', trend: 'up', icon: Target, color: 'emerald' },
      { label: 'Avg Duration', value: '22:15', change: '+1:30', trend: 'up', icon: Clock, color: 'blue' },
      { label: 'Close Rate', value: '72%', change: '+5%', trend: 'up', icon: Award, color: 'orange' }
    ],
    'voice-agent': [
      { label: 'Agent Calls', value: '456', change: '+67%', trend: 'up', icon: Bot, color: 'purple' },
      { label: 'Handoff Rate', value: '12%', change: '-3%', trend: 'down', icon: Target, color: 'purple' },
      { label: 'Avg Duration', value: '14:32', change: '-2:45', trend: 'down', icon: Clock, color: 'blue' },
      { label: 'Close Rate', value: '58%', change: '+18%', trend: 'up', icon: Award, color: 'orange' }
    ],
    'listen': [
      { label: 'Listen Sessions', value: '268', change: '+34%', trend: 'up', icon: Headphones, color: 'blue' },
      { label: 'Insights Generated', value: '1,892', change: '+52%', trend: 'up', icon: Target, color: 'blue' },
      { label: 'Avg Duration', value: '28:10', change: '+5:20', trend: 'up', icon: Clock, color: 'blue' },
      { label: 'Coach Tips Used', value: '45%', change: '+12%', trend: 'up', icon: Award, color: 'orange' }
    ]
  };

  const metrics = allMetrics[modeFilter];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };
    return colors[color] || colors.emerald;
  };

  const modeOptions: { id: ModeFilter; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'all', label: 'All Modes', icon: Filter, color: 'bg-gray-500' },
    { id: 'start-call', label: 'Start Call', icon: Play, color: 'bg-emerald-500' },
    { id: 'voice-agent', label: 'Voice Agent', icon: Bot, color: 'bg-purple-500' },
    { id: 'listen', label: 'Listen Mode', icon: Headphones, color: 'bg-blue-500' }
  ];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        
        {/* Mode Filter */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setModeFilter(option.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  modeFilter === option.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          const colors = getColorClasses(metric.color);
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-3xl font-bold mb-1 text-foreground">{metric.value}</div>
              <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
              <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                <TrendIcon className="w-4 h-4" />
                {metric.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mode-specific insights */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4 text-foreground">
          {modeFilter === 'all' ? 'Overall Insights' : 
           modeFilter === 'start-call' ? 'Manual Call Insights' :
           modeFilter === 'voice-agent' ? 'Voice Agent Performance' :
           'Listen Mode Analysis'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modeFilter === 'voice-agent' && (
            <>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-sm text-purple-700 mb-1">Top Performing Script</h3>
                <p className="text-xs text-purple-600">"Discovery + Demo" has 73% success rate</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-sm text-purple-700 mb-1">Common Handoff Trigger</h3>
                <p className="text-xs text-purple-600">Pricing objections (45% of handoffs)</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-sm text-purple-700 mb-1">Best Time to Call</h3>
                <p className="text-xs text-purple-600">Tuesday 10-11am (82% answer rate)</p>
              </div>
            </>
          )}
          {modeFilter === 'listen' && (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-sm text-blue-700 mb-1">Most Common Insight</h3>
                <p className="text-xs text-blue-600">"Missed upsell opportunity" (34% of sessions)</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-sm text-blue-700 mb-1">Coach Mode Usage</h3>
                <p className="text-xs text-blue-600">Silent prompts used 156 times this week</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-sm text-blue-700 mb-1">Team Improvement</h3>
                <p className="text-xs text-blue-600">Objection handling up 23% after coaching</p>
              </div>
            </>
          )}
          {modeFilter === 'start-call' && (
            <>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="font-semibold text-sm text-emerald-700 mb-1">Most Used Suggestion</h3>
                <p className="text-xs text-emerald-600">"Handle pricing objection" (used 234 times)</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="font-semibold text-sm text-emerald-700 mb-1">Suggestion Success Rate</h3>
                <p className="text-xs text-emerald-600">89% led to positive prospect response</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="font-semibold text-sm text-emerald-700 mb-1">Avg Handoff to Agent</h3>
                <p className="text-xs text-emerald-600">8% of calls handed to Voice Agent</p>
              </div>
            </>
          )}
          {modeFilter === 'all' && (
            <>
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <h3 className="font-semibold text-sm text-foreground mb-1">Peak Activity</h3>
                <p className="text-xs text-muted-foreground">Tuesday-Thursday, 9am-12pm</p>
              </div>
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <h3 className="font-semibold text-sm text-foreground mb-1">Top Performer</h3>
                <p className="text-xs text-muted-foreground">Voice Agent mode: +67% growth</p>
              </div>
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <h3 className="font-semibold text-sm text-foreground mb-1">Revenue Impact</h3>
                <p className="text-xs text-muted-foreground">$1.2M influenced this month</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCAnalytics;
