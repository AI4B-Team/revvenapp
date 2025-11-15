import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoicePage from '@/components/wizard/VoicePage';

interface VoiceData {
  toneOfVoice: string[];
  writingStyle: string;
  communicationGuidelines: string;
  brandPersonality: string[];
  dosList: string[];
  dontsList: string[];
}

const Voice = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VoiceData>(() => {
    const saved = localStorage.getItem('brandData');
    return saved ? JSON.parse(saved).voice || {
      toneOfVoice: [],
      writingStyle: '',
      communicationGuidelines: '',
      brandPersonality: [],
      dosList: [],
      dontsList: [],
    } : {
      toneOfVoice: [],
      writingStyle: '',
      communicationGuidelines: '',
      brandPersonality: [],
      dosList: [],
      dontsList: [],
    };
  });

  const handleUpdate = (updates: Partial<VoiceData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    const saved = localStorage.getItem('brandData');
    const allData = saved ? JSON.parse(saved) : {};
    allData.voice = newData;
    localStorage.setItem('brandData', JSON.stringify(allData));
  };

  const handleNext = () => {
    navigate('/brand/knowledge-base');
  };

  const handleBack = () => {
    navigate('/brand/identity');
  };

  return (
    <VoicePage
      formData={formData}
      onUpdate={handleUpdate}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
};

export default Voice;
