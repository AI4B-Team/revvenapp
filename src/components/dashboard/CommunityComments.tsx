import { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_avatar: string | null;
  user_id: string;
  created_at: string;
}

interface CommunityCommentsProps {
  postId: string;
}

const CommunityComments = ({ postId }: CommunityCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      setCurrentUserId(session?.session?.user?.id || null);

      // Fetch comments
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data || []);
      }
      setIsLoading(false);
    };

    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      toast({
        title: "Login required",
        description: "Please log in to comment",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', session.session.user.id)
      .single();

    const authorName = profileData?.full_name || session.session.user.email?.split('@')[0] || 'Anonymous';
    const authorAvatar = profileData?.avatar_url || null;

    const { error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: session.session.user.id,
        content: newComment.trim(),
        author_name: authorName,
        author_avatar: authorAvatar
      });

    if (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } else {
      setNewComment('');
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-3">Comments ({comments.length})</h3>
      
      <ScrollArea className="flex-1 pr-2 mb-3">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 group">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  {comment.author_avatar ? (
                    <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                  ) : null}
                  <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {comment.author_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white truncate">{comment.author_name}</span>
                    <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                      >
                        <Trash2 size={12} className="text-gray-500 hover:text-red-400" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 break-words">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm h-9"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={!newComment.trim() || isSubmitting}
          className="bg-primary hover:bg-primary/90 h-9 px-3"
        >
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
};

export default CommunityComments;
