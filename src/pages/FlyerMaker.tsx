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

const FlyerMaker = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [details, setDetails] = useState('');
  const [flyerType, setFlyerType] = useState('event');
  const [style, setStyle] = useState('modern');
  const [model, setModel] = useState<ImageModelValue>('auto');
  const [generatedFlyer, setGeneratedFlyer] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!eventName.trim()) {
      toast.error('Please enter an event/product name');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a ${style} ${flyerType} flyer for "${eventName}". ${details ? `Details: ${details}` : ''} Professional marketing flyer with compelling design, clear hierarchy, and engaging visuals.`;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, model, aspectRatio: '3:4' }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedFlyer(data.imageUrl);
        toast.success('Flyer generated!');
      }
    } catch (error) {
      console.error('Error generating flyer:', error);
      toast.error('Failed to generate flyer');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedFlyer) return;
    const a = document.createElement('a');
    a.href = generatedFlyer;
    a.download = `flyer-${eventName.replace(/\s+/g, '-')}.png`;
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
              <div className="w-12 h-12 rounded-xl bg-tool-green flex items-center justify-center text-2xl">
                📄
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Flyer Maker</h1>
                <p className="text-muted-foreground">Create eye-catching marketing flyers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flyer Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event/Product Name *</Label>
                    <Input
                      id="eventName"
                      placeholder="Enter event or product name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">Details (Optional)</Label>
                    <Textarea
                      id="details"
                      placeholder="Date, location, pricing, features..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flyerType">Flyer Type</Label>
                    <Select value={flyerType} onValueChange={setFlyerType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Event Flyer</SelectItem>
                        <SelectItem value="sale">Sale/Promotion</SelectItem>
                        <SelectItem value="product">Product Launch</SelectItem>
                        <SelectItem value="service">Service Offer</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
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
                        <SelectItem value="modern">Modern & Clean</SelectItem>
                        <SelectItem value="bold">Bold & Vibrant</SelectItem>
                        <SelectItem value="elegant">Elegant & Sophisticated</SelectItem>
                        <SelectItem value="playful">Playful & Fun</SelectItem>
                        <SelectItem value="corporate">Corporate & Professional</SelectItem>
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
                        Generate Flyer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Flyer
                    {generatedFlyer && (
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedFlyer ? (
                    <div className="rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={generatedFlyer} 
                        alt="Generated flyer" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      Your flyer will appear here
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

export default FlyerMaker;
