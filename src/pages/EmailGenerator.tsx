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
import { ArrowLeft, Sparkles, Copy, RefreshCw, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailGenerator = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [recipient, setRecipient] = useState('');
  const [emailType, setEmailType] = useState('marketing');
  const [tone, setTone] = useState('professional');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      toast.error('Please enter the email purpose');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Write a ${emailType} email with a ${tone} tone.
      Purpose: ${purpose}
      ${recipient ? `Recipient: ${recipient}` : ''}
      
      Provide:
      1. A compelling subject line
      2. The full email body with proper greeting and sign-off
      
      Format the response as:
      SUBJECT: [subject line]
      ---
      [email body]`;

      const { data, error } = await supabase.functions.invoke('editor-chat', {
        body: { 
          messages: [{ role: 'user', content: prompt }],
          stream: false
        }
      });

      if (error) throw error;
      
      const content = data.message || '';
      const parts = content.split('---');
      
      if (parts.length >= 2) {
        const subjectMatch = parts[0].match(/SUBJECT:\s*(.+)/i);
        setSubject(subjectMatch ? subjectMatch[1].trim() : '');
        setBody(parts.slice(1).join('---').trim());
      } else {
        setBody(content);
      }
      
      toast.success('Email generated!');
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error('Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleCopyAll = () => {
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmail);
    toast.success('Full email copied!');
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
              <div className="w-12 h-12 rounded-xl bg-tool-yellow flex items-center justify-center text-2xl">
                📧
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Email Generator</h1>
                <p className="text-muted-foreground">Write compelling email campaigns with AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Purpose / Goal *</Label>
                    <Input
                      placeholder="e.g., Promote our summer sale, Welcome new subscribers"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Recipient (optional)</Label>
                    <Input
                      placeholder="e.g., Newsletter subscribers, New customers"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email Type</Label>
                      <Select value={emailType} onValueChange={setEmailType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
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
                    {isGenerating ? 'Generating...' : 'Generate Email'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Generated Email
                  </CardTitle>
                  {body && (
                    <Button variant="outline" size="sm" onClick={handleCopyAll}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <div className="relative">
                      <Input
                        placeholder="Subject line will appear here..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                      {subject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7"
                          onClick={() => handleCopy(subject)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      placeholder="Email content will appear here..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="min-h-[300px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailGenerator;
