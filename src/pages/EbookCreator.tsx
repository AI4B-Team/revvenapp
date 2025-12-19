import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles, Download, Copy, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

const EbookCreator = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('non-fiction');
  const [chapters, setChapters] = useState<Chapter[]>([{ id: '1', title: '', content: '' }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingChapterId, setGeneratingChapterId] = useState<string | null>(null);

  const addChapter = () => {
    setChapters([...chapters, { id: Date.now().toString(), title: '', content: '' }]);
  };

  const removeChapter = (id: string) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter(ch => ch.id !== id));
    }
  };

  const updateChapter = (id: string, field: 'title' | 'content', value: string) => {
    setChapters(chapters.map(ch => ch.id === id ? { ...ch, [field]: value } : ch));
  };

  const generateChapterContent = async (chapterId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter?.title || !title) {
      toast.error('Please enter ebook title and chapter title first');
      return;
    }

    setGeneratingChapterId(chapterId);
    try {
      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Write a detailed chapter for an ebook. 
Ebook Title: "${title}"
Ebook Description: "${description}"
Genre: ${genre}
Chapter Title: "${chapter.title}"

Write engaging, well-structured content for this chapter. Include relevant examples, insights, and maintain a consistent tone throughout. The chapter should be comprehensive and valuable to readers.`
          }]
        }
      });

      if (error) throw error;
      
      const content = data.response || data.content || '';
      updateChapter(chapterId, 'content', content);
      toast.success('Chapter content generated!');
    } catch (error) {
      console.error('Error generating chapter:', error);
      toast.error('Failed to generate chapter content');
    } finally {
      setGeneratingChapterId(null);
    }
  };

  const generateOutline = async () => {
    if (!title) {
      toast.error('Please enter an ebook title first');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Create a detailed chapter outline for an ebook.
Title: "${title}"
Description: "${description}"
Genre: ${genre}

Generate 5-8 chapter titles that would make a comprehensive and engaging ebook. Return ONLY the chapter titles, one per line, without numbers or bullet points.`
          }]
        }
      });

      if (error) throw error;
      
      const content = data.response || data.content || '';
      const chapterTitles = content.split('\n').filter((line: string) => line.trim());
      
      setChapters(chapterTitles.map((title: string, index: number) => ({
        id: (index + 1).toString(),
        title: title.trim(),
        content: ''
      })));
      
      toast.success('Outline generated! Now generate content for each chapter.');
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error('Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAllContent = () => {
    const fullContent = `# ${title}\n\n${description}\n\n${chapters.map((ch, i) => 
      `## Chapter ${i + 1}: ${ch.title}\n\n${ch.content}`
    ).join('\n\n---\n\n')}`;
    
    navigator.clipboard.writeText(fullContent);
    toast.success('Ebook content copied to clipboard!');
  };

  const downloadAsMarkdown = () => {
    const fullContent = `# ${title}\n\n${description}\n\n${chapters.map((ch, i) => 
      `## Chapter ${i + 1}: ${ch.title}\n\n${ch.content}`
    ).join('\n\n---\n\n')}`;
    
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'ebook'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Ebook downloaded as Markdown!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/create')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-tool-purple flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ebook Creator</h1>
              <p className="text-muted-foreground">Create complete ebooks with AI assistance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Ebook Details</h2>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter ebook title..."
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your ebook..."
                  className="bg-background min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="self-help">Self-Help</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="biography">Biography</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateOutline} 
                disabled={isGenerating || !title}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Outline'}
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-foreground">Export</h2>
              <Button variant="outline" onClick={copyAllContent} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy All Content
              </Button>
              <Button variant="outline" onClick={downloadAsMarkdown} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download as Markdown
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Chapters</h2>
              <Button variant="outline" size="sm" onClick={addChapter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </div>

            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Chapter {index + 1}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateChapterContent(chapter.id)}
                      disabled={generatingChapterId === chapter.id}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {generatingChapterId === chapter.id ? 'Generating...' : 'Generate'}
                    </Button>
                    {chapters.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChapter(chapter.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>

                <Input
                  value={chapter.title}
                  onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                  placeholder="Chapter title..."
                  className="bg-background font-medium"
                />

                <Textarea
                  value={chapter.content}
                  onChange={(e) => updateChapter(chapter.id, 'content', e.target.value)}
                  placeholder="Chapter content will appear here..."
                  className="bg-background min-h-[200px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookCreator;
