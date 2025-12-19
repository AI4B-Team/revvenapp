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
import { ArrowLeft, Sparkles, Copy, RefreshCw, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdCopyWriter = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [goal, setGoal] = useState('conversions');
  const [generatedAds, setGeneratedAds] = useState<{ headline: string; body: string; cta: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!product.trim()) {
      toast.error('Please enter a product/service');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create 3 different ad copy variations for ${platform} ads.
      Product/Service: ${product}
      ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
      Goal: ${goal}
      
      For each variation, provide:
      - HEADLINE: (attention-grabbing, max 40 chars)
      - BODY: (compelling copy, 90-125 chars)
      - CTA: (call to action button text)
      
      Format each ad clearly numbered 1, 2, 3.`;

      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: { 
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'You are an expert advertising copywriter. Create high-converting ad copy.'
        }
      });

      if (error) throw error;
      
      const content = data.response || data.content || '';
      const ads: { headline: string; body: string; cta: string }[] = [];
      
      const adBlocks = content.split(/\d+\.\s+/).filter((block: string) => block.trim());
      
      adBlocks.forEach((block: string) => {
        const headlineMatch = block.match(/HEADLINE:\s*(.+?)(?=BODY:|$)/is);
        const bodyMatch = block.match(/BODY:\s*(.+?)(?=CTA:|$)/is);
        const ctaMatch = block.match(/CTA:\s*(.+?)(?=\d+\.|$)/is);
        
        if (headlineMatch || bodyMatch) {
          ads.push({
            headline: headlineMatch ? headlineMatch[1].trim() : '',
            body: bodyMatch ? bodyMatch[1].trim() : '',
            cta: ctaMatch ? ctaMatch[1].trim() : 'Learn More'
          });
        }
      });
      
      setGeneratedAds(ads.slice(0, 3));
      toast.success('Ad copy generated!');
    } catch (error) {
      console.error('Error generating ads:', error);
      toast.error('Failed to generate ad copy');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (ad: { headline: string; body: string; cta: string }) => {
    const text = `Headline: ${ad.headline}\nBody: ${ad.body}\nCTA: ${ad.cta}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

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
              <div className="w-12 h-12 rounded-xl bg-tool-pink flex items-center justify-center text-2xl">
                💡
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Ad Copy Writer</h1>
                <p className="text-muted-foreground">Generate high-converting ad copy with AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ad Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product / Service *</Label>
                    <Input
                      placeholder="e.g., Online fitness coaching program"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Audience (optional)</Label>
                    <Input
                      placeholder="e.g., Busy professionals aged 25-45"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Goal</Label>
                      <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conversions">Conversions</SelectItem>
                          <SelectItem value="awareness">Brand Awareness</SelectItem>
                          <SelectItem value="traffic">Website Traffic</SelectItem>
                          <SelectItem value="leads">Lead Generation</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    {isGenerating ? 'Generating...' : 'Generate Ad Copy'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Generated Ads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedAds.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      Your generated ad copy will appear here...
                    </div>
                  ) : (
                    generatedAds.map((ad, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg relative group border">
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-muted-foreground">Headline</span>
                            <p className="font-semibold">{ad.headline}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Body</span>
                            <p className="text-sm">{ad.body}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-muted-foreground">CTA</span>
                              <p className="text-sm font-medium text-primary">{ad.cta}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopy(ad)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
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

export default AdCopyWriter;
