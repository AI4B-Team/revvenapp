import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { 
  PenLine, Inbox, Calendar, Users, DollarSign, Heart, BarChart3, 
  Receipt, FileText, ClipboardList, Briefcase, Megaphone, CreditCard,
  Timer, Package, Wallet, UserCog, Ticket, LucideIcon
} from 'lucide-react';

export interface Tab {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface FloatingWindow {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isFocused: boolean;
}

interface TabsContextType {
  tabs: Tab[];
  floatingWindows: FloatingWindow[];
  activeTabId: string;
  addTab: (name: string) => string | null;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  clearActiveTab: () => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  detachTab: (tabId: string, position: { x: number; y: number }) => void;
  dockWindow: (windowId: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  tileWindows: (layout: 'side-by-side' | 'top-bottom' | 'grid') => void;
  getAppConfig: (name: string) => { icon: LucideIcon; color: string } | undefined;
}

const appConfigs: Record<string, { icon: LucideIcon; color: string }> = {
  'Create': { icon: PenLine, color: 'bg-emerald-500' },
  'Inbox': { icon: Inbox, color: 'bg-blue-500' },
  'Calendar': { icon: Calendar, color: 'bg-red-500' },
  'Leads': { icon: Users, color: 'bg-purple-500' },
  'Sales': { icon: DollarSign, color: 'bg-amber-500' },
  'Customers': { icon: Heart, color: 'bg-pink-500' },
  'Analytics': { icon: BarChart3, color: 'bg-cyan-500' },
  'Invoices': { icon: Receipt, color: 'bg-orange-500' },
  'Reports': { icon: FileText, color: 'bg-indigo-500' },
  'Contracts': { icon: ClipboardList, color: 'bg-teal-500' },
  'Projects': { icon: Briefcase, color: 'bg-violet-500' },
  'Marketing': { icon: Megaphone, color: 'bg-rose-500' },
  'Expenses': { icon: CreditCard, color: 'bg-lime-500' },
  'Time Tracking': { icon: Timer, color: 'bg-sky-500' },
  'Inventory': { icon: Package, color: 'bg-yellow-500' },
  'Payroll': { icon: Wallet, color: 'bg-green-500' },
  'HR Portal': { icon: UserCog, color: 'bg-fuchsia-500' },
  'Support Tickets': { icon: Ticket, color: 'bg-slate-500' },
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider = ({ children }: { children: ReactNode }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', name: 'Create', icon: PenLine, color: 'bg-emerald-500' },
    { id: '2', name: 'Inbox', icon: Inbox, color: 'bg-blue-500' },
    { id: '3', name: 'Calendar', icon: Calendar, color: 'bg-red-500' },
    { id: '4', name: 'Leads', icon: Users, color: 'bg-purple-500' },
    { id: '5', name: 'Sales', icon: DollarSign, color: 'bg-amber-500' },
    { id: '6', name: 'Customers', icon: Heart, color: 'bg-pink-500' },
  ]);
  const [activeTabId, setActiveTabId] = useState('');
  const [floatingWindows, setFloatingWindows] = useState<FloatingWindow[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(100);

  const addTab = useCallback((name: string): string | null => {
    const existingTab = tabs.find(tab => tab.name === name);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return existingTab.id;
    }

    const existingWindow = floatingWindows.find(w => w.name === name);
    if (existingWindow) {
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        name: existingWindow.name,
        icon: existingWindow.icon,
        color: existingWindow.color,
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setFloatingWindows(prev => prev.filter(w => w.id !== existingWindow.id));
      return newTab.id;
    }

    const config = appConfigs[name];
    if (!config) return null;

    const newTabId = Date.now().toString();
    const newTab: Tab = {
      id: newTabId,
      name,
      icon: config.icon,
      color: config.color,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    return newTabId;
  }, [tabs, floatingWindows]);

  const removeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const clearActiveTab = useCallback(() => {
    setActiveTabId('');
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [moved] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, moved);
      return newTabs;
    });
  }, []);

  const detachTab = useCallback((tabId: string, position: { x: number; y: number }) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const newWindow: FloatingWindow = {
      id: `window-${Date.now()}`,
      name: tab.name,
      icon: tab.icon,
      color: tab.color,
      position,
      size: { width: 800, height: 500 },
      zIndex: highestZIndex + 1,
      isFocused: true,
    };

    setFloatingWindows(prev => [...prev.map(w => ({ ...w, isFocused: false })), newWindow]);
    setHighestZIndex(prev => prev + 1);
    
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  }, [tabs, highestZIndex, activeTabId]);

  const dockWindow = useCallback((windowId: string) => {
    const window = floatingWindows.find(w => w.id === windowId);
    if (!window) return;

    const existingTab = tabs.find(t => t.name === window.name);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        name: window.name,
        icon: window.icon,
        color: window.color,
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }

    setFloatingWindows(prev => prev.filter(w => w.id !== windowId));
  }, [floatingWindows, tabs]);

  const closeWindow = useCallback((id: string) => {
    setFloatingWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setFloatingWindows(prev => prev.map(w => ({
      ...w,
      isFocused: w.id === id,
      zIndex: w.id === id ? highestZIndex + 1 : w.zIndex,
    })));
    setHighestZIndex(prev => prev + 1);
  }, [highestZIndex]);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setFloatingWindows(prev => prev.map(w => w.id === id ? { ...w, position } : w));
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setFloatingWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  }, []);

  const tileWindows = useCallback((layout: 'side-by-side' | 'top-bottom' | 'grid') => {
    if (floatingWindows.length < 2) return;

    const screenWidth = window.innerWidth - 280;
    const screenHeight = window.innerHeight - 60;
    const gap = 8;
    const offsetX = 280;

    setFloatingWindows(prev => {
      switch (layout) {
        case 'side-by-side': {
          const width = (screenWidth - gap * 3) / prev.length;
          return prev.map((w, i) => ({
            ...w,
            position: { x: offsetX + gap + i * (width + gap), y: 60 + gap },
            size: { width, height: screenHeight - gap * 2 },
          }));
        }
        case 'top-bottom': {
          const height = (screenHeight - gap * 3) / prev.length;
          return prev.map((w, i) => ({
            ...w,
            position: { x: offsetX + gap, y: 60 + gap + i * (height + gap) },
            size: { width: screenWidth - gap * 2, height },
          }));
        }
        case 'grid': {
          const cols = Math.ceil(Math.sqrt(prev.length));
          const rows = Math.ceil(prev.length / cols);
          const cellWidth = (screenWidth - gap * (cols + 1)) / cols;
          const cellHeight = (screenHeight - gap * (rows + 1)) / rows;
          return prev.map((w, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
              ...w,
              position: { x: offsetX + gap + col * (cellWidth + gap), y: 60 + gap + row * (cellHeight + gap) },
              size: { width: cellWidth, height: cellHeight },
            };
          });
        }
        default:
          return prev;
      }
    });
  }, [floatingWindows.length]);

  const getAppConfig = useCallback((name: string) => appConfigs[name], []);

  const value = useMemo(() => ({
    tabs,
    floatingWindows,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    clearActiveTab,
    reorderTabs,
    detachTab,
    dockWindow,
    closeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    tileWindows,
    getAppConfig,
  }), [tabs, floatingWindows, activeTabId, addTab, removeTab, setActiveTab, clearActiveTab, reorderTabs, detachTab, dockWindow, closeWindow, focusWindow, updateWindowPosition, updateWindowSize, tileWindows, getAppConfig]);

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};
