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
  Headphones,
  ChevronLeft,
  ChevronRight,
  Sliders
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
import MCAgentSettings from '@/components/master-closer/MCAgentSettings';
import MCConversationTemplates, { ConversationTemplate } from '@/components/master-closer/MCConversationTemplates';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type View = 'dashboard' | 'live-call' | 'objections' | 'planner' | 'analytics' | 'team' | 'settings' | 'agent-settings';
export type CallMode = 'start-call' | 'voice-agent' | 'listen';

const MasterCloser = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInnerSidebarCollapsed, setIsInnerSidebarCollapsed] = useState(false);
  const [callMode, setCallMode] = useState<CallMode>('start-call');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [pendingCallMode, setPendingCallMode] = useState<CallMode>('start-call');

  const navigation = [
    { id: 'dashboard', name: 'Command', icon: BarChart3, view: 'dashboard' },
    { id: 'live-call', name: 'Calls', icon: Mic, view: 'live-call', highlight: true },
    { id: 'agent-settings', name: 'Agent', icon: Bot, view: 'agent-settings' },
    { id: 'objections', name: 'Objections', icon: MessageSquare, view: 'objections' },
    { id: 'planner', name: 'Prep', icon: BookOpen, view: 'planner' },
    { id: 'analytics', name: 'Performance', icon: BarChart3, view: 'analytics' },
    { id: 'team', name: 'Team', icon: Users, view: 'team' },
    { id: 'settings', name: 'Settings', icon: Settings, view: 'settings' }
  ];

  const handleStartCall = (mode: CallMode) => {
    setPendingCallMode(mode);
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (template: ConversationTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setCallMode(pendingCallMode);
    setIsCallActive(true);
    setCurrentView('live-call');
  };

  const handleSkipTemplate = () => {
    setShowTemplateSelector(false);
    setCallMode(pendingCallMode);
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
          />
        );
      case 'agent-settings':
        return <MCAgentSettings />;
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

  const getModeLabel = () => {
    switch (callMode) {
      case 'voice-agent': return 'LIVE Agent';
      case 'listen': return 'Listening...';
      default: return 'LIVE Call';
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
          {/* Master Closer Inner Navigation - Collapsible */}
          <aside className={`${isInnerSidebarCollapsed ? 'w-16' : 'w-56'} border-r border-border min-h-full bg-card transition-all duration-300 flex flex-col`}>
            {/* App Header */}
            <div className="p-4 border-b border-border">
              <div className={`flex items-center ${isInnerSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                {!isInnerSidebarCollapsed && (
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Master Closer</h1>
                    <p className="text-xs text-muted-foreground">AI Sales Co-Pilot</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3-Button Action Area */}
            <div className={`${isInnerSidebarCollapsed ? 'p-2' : 'p-4'} border-b border-border space-y-2`}>
              {isCallActive ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setIsCallActive(false);
                        setCurrentView('dashboard');
                      }}
                      className={`w-full flex items-center justify-center gap-2 ${isInnerSidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-lg font-medium transition-all bg-red-500 hover:bg-red-600 text-white animate-pulse cursor-pointer`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      {!isInnerSidebarCollapsed && <span>{getModeLabel()}</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isInnerSidebarCollapsed ? getModeLabel() : 'Click to end call'}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  {/* Start Call Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleStartCall('start-call')}
                        className={`w-full flex items-center justify-center gap-2 ${isInnerSidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-lg font-medium transition-all bg-emerald-500 hover:bg-emerald-600 text-white`}
                      >
                        <Play className="w-4 h-4" />
                        {!isInnerSidebarCollapsed && <span>Start Call</span>}
                      </button>
                    </TooltipTrigger>
                    {isInnerSidebarCollapsed && (
                      <TooltipContent side="right">Start Call - Manual with AI assistance</TooltipContent>
                    )}
                  </Tooltip>

                  {/* Voice Agent Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleStartCall('voice-agent')}
                        className={`w-full flex items-center justify-center gap-2 ${isInnerSidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-lg font-medium transition-all bg-purple-500 hover:bg-purple-600 text-white`}
                      >
                        <Bot className="w-4 h-4" />
                        {!isInnerSidebarCollapsed && <span>Voice Agent</span>}
                      </button>
                    </TooltipTrigger>
                    {isInnerSidebarCollapsed && (
                      <TooltipContent side="right">Voice Agent - AI handles the call</TooltipContent>
                    )}
                  </Tooltip>

                  {/* Listen Mode Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleStartCall('listen')}
                        className={`w-full flex items-center justify-center gap-2 ${isInnerSidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-lg font-medium transition-all bg-blue-500 hover:bg-blue-600 text-white`}
                      >
                        <Headphones className="w-4 h-4" />
                        {!isInnerSidebarCollapsed && <span>Listen Mode</span>}
                      </button>
                    </TooltipTrigger>
                    {isInnerSidebarCollapsed && (
                      <TooltipContent side="right">Listen Mode - Capture external calls</TooltipContent>
                    )}
                  </Tooltip>
                </>
              )}
            </div>

            {/* Navigation */}
            <nav className={`${isInnerSidebarCollapsed ? 'p-2' : 'p-3'} space-y-1 flex-1`}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCurrentView(item.view as View)}
                        className={`w-full flex items-center ${isInnerSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all text-sm ${
                          isActive
                            ? item.id === 'agent-settings' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        } ${item.highlight && !isActive ? 'border border-emerald-200' : ''}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!isInnerSidebarCollapsed && (
                          <>
                            <span className="font-medium">{item.name}</span>
                            {item.highlight && !isActive && (
                              <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded-full">
                                Live
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    {isInnerSidebarCollapsed && (
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>

            {/* Upgrade Card - Hidden when collapsed */}
            {!isInnerSidebarCollapsed && (
              <div className="m-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-sm text-foreground">Upgrade to Pro</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Unlock Voice Agent, unlimited calls, and advanced AI features.
                </p>
                <button className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-all text-white">
                  Upgrade Now
                </button>
              </div>
            )}

            {/* Collapse Toggle Button */}
            <div className="p-2 border-t border-border">
              <button
                onClick={() => setIsInnerSidebarCollapsed(!isInnerSidebarCollapsed)}
                className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {isInnerSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            {renderView()}
          </main>
        </div>
      </div>

      {/* Template Selector Modal */}
      <MCConversationTemplates
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
};

export default MasterCloser;
