import React from 'react';
import {
  Phone,
  TrendingUp,
  Target,
  Clock,
  Zap,
  Award,
  BarChart3,
  Users,
  Play
} from 'lucide-react';

interface MCDashboardProps {
  onStartCall: () => void;
}

const MCDashboard: React.FC<MCDashboardProps> = ({ onStartCall }) => {
  const stats = [
    {
      label: 'Total Calls',
      value: '247',
      change: '+23% vs last week',
      icon: Phone,
      color: 'emerald'
    },
    {
      label: 'Close Rate',
      value: '67%',
      change: '+12% with AI assist',
      icon: Target,
      color: 'emerald'
    },
    {
      label: 'Avg Call Duration',
      value: '18:43',
      change: '-3 min with AI',
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'Revenue Impact',
      value: '$284K',
      change: '+$67K this month',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const recentCalls = [
    {
      id: '1',
      prospect: 'Sarah Johnson',
      company: 'Acme Corp',
      duration: '23:45',
      outcome: 'closed',
      sentiment: 85,
      date: '2 hours ago'
    },
    {
      id: '2',
      prospect: 'Michael Chen',
      company: 'TechStart Inc',
      duration: '15:30',
      outcome: 'follow-up',
      sentiment: 72,
      date: '4 hours ago'
    },
    {
      id: '3',
      prospect: 'Emily Rodriguez',
      company: 'Growth Labs',
      duration: '19:15',
      outcome: 'closed',
      sentiment: 91,
      date: 'Yesterday'
    }
  ];

  const topPerformers = [
    { name: 'John Smith', calls: 45, closeRate: 72, revenue: '$124K' },
    { name: 'Sarah Williams', calls: 38, closeRate: 68, revenue: '$98K' },
    { name: 'Mike Johnson', calls: 41, closeRate: 65, revenue: '$87K' }
  ];

  const getStatColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-600' }
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome Back, Alex! 👋</h1>
        <p className="text-muted-foreground">Your AI co-pilot is ready to help you close more deals</p>
      </div>

      {/* Quick Start Card */}
      <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1 text-foreground">Ready To Crush Your Quota?</h3>
              <p className="text-muted-foreground">Start a call and let AI guide you to the close</p>
            </div>
          </div>
          <button
            onClick={onStartCall}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold text-lg text-white transition-all transform hover:scale-105"
          >
            <Play className="w-6 h-6" />
            Start New Call
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getStatColorClasses(stat.color);
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Calls & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Calls */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <Phone className="w-5 h-5 text-emerald-600" />
            Recent Calls
          </h3>
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{call.prospect[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{call.prospect}</div>
                    <div className="text-sm text-muted-foreground">{call.company} • {call.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{call.duration}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{call.sentiment}%</div>
                    <div className="text-xs text-muted-foreground">Sentiment</div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      call.outcome === 'closed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {call.outcome === 'closed' ? '✓ Closed' : '→ Follow-up'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0
                    ? 'bg-yellow-100 text-yellow-600'
                    : index === 1
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  <span className="font-bold text-sm">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{performer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {performer.calls} calls • {performer.closeRate}% close rate
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-600">{performer.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-lg text-foreground">AI Performance Boost</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Objection Handling</span>
              <span className="text-emerald-600 font-semibold">+89%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rapport Building</span>
              <span className="text-emerald-600 font-semibold">+67%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Close Success Rate</span>
              <span className="text-emerald-600 font-semibold">+45%</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-lg text-foreground">Team Impact</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Rep Ramp Time</span>
              <span className="text-emerald-600 font-semibold">-67%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Deal Size</span>
              <span className="text-emerald-600 font-semibold">+$12K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Team Quota Attainment</span>
              <span className="text-emerald-600 font-semibold">142%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCDashboard;