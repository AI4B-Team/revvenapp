import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AIVASidePanel from '@/components/dashboard/AIVASidePanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PosterDesigner = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterType, setPosterType] = useState('movie');
  const [style, setStyle] = useState('cinematic');
  const [orientation, setOrientation] = useState('portrait');
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const orientationRatios: Record<string, string> = {
    portrait: '2:3',
    landscape: '3:2',
    square: '1:1'
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a ${style} ${posterType} poster for "${title}". ${description ? `Description: ${description}` : ''} High-quality, professional poster design with dramatic composition and stunning visuals.`;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, model: 'flux-kontext-pro', aspectRatio: orientationRatios[orientation] }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedPoster(data.imageUrl);
        toast.success('Poster generated!');
      }
    } catch (error) {
      console.error('Error generating poster:', error);
      toast.error('Failed to generate poster');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPoster) return;
    const a = document.createElement('a');
    a.href = generatedPoster;
    a.download = `poster-${title.replace(/\s+/g, '-')}.png`;
    a.click();
    toast.success('Downloaded!');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        onCollapseChange={setIsSidebarCollapsed}
        onAIVAPanelToggle={() => setIsAIVAPanelOpen(!isAIVAPanelOpen)}
        isAIVAPanelOpen={isAIVAPanelOpen}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} ${isAIVAPanelOpen ? 'lg:pl-[400px]' : ''}`}>
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
                🎭
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Poster Designer</h1>
                <p className="text-muted-foreground">Create stunning custom posters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Poster Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Poster Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your poster title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the scene, mood, elements..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="posterType">Poster Type</Label>
                    <Select value={posterType} onValueChange={setPosterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="movie">Movie Poster</SelectItem>
                        <SelectItem value="concert">Concert Poster</SelectItem>
                        <SelectItem value="art">Art Print</SelectItem>
                        <SelectItem value="motivational">Motivational</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="vintage">Vintage/Retro</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="photorealistic">Photorealistic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select value={orientation} onValueChange={setOrientation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait (2:3)</SelectItem>
                        <SelectItem value="landscape">Landscape (3:2)</SelectItem>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Poster
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Poster
                    {generatedPoster && (
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedPoster ? (
                    <div className="rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={generatedPoster} 
                        alt="Generated poster" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[2/3] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      Your poster will appear here
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <AIVASidePanel isOpen={isAIVAPanelOpen} onClose={() => setIsAIVAPanelOpen(false)} />
    </div>
  );
};

export default PosterDesigner;
