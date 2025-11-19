import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Video, Sparkles, Upload, Wand2, Star, Zap, Film, CheckCircle2, X, Trash2, Users, Download, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoGenerationCountdown } from "@/components/VideoGenerationCountdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import seedanceLogo from "@/assets/model-logos/seedance.png";
import vo3Logo from "@/assets/model-logos/vo3.png";
import soraLogo from "@/assets/model-logos/sora.png";
import klingLogo from "@/assets/model-logos/kling.png";
import hailuoLogo from "@/assets/model-logos/hailuo.png";
import grokLogo from "@/assets/model-logos/grok.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AICharacter {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  created_at: string;
}

interface AIVideo {
  id: string;
  character_id: string;
  character_name: string;
  character_bio: string;
  character_image_url: string;
  video_topic: string;
  video_script: string | null;
  video_style: string;
  video_generation_model: string;
  video_url: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const AIInfluencer = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"character" | "video" | "manage">("character");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Character form state
  const [characterName, setCharacterName] = useState("");
  const [characterBio, setCharacterBio] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Characters list state
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  
  // Video creation state
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [videoTopic, setVideoTopic] = useState("");
  const [videoScript, setVideoScript] = useState("");
  const [videoStyle, setVideoStyle] = useState("");
  const [videoGenerationModel, setVideoGenerationModel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // Video history state
  const [generatedVideos, setGeneratedVideos] = useState<AIVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [completedVideo, setCompletedVideo] = useState<AIVideo | null>(null);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  const VIDEO_MODELS = [
    { name: "Seedance 1.0", logo: seedanceLogo },
    { name: "Vo3.1", logo: vo3Logo },
    { name: "Sora 2", logo: soraLogo },
    { name: "Kling 2.5 T", logo: klingLogo },
    { name: "Hailuo", logo: hailuoLogo },
    { name: "grok-imagine", logo: grokLogo }
  ] as const;

  // Fetch characters
  const fetchCharacters = async () => {
    setIsLoadingCharacters(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoadingCharacters(false);
        return;
      }

      const { data, error } = await supabase
        .from('ai_characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching characters:', error);
        toast.error('Failed to load characters');
      } else {
        setCharacters(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoadingCharacters(false);
    }
  };

  // Fetch generated videos
  const fetchGeneratedVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGeneratedVideos(data || []);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load video history');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('ai_videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
      
      setGeneratedVideos(prev => prev.filter(v => v.id !== videoId));
      toast.success("Video deleted successfully");
      setVideoToDelete(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error("Failed to delete video");
    }
  };

