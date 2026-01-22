import React, { useState } from 'react';
import { Zap, TrendingUp, AlertTriangle, CheckCircle2, Clock, Target, Lightbulb, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FeedbackItem {
  id: string;
  type: 'positive' | 'improvement' | 'warning';
  message: string;
  timestamp: string;
  category: string;
}

const MCInstantFeedback = () => {
  const [selectedCall, setSelectedCall] = useState('current');

  const currentFeedback: FeedbackItem[] = [
    { id: '1', type: 'positive', message: 'Great job building rapport with personal story', timestamp: '2 seconds ago', category: 'Rapport' },
    { id: '2', type: 'improvement', message: 'Consider asking more open-ended questions', timestamp: '15 seconds ago', category: 'Discovery' },
    { id: '3', type: 'positive', message: 'Excellent handling of pricing objection', timestamp: '45 seconds ago', category: 'Objection Handling' },
    { id: '4', type: 'warning', message: 'Talking speed is above optimal range', timestamp: '1 minute ago', category: 'Delivery' },
    { id: '5', type: 'positive', message: 'Strong value proposition presentation', timestamp: '2 minutes ago', category: 'Pitch' },
  ];

  const metrics = [
    { label: 'Talk/Listen Ratio', value: 45, optimal: '40-60%', status: 'good' },
    { label: 'Avg Response Time', value: 0.8, optimal: '<1 sec', status: 'excellent', unit: 's' },
    { label: 'Sentiment Score', value: 78, optimal: '>70', status: 'good' },
    { label: 'Engagement Level', value: 85, optimal: '>80', status: 'excellent' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'improvement': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Zap className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'improvement': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'warning': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default: return 'bg-muted border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-emerald-500';
      case 'good': return 'text-blue-500';
      case 'needs-work': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Instant Feedback</h1>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              &lt;1 second
            </Badge>
          </div>
          <p className="text-muted-foreground">Real-time AI coaching during your calls</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSelectedCall('current')}>
            Current Call
          </Button>
          <Button variant="outline" onClick={() => setSelectedCall('history')}>
            View History
          </Button>
        </div>
      </div>

      {/* Live Status Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Live Analysis Active</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              12:34 call duration
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              24 insights generated
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Metrics */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Live Metrics</h2>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                  <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit || '%'}
                  </span>
                </div>
                <Progress value={typeof metric.value === 'number' && metric.value <= 100 ? metric.value : 80} className="h-2" />
                <p className="text-xs text-muted-foreground">Optimal: {metric.optimal}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feedback Stream */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Live Feedback</h2>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {currentFeedback.map((feedback) => (
              <div 
                key={feedback.id}
                className={`p-4 rounded-lg border ${getTypeBg(feedback.type)} transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-3">
                  {getTypeIcon(feedback.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{feedback.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{feedback.category}</Badge>
                      <span className="text-xs text-muted-foreground">{feedback.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4">Call Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Positive Signals', value: '18', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { label: 'Improvement Areas', value: '4', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
            { label: 'Warnings', value: '2', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
            { label: 'Overall Score', value: '87%', icon: Target, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg ${item.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCInstantFeedback;
