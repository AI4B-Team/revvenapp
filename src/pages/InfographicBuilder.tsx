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
import ImageModelSelector, { ImageModelValue } from '@/components/design/ImageModelSelector';

const InfographicBuilder = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [dataPoints, setDataPoints] = useState('');
  const [infographicType, setInfographicType] = useState('statistical');
  const [style, setStyle] = useState('modern');
  const [model, setModel] = useState<ImageModelValue>('auto');
  const [generatedInfographic, setGeneratedInfographic] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a ${style} ${infographicType} infographic about "${topic}". ${dataPoints ? `Key data points: ${dataPoints}` : ''} Professional infographic design with clear data visualization, icons, and engaging layout.`;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, model, aspectRatio: '9:16' }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedInfographic(data.imageUrl);
        toast.success('Infographic generated!');
      }
    } catch (error) {
      console.error('Error generating infographic:', error);
      toast.error('Failed to generate infographic');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedInfographic) return;
    const a = document.createElement('a');
    a.href = generatedInfographic;
    a.download = `infographic-${topic.replace(/\s+/g, '-')}.png`;
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
              <div className="w-12 h-12 rounded-xl bg-tool-pink flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Infographic Builder</h1>
                <p className="text-muted-foreground">Create informative visual infographics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Infographic Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="What is this infographic about?"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataPoints">Key Data Points (Optional)</Label>
                    <Textarea
                      id="dataPoints"
                      placeholder="Enter statistics, facts, or key points to include..."
                      value={dataPoints}
                      onChange={(e) => setDataPoints(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infographicType">Type</Label>
                    <Select value={infographicType} onValueChange={setInfographicType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="statistical">Statistical</SelectItem>
                        <SelectItem value="timeline">Timeline</SelectItem>
                        <SelectItem value="comparison">Comparison</SelectItem>
                        <SelectItem value="process">Process/How-To</SelectItem>
                        <SelectItem value="geographic">Geographic</SelectItem>
                        <SelectItem value="hierarchical">Hierarchical</SelectItem>
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
                        <SelectItem value="modern">Modern & Flat</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="colorful">Colorful & Vibrant</SelectItem>
                        <SelectItem value="minimal">Minimalist</SelectItem>
                        <SelectItem value="illustrative">Illustrated</SelectItem>
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
                        Generate Infographic
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Infographic
                    {generatedInfographic && (
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedInfographic ? (
                    <div className="rounded-lg overflow-hidden bg-muted max-h-[600px] overflow-y-auto">
                      <img 
                        src={generatedInfographic} 
                        alt="Generated infographic" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[9/16] max-h-[500px] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      Your infographic will appear here
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

export default InfographicBuilder;
