import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Space {
  id: string;
  name: string;
  initial: string;
  bgColor: string;
  description?: string;
  createdAt: string;
}

interface SpaceContextType {
  spaces: Space[];
  selectedSpace: Space | null;
  setSelectedSpace: (space: Space) => void;
  addSpace: (space: Space) => void;
  updateSpace: (id: string, updates: Partial<Space>) => void;
  deleteSpace: (id: string) => void;
  isCreatingNewSpace: boolean;
  setIsCreatingNewSpace: (value: boolean) => void;
  draftSpace: Partial<Space> | null;
  setDraftSpace: (space: Partial<Space> | null) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

const bgColors = [
  'bg-brand-green',
  'bg-brand-blue',
  'bg-brand-yellow',
  'bg-brand-pink',
  'bg-brand-red',
];

const getRandomBgColor = () => bgColors[Math.floor(Math.random() * bgColors.length)];

const defaultSpaces: Space[] = [
  { 
    id: '1', 
    name: "Brian's Space", 
    initial: 'B', 
    bgColor: 'bg-brand-green',
    createdAt: new Date().toISOString()
  },
];

const STORAGE_KEY = 'revven_spaces';
const SELECTED_SPACE_KEY = 'revven_selected_space';

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSpaces;
  });

  const [selectedSpace, setSelectedSpaceState] = useState<Space | null>(() => {
    const stored = localStorage.getItem(SELECTED_SPACE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const storedSpaces = localStorage.getItem(STORAGE_KEY);
      const spaceList = storedSpaces ? JSON.parse(storedSpaces) : defaultSpaces;
      const found = spaceList.find((s: Space) => s.id === parsed.id);
      return found || spaceList[0] || null;
    }
    return spaces[0] || null;
  });

  const [isCreatingNewSpace, setIsCreatingNewSpace] = useState(false);
  const [draftSpace, setDraftSpace] = useState<Partial<Space> | null>(null);

  // Persist spaces to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
  }, [spaces]);

  // Persist selected space to localStorage
  useEffect(() => {
    if (selectedSpace) {
      localStorage.setItem(SELECTED_SPACE_KEY, JSON.stringify(selectedSpace));
    }
  }, [selectedSpace]);

  const setSelectedSpace = (space: Space) => {
    setSelectedSpaceState(space);
    setIsCreatingNewSpace(false);
    setDraftSpace(null);
  };

  const addSpace = (space: Space) => {
    const newSpace: Space = {
      ...space,
      id: space.id || Date.now().toString(),
      initial: space.name.charAt(0).toUpperCase(),
      bgColor: space.bgColor || getRandomBgColor(),
      createdAt: new Date().toISOString(),
    };
    setSpaces(prev => [...prev, newSpace]);
    setSelectedSpaceState(newSpace);
    setIsCreatingNewSpace(false);
    setDraftSpace(null);
    return newSpace;
  };

  const updateSpace = (id: string, updates: Partial<Space>) => {
    setSpaces(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        // Update initial if name changed
        if (updates.name) {
          updated.initial = updates.name.charAt(0).toUpperCase();
        }
        return updated;
      }
      return s;
    }));
    if (selectedSpace?.id === id) {
      setSelectedSpaceState(prev => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        if (updates.name) {
          updated.initial = updates.name.charAt(0).toUpperCase();
        }
        return updated;
      });
    }
  };

  const deleteSpace = (id: string) => {
    setSpaces(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (selectedSpace?.id === id && filtered.length > 0) {
        setSelectedSpaceState(filtered[0]);
      }
      return filtered;
    });
  };

  return (
    <SpaceContext.Provider value={{
      spaces,
      selectedSpace,
      setSelectedSpace,
      addSpace,
      updateSpace,
      deleteSpace,
      isCreatingNewSpace,
      setIsCreatingNewSpace,
      draftSpace,
      setDraftSpace,
    }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
}
