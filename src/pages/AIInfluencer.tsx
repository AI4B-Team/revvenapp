import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Video } from "lucide-react";

const AIInfluencer = () => {
  const [activeSection, setActiveSection] = useState<"character" | "video">("character");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 pt-24">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-foreground">AI Influencer</h1>
            <p className="text-muted-foreground mb-8">Create AI-powered influencer content</p>

            {/* Section Toggle */}
            <div className="flex gap-4 mb-8">
              <Button
                variant={activeSection === "character" ? "default" : "outline"}
                onClick={() => setActiveSection("character")}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Create Character
              </Button>
              <Button
                variant={activeSection === "video" ? "default" : "outline"}
                onClick={() => setActiveSection("video")}
                className="flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Create Video
              </Button>
            </div>

            {/* Create Character Section */}
            {activeSection === "character" && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Your AI Character</CardTitle>
                  <CardDescription>Design your AI influencer's personality and appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="influencer-name">Name of the influencer</Label>
                    <Input id="influencer-name" placeholder="Enter influencer name..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="influencer-bio">Bio of the influencer</Label>
                    <Textarea 
                      id="influencer-bio"
                      placeholder="Enter the influencer's bio..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference-image">Reference image</Label>
                    <Input id="reference-image" type="file" accept="image/*" />
                  </div>

                  <Button className="w-full">Generate Character</Button>
                </CardContent>
              </Card>
            )}

            {/* Create Video Section */}
            {activeSection === "video" && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Video Content</CardTitle>
                  <CardDescription>Generate AI influencer videos with your character</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Character</label>
                    <Input placeholder="Choose your AI character..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Video Topic</label>
                    <Input placeholder="What should the video be about?" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Script/Content</label>
                    <Textarea 
                      placeholder="Enter the script or let AI generate it..."
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Video Style</label>
                    <Input placeholder="Talking head, vlog, tutorial, etc." />
                  </div>

                  <Button className="w-full">Generate Video</Button>
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
