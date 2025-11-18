import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Video, Sparkles, Upload, Wand2 } from "lucide-react";

const AIInfluencer = () => {
  const [activeSection, setActiveSection] = useState<"character" | "video">("character");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 pt-24">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/50 p-8 mb-8">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold text-foreground">AI Influencer Studio</h1>
                </div>
                <p className="text-muted-foreground text-lg">Create stunning AI-powered influencer characters and videos</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Section Toggle */}
            <div className="flex gap-3 mb-8 p-1.5 bg-muted/30 rounded-xl border border-border/50 w-fit">
              <Button
                variant={activeSection === "character" ? "default" : "ghost"}
                onClick={() => setActiveSection("character")}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  activeSection === "character" 
                    ? "shadow-md" 
                    : "hover:bg-muted/50"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Create Character</span>
              </Button>
              <Button
                variant={activeSection === "video" ? "default" : "ghost"}
                onClick={() => setActiveSection("video")}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  activeSection === "video" 
                    ? "shadow-md" 
                    : "hover:bg-muted/50"
                }`}
              >
                <Video className="w-4 h-4" />
                <span className="font-medium">Create Video</span>
              </Button>
            </div>

            {/* Create Character Section */}
            {activeSection === "character" && (
              <Card className="border-border/50 shadow-lg animate-fade-in overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Create Your AI Character</CardTitle>
                  </div>
                  <CardDescription className="text-base">Design your AI influencer's personality and appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  <div className="space-y-3 group">
                    <Label htmlFor="influencer-name" className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Name of the influencer
                    </Label>
                    <Input 
                      id="influencer-name" 
                      placeholder="e.g., Luna Martinez" 
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="space-y-3 group">
                    <Label htmlFor="influencer-bio" className="text-sm font-semibold flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      Bio of the influencer
                    </Label>
                    <Textarea 
                      id="influencer-bio"
                      placeholder="Describe your influencer's personality, interests, and style... e.g., A fitness enthusiast who loves outdoor adventures and healthy living"
                      className="min-h-[140px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="reference-image" className="text-sm font-semibold flex items-center gap-2">
                      <Upload className="w-4 h-4 text-primary" />
                      Reference image
                    </Label>
                    <div className="relative">
                      <Input 
                        id="reference-image" 
                        type="file" 
                        accept="image/*"
                        className="h-11 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90 transition-all"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Upload a reference image for your AI character</p>
                  </div>

                  <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate Character
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Create Video Section */}
            {activeSection === "video" && (
              <Card className="border-border/50 shadow-lg animate-fade-in overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Create Video Content</CardTitle>
                  </div>
                  <CardDescription className="text-base">Generate AI influencer videos with your character</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  <div className="space-y-3 group">
                    <Label htmlFor="select-character" className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Select Character
                    </Label>
                    <Input 
                      id="select-character"
                      placeholder="Choose your AI character..." 
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="video-topic" className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Video Topic
                    </Label>
                    <Input 
                      id="video-topic"
                      placeholder="e.g., Morning workout routine, Product review, Travel vlog" 
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="space-y-3 group">
                    <Label htmlFor="video-script" className="text-sm font-semibold flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      Script/Content
                    </Label>
                    <Textarea 
                      id="video-script"
                      placeholder="Enter your script here or describe what you want the AI to generate..."
                      className="min-h-[180px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to let AI generate the script automatically</p>
                  </div>

                  <div className="space-y-3 group">
                    <Label htmlFor="video-style" className="text-sm font-semibold flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      Video Style
                    </Label>
                    <Input 
                      id="video-style"
                      placeholder="e.g., Talking head, Vlog style, Tutorial, Review" 
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 gap-2">
                    <Video className="w-5 h-5" />
                    Generate Video
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
