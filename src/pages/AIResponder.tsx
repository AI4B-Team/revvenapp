import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  MessageSquare, 
  Zap, 
  Settings, 
  Play, 
  Trash2, 
  Edit, 
  Copy,
  Bot,
  Send,
  Sparkles,
  CheckCircle,
  Clock,
  Tag,
  ArrowLeft,
  Instagram,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AutoResponder {
  id: string;
  name: string;
  triggerKeywords: string[];
  responseTemplate: string;
  isActive: boolean;
  responseCount: number;
  lastTriggered?: string;
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
  platform: 'email' | 'social' | 'chat' | 'all';
}

const defaultResponders: AutoResponder[] = [
  {
    id: '1',
    name: 'Customer Support Greeting',
    triggerKeywords: ['hello', 'hi', 'help', 'support'],
    responseTemplate: 'Hello! Thank you for reaching out. How can I assist you today? Our team is here to help with any questions or concerns you may have.',
    isActive: true,
    responseCount: 156,
    lastTriggered: '2 hours ago',
    tone: 'friendly',
    platform: 'all'
  },
  {
    id: '2',
    name: 'Pricing Inquiry',
    triggerKeywords: ['price', 'pricing', 'cost', 'how much'],
    responseTemplate: 'Thank you for your interest in our pricing! Our plans start at $9.99/month. Would you like me to send you detailed information about our packages?',
    isActive: true,
    responseCount: 89,
    lastTriggered: '5 hours ago',
    tone: 'professional',
    platform: 'email'
  },
  {
    id: '3',
    name: 'Out of Office',
    triggerKeywords: ['urgent', 'immediate', 'asap'],
    responseTemplate: 'Thank you for your message. I am currently out of the office and will respond to your inquiry as soon as possible. For urgent matters, please contact our support team.',
    isActive: false,
    responseCount: 23,
    lastTriggered: '3 days ago',
    tone: 'formal',
    platform: 'email'
  }
];

interface InstagramAccount {
  id: string;
  instagram_id: string;
  instagram_username: string;
  profile_picture_url: string | null;
  token_expires_at: string | null;
}

