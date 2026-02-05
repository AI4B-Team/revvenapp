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
  Phone,
  PhoneCall,
  TrendingUp,
  Database,
  Palette,
  Mail,
  Calendar,
  Volume2,
  FileText,
  Building2,
  Scroll,
  Sparkles,
  Gamepad2,
  EyeOff,
  Search
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
import MCKnowledgeBase from '@/components/master-closer/MCKnowledgeBase';
import MCPowerDialer from '@/components/master-closer/MCPowerDialer';
import MCCRMPipeline from '@/components/master-closer/MCCRMPipeline';
import MCSMSAutomation from '@/components/master-closer/MCSMSAutomation';
import MCNumberManagement from '@/components/master-closer/MCNumberManagement';
import MCWhiteLabel from '@/components/master-closer/MCWhiteLabel';
import MCSmartFollowups from '@/components/master-closer/MCSmartFollowups';
import MCCalendarSync from '@/components/master-closer/MCCalendarSync';
import MCCallPlayback from '@/components/master-closer/MCCallPlayback';
import MCInstantFeedback from '@/components/master-closer/MCInstantFeedback';
import MCLiveTranscribe from '@/components/master-closer/MCLiveTranscribe';
import MCCompanyInfo from '@/components/master-closer/MCCompanyInfo';
import MCSalesScript from '@/components/master-closer/MCSalesScript';
import MCAINotes from '@/components/master-closer/MCAINotes';
import MCPractice from '@/components/master-closer/MCPractice';
import MCDiscreetRecording from '@/components/master-closer/MCDiscreetRecording';
import MCDeepResearch from '@/components/master-closer/MCDeepResearch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type View = 'dashboard' | 'live-call' | 'objections' | 'planner' | 'analytics' | 'team' | 'settings' | 'agent-settings' | 'knowledge-base' | 'power-dialer' | 'crm-pipeline' | 'sms-automation' | 'number-management' | 'white-label' | 'smart-followups' | 'calendar-sync' | 'call-playback' | 'instant-feedback' | 'live-transcribe' | 'company-info' | 'sales-script' | 'ai-notes' | 'practice' | 'discreet-recording' | 'deep-research';
export type CallMode = 'start-call' | 'voice-agent' | 'listen';

