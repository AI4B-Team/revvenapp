import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ImageViewerModal from '@/components/dashboard/ImageViewerModal';
import { type GalleryItem } from '@/data/creationsData';

interface ProfileData {
  userId: string;
  name: string;
  avatar: string | null;
  totalPosts: number;
  totalLikes: number;
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<GalleryItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      setIsLoading(true);

      // Fetch all community posts by this user
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching profile posts:', postsError);
        toast({
          title: "Error",
          description: "Could not load profile",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setProfile(null);
        setPosts([]);
        setIsLoading(false);
        return;
      }

      // Get current user's likes
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: likesData } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', session.session.user.id);
        
        if (likesData) {
          setLikedItems(new Set(likesData.map(l => l.post_id)));
        }
      }

      // Calculate total likes
      const totalLikes = postsData.reduce((sum, post) => sum + (post.likes_count || 0), 0);

      // Build profile from first post
      const firstPost = postsData[0];
      setProfile({
        userId: userId,
        name: firstPost.creator_name,
        avatar: firstPost.creator_avatar,
        totalPosts: postsData.length,
        totalLikes
      });

      // Format posts as GalleryItems
      const formatTimestamp = (dateString: string | null): string => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffDays < 1) return 'Today';
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      const mappedPosts: GalleryItem[] = postsData.map((post: any) => ({
        id: post.id,
        title: post.title,
        thumbnail: post.thumbnail_url,
        url: post.content_url || post.thumbnail_url,
        type: post.original_item_type as 'image' | 'video' | 'audio' | 'document',
        creator: {
          name: post.creator_name,
          avatar: post.creator_avatar || post.creator_name.substring(0, 2).toUpperCase()
        },
        likes: post.likes_count || 0,
        isEdited: false,
        isUpscaled: false,
        createdAt: post.created_at,
        status: 'completed' as const,
        prompt: post.prompt,
        model: post.model,
        aspectRatio: post.aspect_ratio,
        resolution: post.resolution,
        timestamp: formatTimestamp(post.created_at)
      }));

      setPosts(mappedPosts);
      setIsLoading(false);
    };

    fetchProfileData();
  }, [userId, toast]);

  const toggleLike = async (postId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive"
      });
      return;
    }

    const isLiked = likedItems.has(postId);

    if (isLiked) {
      const { error } = await supabase
        .from('community_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.session.user.id);

      if (!error) {
        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: (p.likes || 1) - 1 } : p
        ));
      }
    } else {
      const { error } = await supabase
        .from('community_likes')
        .insert({ post_id: postId, user_id: session.session.user.id });

      if (!error) {
        setLikedItems(prev => new Set(prev).add(postId));
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
        ));
      }
    }
  };

  const handleDownload = async (item: GalleryItem) => {
    const url = item.url || item.thumbnail;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${item.title || 'download'}.${item.type === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">This user hasn't shared any creations yet.</p>
        <Button onClick={() => navigate('/community')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/community')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Creator Profile</h1>
        </div>
      </header>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/20">
            {profile.avatar ? (
              <AvatarImage src={profile.avatar} alt={profile.name} />
            ) : null}
            <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{profile.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">{profile.totalPosts}</span>
                <span>Shared</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium">{profile.totalLikes}</span>
                <span>Likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((item, index) => (
            <div
              key={item.id}
              className="relative group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImageIndex(index)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                {item.type === 'video' && item.url ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                ) : (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium line-clamp-2 mb-3">{item.title}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(item.id as string);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      likedItems.has(item.id as string)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/20 text-white hover:bg-red-500'
                    }`}
                  >
                    <Heart size={16} fill={likedItems.has(item.id as string) ? 'currentColor' : 'none'} />
                    <span className="text-sm">{item.likes}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                    className="p-2 rounded-lg bg-white/20 text-white hover:bg-white hover:text-black transition-colors"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && posts[selectedImageIndex] && (
        <ImageViewerModal
          image={posts[selectedImageIndex]}
          onClose={() => setSelectedImageIndex(null)}
          onPrevious={selectedImageIndex > 0 ? () => setSelectedImageIndex(selectedImageIndex - 1) : undefined}
          onNext={selectedImageIndex < posts.length - 1 ? () => setSelectedImageIndex(selectedImageIndex + 1) : undefined}
        />
      )}
    </div>
  );
};

export default PublicProfile;
