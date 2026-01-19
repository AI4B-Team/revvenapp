import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AIVASidePanel from '@/components/dashboard/AIVASidePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ImageModelSelector, { ImageModelValue } from '@/components/design/ImageModelSelector';

const LogoDesigner = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState('modern');
  const [colorScheme, setColorScheme] = useState('vibrant');
  const [model, setModel] = useState<ImageModelValue>('auto');
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!brandName.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a ${style} logo for "${brandName}"${industry ? ` in the ${industry} industry` : ''}. Color scheme: ${colorScheme}. Professional, clean, memorable design.`;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, model, aspectRatio: '1:1' }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedLogo(data.imageUrl);
        toast.success('Logo generated!');
      }
    } catch (error) {
      console.error('Error generating logo:', error);
      toast.error('Failed to generate logo');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedLogo) return;
    const a = document.createElement('a');
    a.href = generatedLogo;
    a.download = `logo-${brandName.replace(/\s+/g, '-')}.png`;
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
                🎨
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Logo Designer</h1>
                <p className="text-muted-foreground">Create professional brand logos with AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logo Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                      id="brandName"
                      placeholder="Enter your brand name"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry (Optional)</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Technology, Fashion, Food"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Logo Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern & Minimalist</SelectItem>
                        <SelectItem value="classic">Classic & Elegant</SelectItem>
                        <SelectItem value="playful">Playful & Fun</SelectItem>
                        <SelectItem value="bold">Bold & Dynamic</SelectItem>
                        <SelectItem value="vintage">Vintage & Retro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colorScheme">Color Scheme</Label>
                    <Select value={colorScheme} onValueChange={setColorScheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vibrant">Vibrant & Colorful</SelectItem>
                        <SelectItem value="monochrome">Monochrome</SelectItem>
                        <SelectItem value="pastel">Soft & Pastel</SelectItem>
                        <SelectItem value="dark">Dark & Sophisticated</SelectItem>
                        <SelectItem value="warm">Warm Tones</SelectItem>
                        <SelectItem value="cool">Cool Tones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <ImageModelSelector value={model} onChange={setModel} />

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
                        Generate Logo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Logo
                    {generatedLogo && (
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedLogo ? (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={generatedLogo} 
                        alt="Generated logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      Your logo will appear here
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

export default LogoDesigner;
