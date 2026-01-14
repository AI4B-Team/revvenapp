import React, { useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  Settings,
  Clock,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  Calendar,
  Zap,
  Award
} from 'lucide-react';

const MCAutonomousMode: React.FC = () => {
  const [isAutonomousActive, setIsAutonomousActive] = useState(false);

  const autonomousCalls = [
    {
      id: '1',
      prospect: 'David Martinez',
      company: 'StartupXYZ',
      scheduled: '2:00 PM Today',
      status: 'scheduled',
      goal: 'Discovery + Demo',
      aiPersonality: 'Professional & Consultative'
    },
    {
      id: '2',
      prospect: 'Lisa Anderson',
      company: 'Enterprise Co',
      scheduled: '3:30 PM Today',
      status: 'scheduled',
      goal: 'Objection Handling',
      aiPersonality: 'Empathetic & Solution-Focused'
    },
    {
      id: '3',
      prospect: 'Robert Kim',
      company: 'Growth Inc',
      scheduled: '4:45 PM Today',
      status: 'completed',
      goal: 'Close Deal',
      outcome: 'Closed - $45K ARR',
      aiPersonality: 'Confident & Direct'
    }
  ];

  const autonomousStats = [
    { label: 'Autonomous Calls', value: '156', icon: Bot, color: 'purple' },
    { label: 'Success Rate', value: '84%', icon: Target, color: 'emerald' },
    { label: 'Avg Call Duration', value: '16:32', icon: Clock, color: 'blue' },
    { label: 'Revenue Generated', value: '$423K', icon: TrendingUp, color: 'orange' }
  ];

  const aiPersonalities = [
    {
      id: 'professional',
      name: 'Professional & Consultative',
      description: 'Best for enterprise prospects. Formal, data-driven, builds credibility.',
      voiceTone: 'Confident, measured, authoritative',
      bestFor: 'C-Level, VPs, Large enterprises'
    },
    {
      id: 'friendly',
      name: 'Friendly & Conversational',
      description: 'Perfect for SMB and mid-market. Warm, personable, relationship-focused.',
      voiceTone: 'Warm, enthusiastic, approachable',
      bestFor: 'SMB owners, Directors, Managers'
    },
    {
      id: 'direct',
      name: 'Direct & Results-Driven',
      description: 'Ideal for time-sensitive deals. Gets to the point, focuses on ROI.',
      voiceTone: 'Concise, confident, action-oriented',
      bestFor: 'Hot leads, renewal calls, upsells'
    }
  ];

  const getStatColorClasses = (color: string) => {
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-900">
          <Bot className="w-8 h-8 text-purple-600" />
          Autonomous Mode
        </h1>
        <p className="text-gray-500">
          Let AI handle calls end-to-end while you focus on closing high-value deals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {autonomousStats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getStatColorClasses(stat.color);
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-3xl font-bold mb-1 text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Control Panel */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-900">
              <Zap className="w-6 h-6 text-purple-600" />
              Autonomous Call System
            </h3>
            <p className="text-gray-600 text-sm">
              {isAutonomousActive
                ? 'AI is actively making calls and booking meetings for you'
                : 'Enable autonomous mode to let AI handle your calls'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-gray-700">
              <Settings className="w-4 h-4" />
              Configure
            </button>
            <button
              onClick={() => setIsAutonomousActive(!isAutonomousActive)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all text-white ${
                isAutonomousActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
              }`}
            >
              {isAutonomousActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause System
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Activate System
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled & Completed Calls */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Calendar className="w-5 h-5 text-purple-600" />
          Scheduled Autonomous Calls
        </h3>

        <div className="space-y-4">
          {autonomousCalls.map((call) => (
            <div
              key={call.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    {call.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{call.prospect}</h4>
                    <p className="text-sm text-gray-500">{call.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{call.scheduled}</div>
                    <div className="text-xs text-gray-500">Scheduled Time</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{call.goal}</div>
                    <div className="text-xs text-gray-500">Call Objective</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{call.aiPersonality}</div>
                    <div className="text-xs text-gray-500">AI Personality</div>
                  </div>

                  {call.status === 'completed' ? (
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
                      <div className="font-semibold text-sm">{call.outcome}</div>
                    </div>
                  ) : (
                    <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors text-white">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Personalities */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Users className="w-5 h-5 text-purple-600" />
          AI Personalities
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Choose the AI personality that matches your prospect's profile and your sales approach
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiPersonalities.map((personality) => (
            <div
              key={personality.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
            >
              <h4 className="font-bold text-lg mb-2 text-gray-900">{personality.name}</h4>
              <p className="text-sm text-gray-500 mb-4">{personality.description}</p>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Voice Tone</div>
                  <div className="text-sm text-gray-700">{personality.voiceTone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Best For</div>
                  <div className="text-sm text-purple-600">{personality.bestFor}</div>
                </div>
              </div>

              <button className="w-full py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors text-white">
                Select This Personality
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Award className="w-6 h-6 text-purple-600" />
          How Autonomous Mode Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-700">1</span>
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">Upload Leads</h4>
            <p className="text-sm text-gray-600">
              Import your prospect list with contact info and context
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-700">2</span>
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">AI Makes Calls</h4>
            <p className="text-sm text-gray-600">
              AI calls prospects, handles objections, and qualifies leads
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-700">3</span>
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">Gathers Info</h4>
            <p className="text-sm text-gray-600">
              Collects key information, pain points, and buying signals
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">Books Meetings</h4>
            <p className="text-sm text-gray-600">
              Schedules demos or closes deals directly based on readiness
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCAutonomousMode;
