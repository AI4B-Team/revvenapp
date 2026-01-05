import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RevvenSidebar from './dashboard/RevvenSidebar';
import TopBar from './dashboard/TopBar';
import Greeting from './Greeting';
import PromptInput from './PromptInput';
import WorkspacePanel from './dashboard/WorkspacePanel';
import InboxPanel from './dashboard/InboxPanel';
import AIChatPanel from './dashboard/AIChatPanel';
import CalendarApp from './dashboard/CalendarApp';
import CreatePanel from './dashboard/CreatePanel';
import FloatingWindow from './dashboard/FloatingWindow';
import { useTabs } from '@/contexts/TabsContext';

const RevvenDashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const navigate = useNavigate();
  const { floatingWindows, tabs, activeTabId, clearActiveTab } = useTabs();

  useEffect(() => {
    if (activeTabId) {
      const activeTabFromContext = tabs.find(t => t.id === activeTabId);
      if (activeTabFromContext && activeTabFromContext.name !== activeTab) {
        setActiveTab(activeTabFromContext.name);
        if (activeTabFromContext.name !== 'Home' && activeTabFromContext.name !== 'AIVA') {
          setSidebarCollapsed(true);
        }
      }
    }
  }, [activeTabId, tabs, activeTab]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'Home' || tabName === 'AIVA') {
      clearActiveTab();
    }
    if (tabName !== 'Home' && tabName !== 'AIVA') {
      setSidebarCollapsed(true);
    }
  };

  const handleAIVAClick = () => {
    const hasActiveAppTab = activeTabId !== '';
    
    if (hasActiveAppTab) {
      setAiChatOpen(!aiChatOpen);
    } else {
      setActiveTab('AIVA');
      clearActiveTab();
      setAiChatOpen(false);
    }
  };

  const handleHomeClick = () => {
    setActiveTab('Home');
    clearActiveTab();
    setAiChatOpen(false);
    setSidebarCollapsed(false);
  };

  const handleSeeAllProjects = () => {
    navigate('/projects');
  };

  const showAiChat = activeTabId !== '';

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <PromptInput showTabs={true} />;
      case 'AIVA':
        return (
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
            <Greeting />
            <PromptInput showTabs={false} />
          </div>
        );
      case 'Inbox':
        return (
          <div className="flex-1 p-6">
            <InboxPanel />
          </div>
        );
      case 'Calendar':
        return (
          <div className="flex-1 p-6">
            <CalendarApp />
          </div>
        );
      case 'Create':
        return (
          <div className="flex-1 p-6">
            <CreatePanel />
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {activeTab} content coming soon...
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <RevvenSidebar 
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onAIVAClick={handleAIVAClick}
        onHomeClick={handleHomeClick}
      />
      
      {showAiChat && (
        <div className="flex-shrink-0">
          <AIChatPanel />
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar activeTab={activeTab} onTabChange={handleTabChange} />
        {renderContent()}
      </div>

      {floatingWindows.map(win => (
        <FloatingWindow key={win.id} window={win} />
      ))}
    </div>
  );
};

export default RevvenDashboard;
