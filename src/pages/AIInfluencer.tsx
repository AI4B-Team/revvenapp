import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Video, Sparkles, Upload, Wand2, Star, Zap, Film } from "lucide-react";

const AIInfluencer = () => {
  const [activeSection, setActiveSection] = useState<"character" | "video">("character");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 pt-24">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-10 mb-10 shadow-2xl animate-fade-in">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold text-white drop-shadow-lg">AI Influencer Studio</h1>
                </div>
                <p className="text-white/90 text-xl font-medium mb-6">Create stunning AI-powered influencer characters and videos with cutting-edge technology</p>
                
                {/* Stats */}
                <div className="flex gap-6 mt-8">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-semibold">Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-semibold">Instant Generation</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Film className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-semibold">HD Quality</span>
                  </div>
                </div>
              </div>
              
              {/* Animated Background Elements */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            </div>

            {/* Section Toggle */}
            <div className="flex gap-4 mb-10 p-2 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-2xl border-2 border-border/50 shadow-lg w-fit mx-auto backdrop-blur-sm">
              <Button
                variant={activeSection === "character" ? "default" : "ghost"}
                onClick={() => setActiveSection("character")}
                size="lg"
                className={`flex items-center gap-3 transition-all duration-300 px-8 rounded-xl ${
                  activeSection === "character" 
                    ? "shadow-xl scale-105" 
                    : "hover:bg-muted/50 hover:scale-105"
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-semibold text-base">Create Character</span>
              </Button>
              <Button
                variant={activeSection === "video" ? "default" : "ghost"}
                onClick={() => setActiveSection("video")}
                size="lg"
                className={`flex items-center gap-3 transition-all duration-300 px-8 rounded-xl ${
                  activeSection === "video" 
                    ? "shadow-xl scale-105" 
                    : "hover:bg-muted/50 hover:scale-105"
                }`}
              >
                <Video className="w-5 h-5" />
                <span className="font-semibold text-base">Create Video</span>
              </Button>
            </div>

            {/* Create Character Section */}
            {activeSection === "character" && (
              <Card className="border-2 border-primary/20 shadow-2xl animate-fade-in overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-primary/20 transition-all duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl" />
                
                <CardHeader className="relative pb-8 border-b border-border/50">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Create Your AI Character</CardTitle>
                      <CardDescription className="text-base mt-1">Design your AI influencer's personality and appearance</CardDescription>
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
                      className="min-h-[160px] text-base resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.01] border-2 hover:border-primary/50"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="reference-image" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Upload className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Reference image
                    </Label>
                    <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 transition-all duration-300 hover:bg-primary/5 cursor-pointer group">
                      <Input 
                        id="reference-image" 
                        type="file" 
                        accept="image/*"
                        className="h-full cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-primary file:to-primary/80 file:text-primary-foreground file:font-semibold file:cursor-pointer hover:file:from-primary/90 hover:file:to-primary/70 file:transition-all file:shadow-md hover:file:shadow-lg"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Star className="w-3 h-3" />
                      Upload a high-quality reference image for best results
                    </p>
                  </div>

                  <Button className="w-full h-14 text-lg font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300 gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-[1.02] group">
                    <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    Generate Character
                    <Zap className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
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
                    <Input 
                      id="select-character"
                      placeholder="Choose your AI character..." 
                      className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.02] border-2 hover:border-primary/50"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="video-topic" className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="w-4 h-4 text-primary group-hover:animate-pulse" />
                      Video Topic
                    </Label>
                    <Input 
                      id="video-topic"
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
                      placeholder="e.g., Talking head, Vlog style, Tutorial, Review" 
                      className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/30 focus:scale-[1.02] border-2 hover:border-primary/50"
                    />
                  </div>

                  <Button className="w-full h-14 text-lg font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300 gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-[1.02] group">
                    <Film className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    Generate Video
                    <Zap className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIInfluencer;
