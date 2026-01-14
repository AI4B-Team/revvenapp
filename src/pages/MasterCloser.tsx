import React, { useState } from 'react';
import { 
  Mic, 
  BarChart3, 
  BookOpen, 
  Users, 
  Settings, 
  Zap,
  Play,
  MessageSquare,
  Bot,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MCDashboard from '@/components/master-closer/MCDashboard';
import MCLiveCall from '@/components/master-closer/MCLiveCall';
import MCObjectionLibrary from '@/components/master-closer/MCObjectionLibrary';
import MCCallPlanner from '@/components/master-closer/MCCallPlanner';
import MCAnalytics from '@/components/master-closer/MCAnalytics';
import MCTeamManagement from '@/components/master-closer/MCTeamManagement';
import MCSettings from '@/components/master-closer/MCSettings';
import MCAutonomousMode from '@/components/master-closer/MCAutonomousMode';

type View = 'dashboard' | 'live-call' | 'objections' | 'planner' | 'analytics' | 'team' | 'settings' | 'autonomous';

const MasterCloser = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isCallActive, setIsCallActive] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, view: 'dashboard' },
    { id: 'live-call', name: 'Live Call', icon: Mic, view: 'live-call', highlight: true },
    { id: 'autonomous', name: 'Autonomous', icon: Bot, view: 'autonomous' },
    { id: 'objections', name: 'Objections', icon: MessageSquare, view: 'objections' },
    { id: 'planner', name: 'Call Planner', icon: BookOpen, view: 'planner' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, view: 'analytics' },
    { id: 'team', name: 'Team', icon: Users, view: 'team' },
    { id: 'settings', name: 'Settings', icon: Settings, view: 'settings' }
  ];

  const handleStartCall = () => {
    setIsCallActive(true);
    setCurrentView('live-call');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MCDashboard onStartCall={handleStartCall} />;
      case 'live-call':
        return <MCLiveCall isActive={isCallActive} onEndCall={() => setIsCallActive(false)} />;
      case 'autonomous':
        return <MCAutonomousMode />;
      case 'objections':
        return <MCObjectionLibrary />;
      case 'planner':
        return <MCCallPlanner />;
      case 'analytics':
        return <MCAnalytics />;
      case 'team':
        return <MCTeamManagement />;
      case 'settings':
        return <MCSettings />;
      default:
        return <MCDashboard onStartCall={handleStartCall} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/apps')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    MASTER CLOSER
                  </h1>
                  <p className="text-xs text-gray-500">Your AI Sales Co-Pilot</p>
                </div>
              </div>
            </div>

            {/* Quick Start Call */}
            <button
              onClick={handleStartCall}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isCallActive
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
              }`}
            >
              {isCallActive ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>Call Active</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Call</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 min-h-[calc(100vh-73px)] bg-gray-50 sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.view as View)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${item.highlight && !isActive ? 'border border-purple-200' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.highlight && !isActive && (
                    <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                      Live
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Upgrade Card */}
          <div className="m-4 p-4 bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm text-gray-900">Upgrade to Pro</h3>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Unlock autonomous mode, unlimited calls, and advanced AI features.
            </p>
            <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg text-sm font-medium transition-all text-white">
              Upgrade Now
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default MasterCloser;
