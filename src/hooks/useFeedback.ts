import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FeedbackSubmission {
  id: string;
  user_id: string;
  type: 'general' | 'bug' | 'feature';
  title: string;
  description: string;
  attachments: string[];
  screen_recording_url: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  severity: 'low' | 'medium' | 'high' | null;
  parent_id: string | null;
  votes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface FeedbackComment {
  id: string;
  user_id: string;
  feedback_id: string;
  content: string;
  author_name: string;
  author_avatar: string | null;
  is_admin_reply: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackVote {
  id: string;
  user_id: string;
  feedback_id: string;
  created_at: string;
}

export const useFeedback = (type?: 'general' | 'bug' | 'feature') => {
  const queryClient = useQueryClient();

  // Fetch all feedback of a specific type
  const { data: feedbackList, isLoading, error } = useQuery({
    queryKey: ['feedback', type],
    queryFn: async () => {
      let query = supabase
        .from('feedback_submissions')
        .select('*')
        .order('votes_count', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FeedbackSubmission[];
    },
  });

  // Create new feedback
  const createFeedback = useMutation({
    mutationFn: async (feedback: {
      type: 'general' | 'bug' | 'feature';
      title: string;
      description: string;
      attachments?: string[];
      screen_recording_url?: string;
      severity?: 'low' | 'medium' | 'high';
      parent_id?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('feedback_submissions')
        .insert({
          user_id: user.user.id,
          type: feedback.type,
          title: feedback.title,
          description: feedback.description,
          attachments: feedback.attachments || [],
          screen_recording_url: feedback.screen_recording_url || null,
          severity: feedback.severity || null,
          parent_id: feedback.parent_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit feedback: ' + error.message);
    },
  });

  return {
    feedbackList,
    isLoading,
    error,
    createFeedback,
  };
};

export const useFeedbackVotes = (feedbackId: string) => {
  const queryClient = useQueryClient();

  // Check if current user has voted
  const { data: hasVoted } = useQuery({
    queryKey: ['feedback-vote', feedbackId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data, error } = await supabase
        .from('feedback_votes')
        .select('id')
        .eq('feedback_id', feedbackId)
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
  });

  // Toggle vote
  const toggleVote = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      if (hasVoted) {
        const { error } = await supabase
          .from('feedback_votes')
          .delete()
          .eq('feedback_id', feedbackId)
          .eq('user_id', user.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('feedback_votes')
          .insert({
            feedback_id: feedbackId,
            user_id: user.user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-vote', feedbackId] });
    },
    onError: (error) => {
      toast.error('Failed to vote: ' + error.message);
    },
  });

  return { hasVoted, toggleVote };
};

export const useFeedbackComments = (feedbackId: string) => {
  const queryClient = useQueryClient();

  // Fetch comments for a feedback
  const { data: comments, isLoading } = useQuery({
    queryKey: ['feedback-comments', feedbackId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_comments')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FeedbackComment[];
    },
  });

  // Add comment
  const addComment = useMutation({
    mutationFn: async ({ content, isAdminReply = false }: { content: string; isAdminReply?: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get user profile for author name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.user.id)
        .single();

      const { data, error } = await supabase
        .from('feedback_comments')
        .insert({
          feedback_id: feedbackId,
          user_id: user.user.id,
          content,
          author_name: profile?.full_name || 'Anonymous',
          author_avatar: profile?.avatar_url || null,
          is_admin_reply: isAdminReply,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-comments', feedbackId] });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Reply sent!');
    },
    onError: (error) => {
      toast.error('Failed to send reply: ' + error.message);
    },
  });

  return { comments, isLoading, addComment };
};

export const useUploadFeedbackAttachment = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('feedback-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('feedback-attachments')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      toast.error('Failed to upload file: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};
