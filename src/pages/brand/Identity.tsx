import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IdentityPage from '@/components/wizard/IdentityPage';

interface BrandData {
  logo?: File | string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  imageStyle?: {
    id: string;
    name: string;
    color: string;
  };
}

const Identity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BrandData>(() => {
    const saved = localStorage.getItem('brandData');
    return saved ? JSON.parse(saved).identity || {
      brandName: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      accentColor: '#10B981',
      primaryFont: 'Inter',
      secondaryFont: 'Inter',
    } : {
      brandName: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      accentColor: '#10B981',
      primaryFont: 'Inter',
      secondaryFont: 'Inter',
    };
  });

  const handleUpdate = (updates: Partial<BrandData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    const saved = localStorage.getItem('brandData');
    const allData = saved ? JSON.parse(saved) : {};
    allData.identity = newData;
    localStorage.setItem('brandData', JSON.stringify(allData));
  };

  const handleNext = () => {
    navigate('/brand/voice');
  };

  return (
    <IdentityPage
      formData={formData}
      onUpdate={handleUpdate}
      onNext={handleNext}
      canGoBack={false}
    />
  );
};

export default Identity;
