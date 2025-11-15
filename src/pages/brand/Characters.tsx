import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharactersPage from '@/components/wizard/CharactersPage';

interface CharactersData {
  selectedCharacters: string[];
  defaultCharacter: string;
}

const Characters = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CharactersData>(() => {
    const saved = localStorage.getItem('brandData');
    return saved ? JSON.parse(saved).characters || {
      selectedCharacters: [],
      defaultCharacter: '',
    } : {
      selectedCharacters: [],
      defaultCharacter: '',
    };
  });

  const handleUpdate = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    const saved = localStorage.getItem('brandData');
    const allData = saved ? JSON.parse(saved) : {};
    allData.characters = newData;
    localStorage.setItem('brandData', JSON.stringify(allData));
  };

  const handleComplete = () => {
    navigate('/brand/review');
  };

  const handleBack = () => {
    navigate('/brand/intelligence');
  };

  return (
    <CharactersPage
      formData={formData}
      onUpdate={handleUpdate}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
};

export default Characters;