const MasterCloser = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isInnerSidebarCollapsed, setIsInnerSidebarCollapsed] = useState(false);
  const [callMode, setCallMode] = useState<CallMode>('start-call');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [pendingCallMode, setPendingCallMode] = useState<CallMode>('start-call');

  const navigation = [
    // Core Features
    { id: 'dashboard', name: 'Command', icon: BarChart3, view: 'dashboard', section: 'core' },
    { id: 'live-call', name: 'Calls', icon: Mic, view: 'live-call', highlight: true, section: 'core' },
    { id: 'agent-settings', name: 'Agent', icon: Bot, view: 'agent-settings', section: 'core' },
    
    // Call Tools
    { id: 'live-transcribe', name: 'Transcribe', icon: FileText, view: 'live-transcribe', section: 'call-tools', badge: 'NEW' },
    { id: 'instant-feedback', name: 'Feedback', icon: Zap, view: 'instant-feedback', section: 'call-tools', badge: 'NEW' },
    { id: 'call-playback', name: 'Playback', icon: Volume2, view: 'call-playback', section: 'call-tools', badge: 'NEW' },
    { id: 'discreet-recording', name: 'Recording', icon: EyeOff, view: 'discreet-recording', section: 'call-tools', badge: 'NEW' },
    
    // Dialer & Communication
    { id: 'power-dialer', name: 'Power Dialer', icon: PhoneCall, view: 'power-dialer', section: 'dialer' },
    { id: 'sms-automation', name: 'SMS', icon: MessageSquare, view: 'sms-automation', section: 'dialer' },
    { id: 'smart-followups', name: 'Follow-ups', icon: Mail, view: 'smart-followups', section: 'dialer', badge: 'NEW' },
    { id: 'number-management', name: 'Numbers', icon: Phone, view: 'number-management', section: 'dialer' },
    
    // Sales Tools
    { id: 'sales-script', name: 'Scripts', icon: Scroll, view: 'sales-script', section: 'sales', badge: 'NEW' },
    { id: 'objections', name: 'Objections', icon: MessageSquare, view: 'objections', section: 'sales' },
    { id: 'planner', name: 'Prep', icon: BookOpen, view: 'planner', section: 'sales' },
    { id: 'crm-pipeline', name: 'CRM', icon: TrendingUp, view: 'crm-pipeline', section: 'sales' },
    
    // Research & Intelligence
    { id: 'company-info', name: 'Company', icon: Building2, view: 'company-info', section: 'research', badge: 'NEW' },
    { id: 'deep-research', name: 'Research', icon: Search, view: 'deep-research', section: 'research', badge: 'NEW' },
    { id: 'ai-notes', name: 'AI Notes', icon: Sparkles, view: 'ai-notes', section: 'research', badge: 'NEW' },
    
    // Training
    { id: 'knowledge-base', name: 'Knowledge', icon: Database, view: 'knowledge-base', section: 'training' },
    { id: 'practice', name: 'Practice', icon: Gamepad2, view: 'practice', section: 'training', badge: 'NEW' },
    
    // Management
    { id: 'calendar-sync', name: 'Calendar', icon: Calendar, view: 'calendar-sync', section: 'manage', badge: 'NEW' },
    { id: 'analytics', name: 'Performance', icon: BarChart3, view: 'analytics', section: 'manage' },
    { id: 'team', name: 'Team', icon: Users, view: 'team', section: 'manage' },
    { id: 'white-label', name: 'Branding', icon: Palette, view: 'white-label', section: 'manage' },
    { id: 'settings', name: 'Settings', icon: Settings, view: 'settings', section: 'manage' }
  ];

  const sectionTitles: Record<string, string> = {
    core: 'Core',
    'call-tools': 'Call Tools',
    dialer: 'Dialer & SMS',
    sales: 'Sales Tools',
    research: 'Research & Intel',
    training: 'Training',
    manage: 'Management'
  };

  const groupedNav = navigation.reduce((acc, item) => {
    const section = item.section || 'core';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

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
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
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
      case 'knowledge-base':
        return <MCKnowledgeBase />;
      case 'power-dialer':
        return <MCPowerDialer />;
      case 'crm-pipeline':
        return <MCCRMPipeline />;
      case 'sms-automation':
        return <MCSMSAutomation />;
      case 'number-management':
        return <MCNumberManagement />;
      case 'white-label':
        return <MCWhiteLabel />;
      case 'smart-followups':
        return <MCSmartFollowups />;
      case 'calendar-sync':
        return <MCCalendarSync />;
      case 'call-playback':
        return <MCCallPlayback />;
      case 'instant-feedback':
        return <MCInstantFeedback />;
      case 'live-transcribe':
        return <MCLiveTranscribe />;
      case 'company-info':
        return <MCCompanyInfo />;
      case 'sales-script':
        return <MCSalesScript />;
      case 'ai-notes':
        return <MCAINotes />;
      case 'practice':
        return <MCPractice />;
      case 'discreet-recording':
        return <MCDiscreetRecording />;
      case 'deep-research':
        return <MCDeepResearch />;
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
        forceCollapsed={true}
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
            <nav className={`${isInnerSidebarCollapsed ? 'p-2' : 'p-3'} space-y-4 flex-1 overflow-y-auto`}>
              {Object.entries(groupedNav).map(([section, items]) => (
                <div key={section}>
                  {!isInnerSidebarCollapsed && (
                    <div className="px-3 mb-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {sectionTitles[section]}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.view;
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setCurrentView(item.view as View)}
                              className={`w-full flex items-center ${isInnerSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg transition-all text-sm ${
                                isActive
                                  ? item.id === 'agent-settings' 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              } ${item.highlight && !isActive ? 'border border-emerald-200 dark:border-emerald-800' : ''}`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              {!isInnerSidebarCollapsed && (
                                <>
                                  <span className="font-medium flex-1 text-left">{item.name}</span>
                                  {item.badge && (
                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.highlight && !isActive && !item.badge && (
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
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
                  </div>
                </div>
              ))}
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
