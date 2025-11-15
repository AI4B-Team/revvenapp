import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KnowledgeBasePage from '@/components/wizard/KnowledgeBasePage';

interface KnowledgeData {
  dataSources: any[];
}

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<KnowledgeData>(() => {
    const saved = localStorage.getItem('brandData');
    return saved ? JSON.parse(saved).knowledge || {
      dataSources: [],
    } : {
      dataSources: [],
    };
  });

  const handleUpdate = (updates: Partial<KnowledgeData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    const saved = localStorage.getItem('brandData');
    const allData = saved ? JSON.parse(saved) : {};
    allData.knowledge = newData;
    localStorage.setItem('brandData', JSON.stringify(allData));
  };

  const handleNext = () => {
    navigate('/brand/intelligence');
  };

  const handleBack = () => {
    navigate('/brand/voice');
  };

  return (
    <KnowledgeBasePage
      formData={formData}
      onUpdate={handleUpdate}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
};

export default KnowledgeBase;