const AIResponder = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [responders, setResponders] = useState<AutoResponder[]>(defaultResponders);
  const [activeTab, setActiveTab] = useState('responders');
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([]);
  
  // New responder form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newResponder, setNewResponder] = useState({
    name: '',
    triggerKeywords: '',
    responseTemplate: '',
    tone: 'friendly' as const,
    platform: 'all' as const
  });

  useEffect(() => {
    loadInstagramAccounts();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'INSTAGRAM_AUTH_SUCCESS') {
        loadInstagramAccounts();
        toast.success('Instagram connected successfully!');
      }
      if (event.data?.type === 'INSTAGRAM_AUTH_ERROR') {
        toast.error(event.data?.error || 'Failed to connect Instagram');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadInstagramAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('instagram_accounts')
      .select('id, instagram_id, instagram_username, profile_picture_url, token_expires_at')
      .eq('user_id', user.id);

    if (!error && data) {
      setInstagramAccounts(data);
    }
  };

  const handleConnectInstagram = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = sessionData.session?.user.id;
      if (!userId) {
        toast.error('Please log in to connect Instagram');
        return;
      }

      const { data, error } = await supabase.functions.invoke('facebook-oauth', {
        body: { action: 'get_instagram_auth_url', userId },
      });

      if (error) throw error;
      if (!data?.auth_url) throw new Error('No auth URL returned');

      window.open(data.auth_url, 'Instagram Login', 'width=600,height=700');
    } catch (err) {
      console.error('Error connecting Instagram:', err);
      toast.error('Failed to connect Instagram');
    }
  };

  const handleDisconnectInstagram = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('instagram_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      setInstagramAccounts(prev => prev.filter(a => a.id !== accountId));
      toast.success('Instagram disconnected');
    } catch (err) {
      console.error('Error disconnecting Instagram:', err);
      toast.error('Failed to disconnect Instagram');
    }
  };

  const handleToggleResponder = (id: string) => {
    setResponders(prev => 
      prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    );
    toast.success('Responder status updated');
  };

  const handleDeleteResponder = (id: string) => {
    setResponders(prev => prev.filter(r => r.id !== id));
    toast.success('Responder deleted');
  };

  const handleDuplicateResponder = (responder: AutoResponder) => {
    const newId = Date.now().toString();
    const duplicate = {
      ...responder,
      id: newId,
      name: `${responder.name} (Copy)`,
      responseCount: 0,
      lastTriggered: undefined
    };
    setResponders(prev => [...prev, duplicate]);
    toast.success('Responder duplicated');
  };

  const handleCreateResponder = () => {
    if (!newResponder.name || !newResponder.triggerKeywords || !newResponder.responseTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const responder: AutoResponder = {
      id: Date.now().toString(),
      name: newResponder.name,
      triggerKeywords: newResponder.triggerKeywords.split(',').map(k => k.trim().toLowerCase()),
      responseTemplate: newResponder.responseTemplate,
      isActive: true,
      responseCount: 0,
      tone: newResponder.tone,
      platform: newResponder.platform
    };

    setResponders(prev => [...prev, responder]);
    setNewResponder({ name: '', triggerKeywords: '', responseTemplate: '', tone: 'friendly', platform: 'all' });
    setShowNewForm(false);
    toast.success('New responder created!');
  };

  const handleTestResponse = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Find matching responder
      const matchingResponder = responders.find(r => 
        r.isActive && r.triggerKeywords.some(keyword => 
          testMessage.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (matchingResponder) {
        // Use AI to personalize the response
        const { data, error } = await supabase.functions.invoke('aiva-chat', {
          body: {
            messages: [
              {
                role: 'user',
                content: `Given this incoming message: "${testMessage}"
                
And this response template: "${matchingResponder.responseTemplate}"

Please generate a personalized response based on the template that directly addresses the user's message. Keep the same tone (${matchingResponder.tone}) and make it feel natural and helpful. Only output the response, nothing else.`
              }
            ],
            context: '/ai-responder',
            stream: false
          }
        });

        if (error) throw error;
        setTestResponse(data.message || matchingResponder.responseTemplate);
      } else {
        // Generate a general AI response
        const { data, error } = await supabase.functions.invoke('aiva-chat', {
          body: {
            messages: [
              {
                role: 'user',
                content: `Generate a helpful, friendly auto-response for this message: "${testMessage}". Keep it concise and professional.`
              }
            ],
            context: '/ai-responder',
            stream: false
          }
        });

        if (error) throw error;
        setTestResponse(data.message || 'Thank you for your message. We will get back to you shortly.');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setTestResponse('Thank you for your message. Our team will respond shortly.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!newResponder.responseTemplate.trim()) {
      toast.error('Please enter a response template first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('aiva-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Improve this auto-response template to be more engaging and professional while keeping the same meaning. Tone should be ${newResponder.tone}:

"${newResponder.responseTemplate}"

Only output the improved response, nothing else.`
            }
          ],
          context: '/ai-responder',
          stream: false
        }
      });

      if (error) throw error;
      
      if (data.message) {
        setNewResponder(prev => ({ ...prev, responseTemplate: data.message }));
        toast.success('Response enhanced with AI!');
      }
    } catch (error) {
      console.error('Error enhancing response:', error);
      toast.error('Failed to enhance response');
    } finally {
      setIsGenerating(false);
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-primary/20 text-primary';
      case 'friendly': return 'bg-accent/20 text-accent-foreground';
      case 'casual': return 'bg-secondary text-secondary-foreground';
      case 'formal': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'email': return 'bg-destructive/20 text-destructive';
      case 'social': return 'bg-primary/20 text-primary';
      case 'chat': return 'bg-accent/20 text-accent-foreground';
      case 'all': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapseChange={setSidebarCollapsed} 
      />
      
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/create')}
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bot className="text-primary" size={28} />
                  AI Responder
                </h1>
                <p className="text-muted-foreground">Create intelligent auto-responses for your messages</p>
              </div>
            </div>
            
            <Button onClick={() => setShowNewForm(true)} className="gap-2">
              <Plus size={16} />
              New Responder
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Responders</p>
                    <p className="text-2xl font-bold">{responders.filter(r => r.isActive).length}</p>
                  </div>
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <CheckCircle className="text-accent-foreground" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Responses</p>
                    <p className="text-2xl font-bold">{responders.reduce((acc, r) => acc + r.responseCount, 0)}</p>
                  </div>
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <MessageSquare className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Keywords Tracked</p>
                    <p className="text-2xl font-bold">{responders.reduce((acc, r) => acc + r.triggerKeywords.length, 0)}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <Tag className="text-secondary-foreground" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Avg Response Time</p>
                    <p className="text-2xl font-bold">&lt;1s</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Zap className="text-foreground" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="responders" className="gap-2">
                <MessageSquare size={16} />
                Responders
              </TabsTrigger>
              <TabsTrigger value="test" className="gap-2">
                <Play size={16} />
                Test
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings size={16} />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Responders Tab */}
            <TabsContent value="responders" className="space-y-4">
              {/* New Responder Form */}
              {showNewForm && (
                <Card className="bg-card border-border border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="text-primary" size={20} />
                      Create New Responder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Responder Name</Label>
                        <Input 
                          placeholder="e.g., Customer Support Greeting"
                          value={newResponder.name}
                          onChange={(e) => setNewResponder(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trigger Keywords (comma separated)</Label>
                        <Input 
                          placeholder="e.g., hello, hi, help, support"
                          value={newResponder.triggerKeywords}
                          onChange={(e) => setNewResponder(prev => ({ ...prev, triggerKeywords: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <select 
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
                          value={newResponder.tone}
                          onChange={(e) => setNewResponder(prev => ({ ...prev, tone: e.target.value as any }))}
                        >
                          <option value="friendly">Friendly</option>
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="formal">Formal</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <select 
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
                          value={newResponder.platform}
                          onChange={(e) => setNewResponder(prev => ({ ...prev, platform: e.target.value as any }))}
                        >
                          <option value="all">All Platforms</option>
                          <option value="email">Email</option>
                          <option value="social">Social Media</option>
                          <option value="chat">Live Chat</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Response Template</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleEnhanceWithAI}
                          disabled={isGenerating}
                          className="gap-1 text-primary"
                        >
                          <Sparkles size={14} />
                          Enhance with AI
                        </Button>
                      </div>
                      <Textarea 
                        placeholder="Enter your response template..."
                        value={newResponder.responseTemplate}
                        onChange={(e) => setNewResponder(prev => ({ ...prev, responseTemplate: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancel</Button>
                      <Button onClick={handleCreateResponder}>Create Responder</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Responders List */}
              <div className="grid gap-4">
                {responders.map((responder) => (
                  <Card key={responder.id} className={`bg-card border-border ${!responder.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{responder.name}</h3>
                            <Badge className={getToneColor(responder.tone)}>{responder.tone}</Badge>
                            <Badge className={getPlatformColor(responder.platform)}>{responder.platform}</Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {responder.triggerKeywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {responder.responseTemplate}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare size={12} />
                              {responder.responseCount} responses
                            </span>
                            {responder.lastTriggered && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                Last triggered: {responder.lastTriggered}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 mr-4">
                            <Switch 
                              checked={responder.isActive}
                              onCheckedChange={() => handleToggleResponder(responder.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {responder.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDuplicateResponder(responder)}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteResponder(responder.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Test Tab */}
            <TabsContent value="test" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Test Your Responders</CardTitle>
                  <CardDescription>
                    Enter a test message to see how your AI responders will react
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Message</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Type a message to test... e.g., 'Hello, I need help with pricing'"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTestResponse()}
                      />
                      <Button 
                        onClick={handleTestResponse} 
                        disabled={isGenerating}
                        className="gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Test
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {testResponse && (
                    <div className="space-y-2">
                      <Label>AI Response</Label>
                      <div className="p-4 bg-secondary rounded-lg border border-border">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            <Bot className="text-primary" size={20} />
                          </div>
                          <p className="text-foreground flex-1">{testResponse}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Responder Settings</CardTitle>
                  <CardDescription>
                    Configure global settings for your AI responders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">AI Enhancement</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically enhance responses with AI for better engagement
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Learn from Responses</p>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to learn from successful responses and improve over time
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Response Delay</p>
                      <p className="text-sm text-muted-foreground">
                        Add a slight delay to responses to feel more natural
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        Track response performance and engagement metrics
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">Integrations</p>
                        <p className="text-sm text-muted-foreground">
                          Connect your channels so AI Responder can manage conversations.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/account?tab=social')}
                      >
                        Manage Connections
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Instagram - Show connected or connect button */}
                      {instagramAccounts.length > 0 ? (
                        instagramAccounts.map(account => (
                          <div key={account.id} className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                            <div className="flex items-center gap-3">
                              {account.profile_picture_url ? (
                                <img 
                                  src={account.profile_picture_url} 
                                  alt={account.instagram_username}
                                  className="h-10 w-10 rounded-lg object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center ${account.profile_picture_url ? 'hidden' : ''}`}>
                                <Instagram className="text-white" size={18} />
                              </div>
                              <div>
                                <p className="font-medium">@{account.instagram_username}</p>
                                <p className="text-xs text-primary">Connected</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-primary text-primary">
                                <CheckCircle size={12} className="mr-1" />
                                Active
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={handleConnectInstagram}
                                title="Reconnect"
                              >
                                <Zap size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDisconnectInstagram(account.id)}
                                className="text-destructive hover:text-destructive"
                                title="Disconnect"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center">
                              <Instagram className="text-foreground" size={18} />
                            </div>
                            <div>
                              <p className="font-medium">Instagram</p>
                              <p className="text-xs text-muted-foreground">Connect DMs</p>
                            </div>
                          </div>
                          <Button onClick={handleConnectInstagram}>Connect</Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center">
                            <Facebook className="text-foreground" size={18} />
                          </div>
                          <div>
                            <p className="font-medium">Facebook</p>
                            <p className="text-xs text-muted-foreground">Connect Pages + Messenger</p>
                          </div>
                        </div>
                        <Button onClick={() => navigate('/account?tab=social')}>Connect</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AIResponder;
