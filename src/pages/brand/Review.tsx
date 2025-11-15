import { useNavigate } from 'react-router-dom';
import ReviewPage from '@/components/wizard/ReviewPage';

const Review = () => {
  const navigate = useNavigate();
  
  const getBrandData = () => {
    const saved = localStorage.getItem('brandData');
    if (!saved) return {};
    
    const data = JSON.parse(saved);
    return {
      ...data.identity,
      ...data.voice,
      ...data.knowledge,
      ...data.intelligence,
      ...data.characters,
    };
  };

  const handleEdit = (step: number) => {
    const routes = [
      '/brand/identity',
      '/brand/voice',
      '/brand/knowledge-base',
      '/brand/intelligence',
      '/brand/characters',
    ];
    navigate(routes[step]);
  };

  const handleComplete = () => {
    navigate('/brand/complete');
  };

  const handleBack = () => {
    navigate('/brand/characters');
  };

  return (
    <ReviewPage
      formData={getBrandData()}
      onEdit={handleEdit}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
};

export default Review;
