import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export interface AppReview {
  id: string;
  user_id: string;
  app_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  author_name: string;
  created_at: string;
}

export const useAppReviews = (appId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<AppReview | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchReviews = async () => {
    if (!appId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('app_reviews')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
      // Find user's review if logged in
      if (user) {
        const existing = data?.find(r => r.user_id === user.id);
        setUserReview(existing || null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [appId, user?.id]);

  const submitReview = async (rating: number, title: string, content: string) => {
    if (!appId || !user) {
      toast.error('Please log in to leave a review');
      return false;
    }

    // Get user's name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const authorName = profile?.full_name || user.email?.split('@')[0] || 'Anonymous';

    if (userReview) {
      // Update existing review
      const { error } = await supabase
        .from('app_reviews')
        .update({ rating, title, content, author_name: authorName })
        .eq('id', userReview.id);

      if (error) {
        console.error('Error updating review:', error);
        toast.error('Failed to update review');
        return false;
      }
      toast.success('Review updated!');
    } else {
      // Create new review
      const { error } = await supabase
        .from('app_reviews')
        .insert({
          app_id: appId,
          user_id: user.id,
          rating,
          title,
          content,
          author_name: authorName,
        });

      if (error) {
        console.error('Error submitting review:', error);
        toast.error('Failed to submit review');
        return false;
      }
      toast.success('Review submitted!');
    }

    await fetchReviews();
    return true;
  };

  const deleteReview = async () => {
    if (!userReview) return false;

    const { error } = await supabase
      .from('app_reviews')
      .delete()
      .eq('id', userReview.id);

    if (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
      return false;
    }

    toast.success('Review deleted');
    await fetchReviews();
    return true;
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 
      ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 
      : 0
  }));

  return {
    reviews,
    isLoading,
    userReview,
    user,
    submitReview,
    deleteReview,
    totalReviews,
    averageRating,
    ratingDistribution,
    refetch: fetchReviews,
  };
};
