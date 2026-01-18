import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Brand {
  id: string;
  name: string;
  initial: string;
  bgColor: string;
  isComplete: boolean;
  incompleteSection?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  primaryFont?: string;
  secondaryFont?: string;
  logo?: string;
}

interface BrandContextType {
  brands: Brand[];
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  isCreatingNewBrand: boolean;
  setIsCreatingNewBrand: (value: boolean) => void;
  draftBrand: Partial<Brand> | null;
  setDraftBrand: (brand: Partial<Brand> | null) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const defaultBrands: Brand[] = [
  { id: '1', name: 'Xalina Voss', initial: 'X', bgColor: 'bg-brand-pink', isComplete: true },
  { id: '2', name: 'Lifestyle Brand', initial: 'L', bgColor: 'bg-brand-blue', isComplete: false, incompleteSection: 'voice' },
  { id: '3', name: 'Fitness Pro', initial: 'F', bgColor: 'bg-brand-yellow', isComplete: false, incompleteSection: 'identity' },
];

const STORAGE_KEY = 'revven_brands';
const SELECTED_BRAND_KEY = 'revven_selected_brand';

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultBrands;
  });

  const [selectedBrand, setSelectedBrandState] = useState<Brand | null>(() => {
    const stored = localStorage.getItem(SELECTED_BRAND_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Make sure the stored brand still exists
      const storedBrands = localStorage.getItem(STORAGE_KEY);
      const brandList = storedBrands ? JSON.parse(storedBrands) : defaultBrands;
      const found = brandList.find((b: Brand) => b.id === parsed.id);
      return found || brandList[0] || null;
    }
    return brands[0] || null;
  });

  const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false);
  const [draftBrand, setDraftBrand] = useState<Partial<Brand> | null>(null);

  // Persist brands to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
  }, [brands]);

  // Persist selected brand to localStorage
  useEffect(() => {
    if (selectedBrand) {
      localStorage.setItem(SELECTED_BRAND_KEY, JSON.stringify(selectedBrand));
    }
  }, [selectedBrand]);

  const setSelectedBrand = (brand: Brand) => {
    setSelectedBrandState(brand);
    setIsCreatingNewBrand(false);
    setDraftBrand(null);
  };

  const addBrand = (brand: Brand) => {
    setBrands(prev => [...prev, brand]);
    setSelectedBrandState(brand);
    setIsCreatingNewBrand(false);
    setDraftBrand(null);
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    if (selectedBrand?.id === id) {
      setSelectedBrandState(prev => prev ? { ...prev, ...updates } : prev);
    }
  };

  const deleteBrand = (id: string) => {
    setBrands(prev => {
      const filtered = prev.filter(b => b.id !== id);
      // If we deleted the selected brand, select the first remaining one
      if (selectedBrand?.id === id && filtered.length > 0) {
        setSelectedBrandState(filtered[0]);
      }
      return filtered;
    });
  };

  return (
    <BrandContext.Provider value={{
      brands,
      selectedBrand,
      setSelectedBrand,
      addBrand,
      updateBrand,
      deleteBrand,
      isCreatingNewBrand,
      setIsCreatingNewBrand,
      draftBrand,
      setDraftBrand,
    }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
