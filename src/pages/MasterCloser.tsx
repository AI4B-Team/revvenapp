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
  Headphones
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import MCDashboard from '@/components/master-closer/MCDashboard';
import MCLiveCall from '@/components/master-closer/MCLiveCall';
import MCObjectionLibrary from '@/components/master-closer/MCObjectionLibrary';
import MCCallPlanner from '@/components/master-closer/MCCallPlanner';
import MCAnalytics from '@/components/master-closer/MCAnalytics';
import MCTeamManagement from '@/components/master-closer/MCTeamManagement';
import MCSettings from '@/components/master-closer/MCSettings';
import MCAutonomousMode from '@/components/master-closer/MCAutonomousMode';

type View = 'dashboard' | 'live-call' | 'objections' | 'planner' | 'analytics' | 'team' | 'settings' | 'autonomous';
export type CallMode = 'start-call' | 'listen';
export type CallType = 'ai-voice-agent' | 'transcription-only';

const MasterCloser = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [callMode, setCallMode] = useState<CallMode>('start-call');
  const [callType, setCallType] = useState<CallType>('transcription-only');

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

  const handleStartCall = (mode: CallMode = 'start-call', type: CallType = 'transcription-only') => {
    setCallMode(mode);
    setCallType(type);
    setIsCallActive(true);
    setCurrentView('live-call');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MCDashboard onStartCall={handleStartCall} />;
      case 'live-call':
        return (
          <MCLiveCall 
            isActive={isCallActive} 
            onEndCall={() => setIsCallActive(false)} 
            callMode={callMode}
            callType={callType}
          />
        );
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Master Closer Inner Navigation */}
          <aside className="w-56 border-r border-border min-h-full bg-card">
            {/* App Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Master Closer</h1>
                  <p className="text-xs text-muted-foreground">AI Sales Co-Pilot</p>
                </div>
              </div>
            </div>

            {/* Quick Start Call / Listen Buttons */}
            <div className="p-4 border-b border-border space-y-2">
              {isCallActive ? (
                <button
                  onClick={() => setCurrentView('live-call')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all bg-red-500 hover:bg-red-600 text-white animate-pulse"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>{callMode === 'listen' ? 'Listening...' : 'Call Active'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleStartCall('start-call', callType)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Call</span>
                  </button>
                  <button
                    onClick={() => handleStartCall('listen', callType)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Listen Mode</span>
                  </button>
                </>
              )}
            </div>

            <nav className="p-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.view as View)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    } ${item.highlight && !isActive ? 'border border-emerald-200' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                    {item.highlight && !isActive && (
                      <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded-full">
                        Live
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Upgrade Card */}
            <div className="m-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-sm text-foreground">Upgrade to Pro</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Unlock autonomous mode, unlimited calls, and advanced AI features.
              </p>
              <button className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-all text-white">
                Upgrade Now
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MasterCloser;