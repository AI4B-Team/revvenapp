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
import { ArrowLeft, Sparkles, Download, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

const PresentationMaker = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('corporate');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleGenerateSlides = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate slide backgrounds
      const slidePromises = ['Title', 'Introduction', 'Main Point 1', 'Main Point 2', 'Conclusion'].map(async (slideType, index) => {
        const prompt = `Create a ${style} presentation slide background for "${topic}" - ${slideType} slide. Professional, clean design with subtle graphics, suitable for business presentation.`;
        
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: { prompt, model: 'flux-kontext-pro', aspectRatio: '16:9' }
        });

        if (error) throw error;
        
        return {
          id: `slide-${index}`,
          title: slideType,
          content: slideType === 'Title' ? topic : `Content for ${slideType}`,
          imageUrl: data?.imageUrl
        };
      });

      const generatedSlides = await Promise.all(slidePromises);
      setSlides(generatedSlides);
      setPresentationTitle(topic);
      toast.success('Presentation slides generated!');
    } catch (error) {
      console.error('Error generating slides:', error);
      toast.error('Failed to generate slides');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide',
      content: 'Add your content here'
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
  };

  const handleRemoveSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
    if (activeSlide >= slides.length - 1) {
      setActiveSlide(Math.max(0, slides.length - 2));
    }
  };

  const handleDownloadAll = () => {
    slides.forEach((slide, index) => {
      if (slide.imageUrl) {
        const a = document.createElement('a');
        a.href = slide.imageUrl;
        a.download = `slide-${index + 1}-${slide.title.replace(/\s+/g, '-')}.png`;
        a.click();
      }
    });
    toast.success('All slides downloaded!');
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
          <div className="max-w-7xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/create')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Create
            </Button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-tool-yellow flex items-center justify-center text-2xl">
                📺
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Presentation Maker</h1>
                <p className="text-muted-foreground">Design professional presentations with AI</p>
              </div>
            </div>

            {slides.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Create New Presentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Presentation Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="What is your presentation about?"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="modern">Modern & Creative</SelectItem>
                        <SelectItem value="minimal">Minimalist</SelectItem>
                        <SelectItem value="bold">Bold & Dynamic</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerateSlides} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Slides...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Presentation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Slide List */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Slides
                      <Button variant="ghost" size="sm" onClick={handleAddSlide}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {slides.map((slide, index) => (
                      <div 
                        key={slide.id}
                        className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 group ${activeSlide === index ? 'bg-primary/10 border border-primary' : 'bg-muted hover:bg-muted/80'}`}
                        onClick={() => setActiveSlide(index)}
                      >
                        <div className="w-12 h-8 rounded bg-background overflow-hidden flex-shrink-0">
                          {slide.imageUrl ? (
                            <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted-foreground/20" />
                          )}
                        </div>
                        <span className="text-xs truncate flex-1">{slide.title}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); handleRemoveSlide(index); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Slide Preview */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {presentationTitle || 'Presentation'}
                      <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {slides[activeSlide] && (
                      <div className="space-y-4">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                          {slides[activeSlide].imageUrl ? (
                            <img 
                              src={slides[activeSlide].imageUrl} 
                              alt={slides[activeSlide].title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No image generated
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">{slides[activeSlide].title}</h3>
                            <p className="text-sm opacity-80">{slides[activeSlide].content}</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Slide {activeSlide + 1} of {slides.length}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={activeSlide === 0}
                              onClick={() => setActiveSlide(activeSlide - 1)}
                            >
                              Previous
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={activeSlide === slides.length - 1}
                              onClick={() => setActiveSlide(activeSlide + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
      <AIVASidePanel isOpen={isAIVAPanelOpen} onClose={() => setIsAIVAPanelOpen(false)} />
    </div>
  );
};

export default PresentationMaker;
