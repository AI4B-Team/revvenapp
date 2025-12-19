import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const platforms = [
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, maxLength: 280 },
  { id: 'instagram', name: 'Instagram', icon: Instagram, maxLength: 2200 },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, maxLength: 3000 },
  { id: 'facebook', name: 'Facebook', icon: Facebook, maxLength: 63206 },
];

const SocialPosts = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [style, setStyle] = useState('engaging');
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    const selectedPlatform = platforms.find(p => p.id === platform);
    setIsGenerating(true);
    
    try {
      const prompt = `Create 3 different ${style} social media posts for ${selectedPlatform?.name} about "${topic}".
      Maximum length: ${selectedPlatform?.maxLength} characters each.
      Include relevant hashtags and emojis where appropriate.
      Format each post clearly numbered 1, 2, 3.`;

      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: { 
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'You are a social media expert. Create engaging, platform-optimized posts.'
        }
      });

      if (error) throw error;
      
      const content = data.response || data.content || '';
      const posts = content.split(/\d+\.\s+/).filter((p: string) => p.trim());
      setGeneratedPosts(posts.slice(0, 3));
      toast.success('Posts generated!');
    } catch (error) {
      console.error('Error generating posts:', error);
      toast.error('Failed to generate posts');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const PlatformIcon = platforms.find(p => p.id === platform)?.icon || Twitter;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/create')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Create
            </Button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-tool-blue flex items-center justify-center text-2xl">
                📱
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Social Posts</h1>
                <p className="text-muted-foreground">Create engaging social media content</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Topic *</Label>
                    <Input
                      placeholder="e.g., New product launch, Industry tips, Behind the scenes"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <p.icon className="w-4 h-4" />
                              {p.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engaging">Engaging</SelectItem>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Posts'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlatformIcon className="w-5 h-5" />
                    Generated Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedPosts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      Your generated posts will appear here...
                    </div>
                  ) : (
                    generatedPosts.map((post, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg relative group">
                        <p className="text-sm whitespace-pre-wrap pr-8">{post.trim()}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(post.trim())}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialPosts;
