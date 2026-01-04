import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Trash2, Play, Pause, Loader2, User, Music, Mic } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface UserVoice {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  duration: number;
  user_id: string;
  created_at: string;
}

interface UserVoiceWithProfile extends UserVoice {
  profile?: Profile;
}

const AdminAudio = () => {
  const { toast } = useToast();
  const [audios, setAudios] = useState<UserVoiceWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchAudios();
  }, []);

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  const fetchAudios = async () => {
    setIsLoading(true);
    try {
      const { data: audiosData, error: audiosError } = await supabase
        .from('user_voices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (audiosError) throw audiosError;

      // Get unique user IDs
      const userIds = [...new Set(audiosData?.map(audio => audio.user_id) || [])];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      // Create a map of profiles
      const profilesMap = new Map<string, Profile>();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Combine audios with profiles
      const audiosWithProfiles = audiosData?.map(audio => ({
        ...audio,
        profile: profilesMap.get(audio.user_id)
      })) || [];

      setAudios(audiosWithProfiles);
    } catch (error) {
      console.error('Error fetching audios:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audio files.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAudio = async (audioId: string) => {
    try {
      const { error } = await supabase
        .from('user_voices')
        .delete()
        .eq('id', audioId);

      if (error) throw error;

      toast({
        title: 'Audio Deleted',
        description: 'The audio file has been removed.',
      });
      
      if (playingId === audioId) {
        audioElement?.pause();
        setPlayingId(null);
      }
      
      fetchAudios();
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete audio file.',
        variant: 'destructive',
      });
    }
  };

  const handlePlayPause = (audio: UserVoiceWithProfile) => {
    if (playingId === audio.id) {
      audioElement?.pause();
      setPlayingId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const newAudio = new Audio(audio.url);
      newAudio.play();
      newAudio.onended = () => setPlayingId(null);
      setAudioElement(newAudio);
      setPlayingId(audio.id);
    }
  };

  const filteredAudios = audios.filter((audio) =>
    audio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audio.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'transcription':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/50">Transcription</Badge>;
      case 'sound_effect':
        return <Badge variant="outline" className="text-purple-500 border-purple-500/50">Sound Effect</Badge>;
      case 'voice_clone':
        return <Badge variant="outline" className="text-orange-500 border-orange-500/50">Voice Clone</Badge>;
      case 'music':
        return <Badge variant="outline" className="text-pink-500 border-pink-500/50">Music</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Audio Files</h1>
            <p className="text-muted-foreground">Manage all audio files on the platform.</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  All Audio ({filteredAudios.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAudios.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No audio files found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAudios.map((audio) => (
                <Card key={audio.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-background/80 flex items-center justify-center">
                      {audio.type === 'voice_clone' ? (
                        <Mic className="w-10 h-10 text-primary" />
                      ) : (
                        <Music className="w-10 h-10 text-primary" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {getStatusBadge(audio.status)}
                    </div>
                    <div className="absolute top-2 left-2">
                      {getTypeBadge(audio.type)}
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-4 right-4 rounded-full w-12 h-12"
                      onClick={() => handlePlayPause(audio)}
                    >
                      {playingId === audio.id ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                      )}
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium line-clamp-1 mb-1">{audio.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Duration: {formatDuration(audio.duration)}
                    </p>
                    {/* Owner info */}
                    <div className="flex items-center gap-2 mb-2 p-2 rounded-md bg-muted/50">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={audio.profile?.avatar_url || ''} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">
                          {audio.profile?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {audio.profile?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(audio.created_at), 'MMM d, yyyy')}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteAudio(audio.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminAudio;
