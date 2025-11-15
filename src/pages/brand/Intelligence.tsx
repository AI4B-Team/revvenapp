import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IntelligencePage from '@/components/wizard/IntelligencePage';

interface IntelligenceData {
  competitors: any[];
  trackedContent: any[];
}

const Intelligence = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IntelligenceData>(() => {
    const saved = localStorage.getItem('brandData');
    return saved ? JSON.parse(saved).intelligence || {
      competitors: [],
      trackedContent: [],
    } : {
      competitors: [],
      trackedContent: [],
    };
  });

  const handleUpdate = (updates: Partial<IntelligenceData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    const saved = localStorage.getItem('brandData');
    const allData = saved ? JSON.parse(saved) : {};
    allData.intelligence = newData;
    localStorage.setItem('brandData', JSON.stringify(allData));
  };

  const handleNext = () => {
    navigate('/brand/characters');
  };

  const handleBack = () => {
    navigate('/brand/knowledge-base');
  };

  return (
    <IntelligencePage
      formData={formData}
      onUpdate={handleUpdate}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
};

export default Intelligence;
