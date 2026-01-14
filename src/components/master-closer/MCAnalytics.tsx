import React from 'react';
import { TrendingUp, TrendingDown, Phone, Clock, Target, Award } from 'lucide-react';

const MCAnalytics: React.FC = () => {
  const metrics = [
    { label: 'Total Calls', value: '1,247', change: '+23%', trend: 'up', icon: Phone, color: 'purple' },
    { label: 'Calls with AI', value: '892', change: '+45%', trend: 'up', icon: Target, color: 'emerald' },
    { label: 'Avg Duration', value: '18:43', change: '-3:12', trend: 'down', icon: Clock, color: 'blue' },
    { label: 'Close Rate', value: '67%', change: '+12%', trend: 'up', icon: Award, color: 'orange' }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          const colors = getColorClasses(metric.color);
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-3xl font-bold mb-1 text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-500 mb-2">{metric.label}</div>
              <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                <TrendIcon className="w-4 h-4" />
                {metric.change}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MCAnalytics;
