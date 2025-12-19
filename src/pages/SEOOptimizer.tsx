import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Copy, RefreshCw, Search, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SEOResult {
  title: string;
  metaDescription: string;
  keywords: string[];
  headings: string[];
  improvements: string[];
}

const SEOOptimizer = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [content, setContent] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to optimize');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze and optimize this content for SEO${targetKeyword ? ` targeting the keyword "${targetKeyword}"` : ''}.
      
      Content:
      ${content}
      
      Provide:
      1. TITLE: An SEO-optimized title (50-60 chars)
      2. META_DESCRIPTION: A compelling meta description (150-160 chars)
      3. KEYWORDS: 5-8 relevant keywords (comma-separated)
      4. HEADINGS: 3-5 suggested H2 headings
      5. IMPROVEMENTS: 5 specific suggestions to improve SEO
      
      Format each section clearly labeled.`;

      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: { 
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'You are an SEO expert. Provide actionable optimization recommendations.'
        }
      });

      if (error) throw error;
      
      const response = data.response || data.content || '';
      
      const titleMatch = response.match(/TITLE:\s*(.+?)(?=META_DESCRIPTION:|$)/is);
      const metaMatch = response.match(/META_DESCRIPTION:\s*(.+?)(?=KEYWORDS:|$)/is);
      const keywordsMatch = response.match(/KEYWORDS:\s*(.+?)(?=HEADINGS:|$)/is);
      const headingsMatch = response.match(/HEADINGS:\s*(.+?)(?=IMPROVEMENTS:|$)/is);
      const improvementsMatch = response.match(/IMPROVEMENTS:\s*(.+?)$/is);
      
      setSeoResult({
        title: titleMatch ? titleMatch[1].trim() : '',
        metaDescription: metaMatch ? metaMatch[1].trim() : '',
        keywords: keywordsMatch ? keywordsMatch[1].split(',').map((k: string) => k.trim()).filter(Boolean) : [],
        headings: headingsMatch ? headingsMatch[1].split(/\n|•|-/).map((h: string) => h.trim()).filter(Boolean) : [],
        improvements: improvementsMatch ? improvementsMatch[1].split(/\d+\.|•|-/).map((i: string) => i.trim()).filter(Boolean) : []
      });
      
      toast.success('SEO analysis complete!');
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
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
              <div className="w-12 h-12 rounded-xl bg-tool-green flex items-center justify-center text-2xl">
                🔍
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SEO Optimizer</h1>
                <p className="text-muted-foreground">Optimize your content for search engines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Keyword (optional)</Label>
                    <Input
                      placeholder="e.g., digital marketing tips"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content to Optimize *</Label>
                    <Textarea
                      placeholder="Paste your blog post, article, or page content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[300px]"
                    />
                  </div>

                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze & Optimize'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    SEO Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!seoResult ? (
                    <div className="text-center text-muted-foreground py-12">
                      Your SEO analysis will appear here...
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Optimized Title</Label>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(seoResult.title)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-sm">{seoResult.title}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Meta Description</Label>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(seoResult.metaDescription)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-sm">{seoResult.metaDescription}</div>
                      </div>

                      <div className="space-y-2">
                        <Label>Keywords</Label>
                        <div className="flex flex-wrap gap-2">
                          {seoResult.keywords.map((keyword, i) => (
                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Suggested Headings</Label>
                        <div className="space-y-1">
                          {seoResult.headings.map((heading, i) => (
                            <div key={i} className="p-2 bg-muted rounded text-sm flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">H2</span>
                              {heading}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Improvements</Label>
                        <div className="space-y-2">
                          {seoResult.improvements.map((improvement, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
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

export default SEOOptimizer;