  // Set up real-time subscription for video updates
  useEffect(() => {
    if (!currentVideoId) return;

    const channel = supabase
      .channel('video-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_videos',
          filter: `id=eq.${currentVideoId}`
        },
        (payload) => {
          console.log('Real-time video update:', payload);
          const updatedVideo = payload.new as AIVideo;
          
          if (updatedVideo.status === 'completed' && updatedVideo.video_url) {
            setShowCountdown(false);
            setIsGenerating(false);
            
            // Update videos list
            setGeneratedVideos(prev => {
              const index = prev.findIndex(v => v.id === updatedVideo.id);
              if (index >= 0) {
                const newVideos = [...prev];
                newVideos[index] = updatedVideo;
                return newVideos;
              }
              return [updatedVideo, ...prev];
            });
            
            // Show completed dialog
            setCompletedVideo(updatedVideo);
            setShowCompletedDialog(true);
            
            setActiveSection("manage");
            
            // Reset form
            setVideoTopic("");
            setVideoScript("");
            setVideoStyle("");
            setVideoGenerationModel("");
            setSelectedCharacterId("");
            setCurrentVideoId(null);
            
          } else if (updatedVideo.status === 'failed') {
            setShowCountdown(false);
            setIsGenerating(false);
            toast.error("Video generation failed. Please try again.");
            setCurrentVideoId(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentVideoId]);

  // Handle video generation
  const handleGenerateVideo = async () => {
    if (!selectedCharacterId) {
      toast.error("Please select a character");
      return;
    }
    
    if (!videoTopic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }
    
    if (!videoStyle.trim()) {
      toast.error("Please enter a video style");
      return;
    }

    if (!videoGenerationModel) {
      toast.error("Please select a video generation model");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const selectedCharacter = characters.find(c => c.id === selectedCharacterId);
      if (!selectedCharacter) throw new Error("Character not found");
      
      const { data: videoRecord, error: dbError } = await supabase
        .from('ai_videos')
        .insert({
          user_id: user.id,
          character_id: selectedCharacter.id,
          character_name: selectedCharacter.name,
          character_bio: selectedCharacter.bio,
          character_image_url: selectedCharacter.image_url,
          video_topic: videoTopic,
          video_script: videoScript || null,
          video_style: videoStyle,
          video_generation_model: videoGenerationModel,
          status: 'processing'
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      setCurrentVideoId(videoRecord.id);
      
      const webhookPayload = {
        video_id: videoRecord.id,
        character: {
          name: selectedCharacter.name,
          bio: selectedCharacter.bio,
          image_url: selectedCharacter.image_url,
        },
        video: {
          topic: videoTopic,
          script: videoScript || "Auto-generate script based on topic",
          style: videoStyle,
          model: videoGenerationModel,
        },
      };
      
      console.log("Sending webhook for video generation via edge function...");
      toast.success("Video generation started!");
      setShowCountdown(true);
      
      // Call backend edge function to handle n8n + Cloudinary without browser CORS issues
      const { data, error: functionError } = await supabase.functions.invoke(
        "generate-video",
        {
          body: webhookPayload,
        }
      );

      if (functionError || !data?.success) {
        console.error("Edge function error:", functionError || data?.error);
        throw new Error(
          (data && !data.success && data.error) ||
            "Failed to generate video. Please try again."
        );
      }

      console.log("generate-video edge function completed successfully");
    } catch (error) {
      console.error("Error generating video:", error);
      
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate video. Please try again.";
      
      toast.error(errorMessage);
      setIsGenerating(false);
      setShowCountdown(false);
      
      if (currentVideoId) {
        await supabase
          .from("ai_videos")
          .update({ status: "failed" })
          .eq("id", currentVideoId);
      }
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await fetchCharacters();
      await fetchGeneratedVideos();
      setIsPageLoading(false);
    };
    initPage();
  }, []);

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AI Influencer Studio...</p>
        </div>
      </div>
    );
  }

  if (showCountdown) {
    return (
      <VideoGenerationCountdown
        totalSeconds={600}
        onComplete={() => {
          setShowCountdown(false);
          toast.info("Still processing... We'll notify you when it's ready.");
        }}
        onSkip={() => {
          setShowCountdown(false);
          toast.success("Video is processing in the background. It will appear in your history when ready.");
        }}
      />
    );
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Handle character creation
  const handleCreateCharacter = async () => {
    if (!characterName.trim()) {
      toast.error('Please enter a character name');
      return;
    }
    
    if (!characterBio.trim()) {
      toast.error('Please enter a character bio');
      return;
    }
    
    if (!selectedFile) {
      toast.error('Please select a reference image');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a character');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
        'upload-character-image',
        {
          body: formData,
        }
      );

      if (uploadError || !uploadData?.url) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload image. Please try again.');
        setIsUploading(false);
        return;
      }

      const { error: dbError } = await supabase
        .from('ai_characters')
        .insert({
          user_id: user.id,
          name: characterName.trim(),
          bio: characterBio.trim(),
          image_url: uploadData.url,
          cloudinary_public_id: uploadData.public_id,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Failed to save character. Please try again.');
        setIsUploading(false);
        return;
      }

      toast.success('Character created successfully!', {
        description: `${characterName} has been added to your collection`,
      });

      setCharacterName('');
      setCharacterBio('');
      setSelectedFile(null);
      setImagePreview(null);
      
      const fileInput = document.getElementById('reference-image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      fetchCharacters();

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle character deletion
  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return;

    try {
      const { error } = await supabase
        .from('ai_characters')
        .delete()
        .eq('id', characterToDelete);

      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete character');
        return;
      }

      toast.success('Character deleted successfully');
      fetchCharacters();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setDeleteDialogOpen(false);
      setCharacterToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setCharacterToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/[0.03]">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="p-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/95 to-primary/80 p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-fade-in border border-white/10">
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-white/30 rounded-2xl blur-lg group-hover:bg-white/40 transition-all duration-300" />
                    <div className="relative p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-inner">
                      <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-6xl font-black text-white drop-shadow-2xl tracking-tight">AI Influencer Studio</h1>
                    <div className="h-1 w-32 bg-white/40 rounded-full mt-2" />
                  </div>
                </div>
                <p className="text-white/95 text-xl font-medium mb-8 max-w-3xl leading-relaxed">Create stunning AI-powered influencer characters and cinematic videos with cutting-edge technology</p>
                
                {/* Premium Stats Badges */}
                <div className="flex flex-wrap gap-4 mt-10">
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-3 bg-white/15 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20 shadow-lg">
                      <Star className="w-6 h-6 text-yellow-300 drop-shadow-glow" />
                      <span className="text-white font-bold text-sm tracking-wide">Premium Quality</span>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-3 bg-white/15 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20 shadow-lg">
                      <Zap className="w-6 h-6 text-yellow-300 drop-shadow-glow" />
                      <span className="text-white font-bold text-sm tracking-wide">Instant Generation</span>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-3 bg-white/15 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/20 shadow-lg">
                      <Film className="w-6 h-6 text-yellow-300 drop-shadow-glow" />
                      <span className="text-white font-bold text-sm tracking-wide">4K Quality</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Premium Animated Background */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-white/15 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
              <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
            </div>

            {/* Premium Section Toggle */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-[1.5rem] blur-lg opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative flex gap-3 p-2 bg-gradient-to-br from-card/95 via-card to-card/95 rounded-[1.5rem] border-2 border-primary/20 shadow-2xl backdrop-blur-xl w-fit mx-auto">
                <Button
                  variant={activeSection === "character" ? "default" : "ghost"}
                  onClick={() => setActiveSection("character")}
                  size="lg"
                  className={`relative flex items-center gap-3 transition-all duration-500 px-10 py-6 rounded-xl font-bold text-base overflow-hidden ${
                    activeSection === "character" 
                      ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-105 bg-gradient-to-br from-primary to-primary/90" 
                      : "hover:bg-muted/60 hover:scale-105 hover:shadow-lg"
                  }`}
                >
                  {activeSection === "character" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  )}
                  <User className={`w-5 h-5 relative z-10 ${activeSection === "character" ? "animate-pulse" : ""}`} />
                  <span className="relative z-10">Create Character</span>
                </Button>
                <Button
                  variant={activeSection === "manage" ? "default" : "ghost"}
                  onClick={() => setActiveSection("manage")}
                  size="lg"
                  className={`relative flex items-center gap-3 transition-all duration-500 px-10 py-6 rounded-xl font-bold text-base overflow-hidden ${
                    activeSection === "manage" 
                      ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-105 bg-gradient-to-br from-primary to-primary/90" 
                      : "hover:bg-muted/60 hover:scale-105 hover:shadow-lg"
                  }`}
                >
                  {activeSection === "manage" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  )}
                  <Users className={`w-5 h-5 relative z-10 ${activeSection === "manage" ? "animate-pulse" : ""}`} />
                  <span className="relative z-10">My Creations</span>
                </Button>
                <Button
                  variant={activeSection === "video" ? "default" : "ghost"}
                  onClick={() => setActiveSection("video")}
                  size="lg"
                  className={`relative flex items-center gap-3 transition-all duration-500 px-10 py-6 rounded-xl font-bold text-base overflow-hidden ${
                    activeSection === "video" 
                      ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-105 bg-gradient-to-br from-primary to-primary/90" 
                      : "hover:bg-muted/60 hover:scale-105 hover:shadow-lg"
                  }`}
                >
                  {activeSection === "video" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  )}
                  <Video className={`w-5 h-5 relative z-10 ${activeSection === "video" ? "animate-pulse" : ""}`} />
                  <span className="relative z-10">Create Video</span>
                </Button>
              </div>
            </div>

            {/* Create Character Section */}
            {activeSection === "character" && (
              <Card className="relative overflow-hidden border-2 border-primary/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] bg-gradient-to-br from-card/98 via-card to-card/98 backdrop-blur-xl animate-fade-in">
                {/* Premium Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/8 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl" />
                
                <CardHeader className="relative pb-8 border-b-2 border-border/30 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
                  <div className="flex items-center gap-5 mb-3">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary/60 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300" />
                      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 shadow-xl border border-white/10">
                        <User className="w-7 h-7 text-primary-foreground drop-shadow-lg" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-4xl font-black bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text tracking-tight">Create Your AI Character</CardTitle>
                      <CardDescription className="text-base mt-2 font-medium">Design your AI influencer's unique personality and stunning appearance</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-8 relative pt-8">
                  <div className="space-y-3 group">
                    <Label htmlFor="influencer-name" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Name of the influencer
                    </Label>
                    <Input 
                      id="influencer-name" 
                      placeholder="e.g., Luna Martinez" 
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      disabled={isUploading}
                      className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.02] border-2 hover:border-primary/50"
                    />
                  </div>
                  
                  <div className="space-y-3 group">
                    <Label htmlFor="influencer-bio" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Wand2 className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Bio of the influencer
                    </Label>
                    <Textarea 
                      id="influencer-bio"
                      placeholder="Describe your influencer's personality, interests, and style... e.g., A fitness enthusiast who loves outdoor adventures and healthy living"
                      value={characterBio}
                      onChange={(e) => setCharacterBio(e.target.value)}
                      disabled={isUploading}
                      className="min-h-[160px] text-base resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.01] border-2 hover:border-primary/50"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="reference-image" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Upload className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Reference image
                    </Label>
                    {imagePreview ? (
                      <div className="relative border-2 border-primary/50 rounded-lg p-4 bg-primary/5">
                        <div className="flex items-start gap-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-lg shadow-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Image selected
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveImage}
                                disabled={isUploading}
                                className="h-8 w-8 p-0 hover:bg-destructive/10"
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {selectedFile?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 transition-all duration-300 hover:bg-primary/5 cursor-pointer group">
                        <Input 
                          id="reference-image" 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={isUploading}
                          className="h-full cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-primary file:to-primary/80 file:text-primary-foreground file:font-semibold file:cursor-pointer hover:file:from-primary/90 hover:file:to-primary/70 file:transition-all file:shadow-md hover:file:shadow-lg"
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Star className="w-3 h-3" />
                      Upload a high-quality reference image for best results (max 10MB)
                    </p>
                  </div>

                  <Button 
                    onClick={handleCreateCharacter}
                    disabled={isUploading}
                    className="w-full h-14 text-lg font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300 gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Creating Character...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        Generate Character
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* My Characters and Video History Section */}
            {activeSection === "manage" && (
              <div className="animate-fade-in space-y-8">
                {/* Video History */}
                <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                          <Film className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold">Video History</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {generatedVideos.length} video{generatedVideos.length !== 1 ? 's' : ''} generated
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection("video")}
                        className="gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Create Video
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8">
                    {isLoadingVideos ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : generatedVideos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                          <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
                        <p className="text-muted-foreground mb-6">Generate your first AI video to get started</p>
                        <Button
                          onClick={() => setActiveSection("video")}
                          className="gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Create Video
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generatedVideos.map((video) => (
                          <Card key={video.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                              {video.status === 'completed' && video.video_url ? (
                                <video
                                  src={video.video_url}
                                  className="w-full h-full object-cover"
                                  controls
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {video.status === 'processing' ? (
                                    <div className="text-center">
                                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-2" />
                                      <p className="text-sm text-muted-foreground">Processing...</p>
                                    </div>
                                  ) : video.status === 'failed' ? (
                                    <div className="text-center">
                                      <X className="w-12 h-12 text-destructive mx-auto mb-2" />
                                      <p className="text-sm text-destructive">Generation Failed</p>
                                    </div>
                                  ) : (
                                    <Clock className="w-12 h-12 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                                  <img 
                                    src={video.character_image_url} 
                                    alt={video.character_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-foreground truncate">{video.character_name}</h3>
                                  <p className="text-sm text-muted-foreground truncate">{video.video_topic}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Film className="w-3 h-3" />
                                  <span>{video.video_style}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                {video.status === 'completed' && video.video_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    onClick={() => window.open(video.video_url!, '_blank')}
                                  >
                                    <Download className="w-3 h-3" />
                                    Download
                                  </Button>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => setVideoToDelete(video.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* My Characters */}
                <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                          <Users className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold">My AI Characters</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {characters.length} character{characters.length !== 1 ? 's' : ''} created
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection("character")}
                        className="gap-2"
                      >
                        <User className="w-4 h-4" />
                        Create New
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8">
                    {isLoadingCharacters ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : characters.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                          <Users className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No characters yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first AI character to get started</p>
                        <Button
                          onClick={() => setActiveSection("character")}
                          className="gap-2"
                        >
                          <User className="w-4 h-4" />
                          Create Character
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {characters.map((character) => (
                          <Card key={character.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                              <img
                                src={character.image_url}
                                alt={character.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold text-lg mb-2 line-clamp-1">{character.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{character.bio}</p>
                              <div className="flex gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1 gap-2"
                                  onClick={() => confirmDelete(character.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Create Video Section */}
            {activeSection === "video" && (
              <Card className="border-2 border-primary/20 shadow-2xl animate-fade-in overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-primary/20 transition-all duration-500">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-2xl" />
                
                <CardHeader className="relative pb-8 border-b border-border/50">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                      <Video className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Create Video Content</CardTitle>
                      <CardDescription className="text-base mt-1">Generate AI influencer videos with your character</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-8 relative pt-8">
                  <div className="space-y-3 group">
                    <Label htmlFor="select-character" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <User className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Select Character
                    </Label>
                    {characters.length > 0 ? (
                      <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                        <SelectTrigger className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 border-2 hover:border-primary/50 bg-background">
                          <SelectValue placeholder="Choose your AI character..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-2 border-border shadow-xl z-[100]">
                          {characters.map((character) => (
                            <SelectItem 
                              key={character.id} 
                              value={character.id}
                              className="cursor-pointer hover:bg-accent focus:bg-accent"
                            >
                              <div className="flex items-center gap-3 py-1">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                                  <img 
                                    src={character.image_url} 
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{character.name}</span>
                                  <span className="text-xs text-muted-foreground line-clamp-1">{character.bio}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-12 flex items-center justify-center border-2 border-dashed border-border rounded-md bg-muted/20">
                        <p className="text-sm text-muted-foreground">No characters available. Create one first!</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="video-topic" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Video Topic
                    </Label>
                    <Input 
                      id="video-topic"
                      value={videoTopic}
                      onChange={(e) => setVideoTopic(e.target.value)}
                      placeholder="e.g., Morning workout routine, Product review, Travel vlog" 
                      className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.02] border-2 hover:border-primary/50"
                    />
                  </div>
                  
                  <div className="space-y-3 group">
                    <Label htmlFor="video-script" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Wand2 className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Script/Content
                    </Label>
                    <Textarea 
                      id="video-script"
                      value={videoScript}
                      onChange={(e) => setVideoScript(e.target.value)}
                      placeholder="Enter your script here or describe what you want the AI to generate..."
                      className="min-h-[200px] text-base resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.01] border-2 hover:border-primary/50"
                    />
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Wand2 className="w-3 h-3" />
                      Leave empty to let AI generate the script automatically
                    </p>
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="video-style" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Film className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Video Style
                    </Label>
                    <Input 
                      id="video-style"
                      value={videoStyle}
                      onChange={(e) => setVideoStyle(e.target.value)}
                      placeholder="e.g., Talking head, Vlog style, Tutorial, Review" 
                      className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.02] border-2 hover:border-primary/50"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="video-model" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Zap className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Video Generation Model
                    </Label>
                    <Select
                      value={videoGenerationModel}
                      onValueChange={setVideoGenerationModel}
                    >
                      <SelectTrigger 
                        id="video-model"
                        className="h-14 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 border-2 hover:border-primary/50 bg-background"
                      >
                        <SelectValue placeholder="Select a model...">
                          {videoGenerationModel && (
                            <div className="flex items-center gap-3">
                              <img 
                                src={VIDEO_MODELS.find(m => m.name === videoGenerationModel)?.logo} 
                                alt={videoGenerationModel}
                                className="w-6 h-6 object-contain"
                              />
                              <span>{videoGenerationModel}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {VIDEO_MODELS.map((model) => (
                          <SelectItem 
                            key={model.name} 
                            value={model.name}
                            className="cursor-pointer hover:bg-primary/10 h-12"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={model.logo} 
                                alt={model.name}
                                className="w-6 h-6 object-contain"
                              />
                              <span>{model.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || !selectedCharacterId || !videoTopic || !videoStyle || !videoGenerationModel}
                    className="w-full h-14 text-lg font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300 gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Starting Generation...
                      </>
                    ) : (
                      <>
                        <Film className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                        Generate Video
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Video Completed Dialog */}
      <Dialog open={showCompletedDialog} onOpenChange={setShowCompletedDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Video Generation Completed!
            </DialogTitle>
            <DialogDescription>
              Your AI-generated video is ready to view and download
            </DialogDescription>
          </DialogHeader>
          {completedVideo && (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <video
                  src={completedVideo.video_url!}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <img
                  src={completedVideo.character_image_url}
                  alt={completedVideo.character_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{completedVideo.character_name}</h4>
                  <p className="text-sm text-muted-foreground">{completedVideo.video_topic}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => window.open(completedVideo.video_url!, '_blank')}
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCompletedDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Video Confirmation */}
      <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => videoToDelete && handleDeleteVideo(videoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this character? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCharacter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AIInfluencer;
