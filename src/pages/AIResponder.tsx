import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Zap, 
  Settings, 
  Play, 
  Trash2, 
  Bot,
  Send,
  CheckCircle,
  Tag,
  ArrowLeft,
  Instagram,
  Facebook,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import KeywordReplySection from '@/components/ai-responder/KeywordReplySection';
import AIAutoReplySection from '@/components/ai-responder/AIAutoReplySection';

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
  const [activeTab, setActiveTab] = useState('responders');
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([]);
  const [stats, setStats] = useState({
    activeKeywordReplies: 0,
    activeAIReplies: 0,
    totalResponses: 0,
    keywordsTracked: 0
  });

  useEffect(() => {
    loadInstagramAccounts();
    loadStats();
    
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

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [keywordRes, aiRes] = await Promise.all([
        supabase.from('keyword_replies').select('id, is_active, keywords, response_count').eq('user_id', user.id),
        supabase.from('ai_auto_replies').select('id, is_active, response_count').eq('user_id', user.id)
      ]);

      const keywordData = keywordRes.data || [];
      const aiData = aiRes.data || [];

      setStats({
        activeKeywordReplies: keywordData.filter(k => k.is_active).length,
        activeAIReplies: aiData.filter(a => a.is_active).length,
        totalResponses: 
          keywordData.reduce((acc, k) => acc + (k.response_count || 0), 0) +
          aiData.reduce((acc, a) => acc + (a.response_count || 0), 0),
        keywordsTracked: keywordData.reduce((acc, k) => acc + (k.keywords?.length || 0), 0)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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

  const handleTestResponse = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    setIsGenerating(true);
    setTestResponse('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to test responders');
        setIsGenerating(false);
        return;
      }

      // Check keyword replies first
      const { data: keywordReplies, error: keywordError } = await supabase
        .from('keyword_replies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (keywordError) {
        console.error('Error fetching keyword replies:', keywordError);
      }

      const matchingKeyword = keywordReplies?.find(r =>
        r.keywords.some((keyword: string) =>
          testMessage.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (matchingKeyword) {
        setTestResponse(`🏷️ Keyword Match: "${matchingKeyword.keywords.find((k: string) => testMessage.toLowerCase().includes(k.toLowerCase()))}"\n\n${matchingKeyword.response_message}`);
        toast.success('Matched keyword reply!');
        setIsGenerating(false);
        return;
      }

      // Check AI auto replies
      const { data: aiReplies, error: aiError } = await supabase
        .from('ai_auto_replies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (aiError) {
        console.error('Error fetching AI replies:', aiError);
        throw aiError;
      }

      if (aiReplies && aiReplies.length > 0) {
        const aiReply = aiReplies[0];
        
        // Get knowledge files if any
        const { data: knowledgeFiles } = await supabase
          .from('knowledge_files')
          .select('file_content')
          .eq('ai_auto_reply_id', aiReply.id);

        const knowledgeBase = [
          aiReply.knowledge_base || '',
          ...(knowledgeFiles?.map(f => f.file_content) || [])
        ].filter(Boolean).join('\n\n');

        const systemPrompt = knowledgeBase 
          ? `${aiReply.system_prompt}\n\nUse this knowledge to answer questions:\n${knowledgeBase.slice(0, 8000)}`
          : aiReply.system_prompt;

        console.log('Testing AI auto reply:', aiReply.name);

        const { data, error } = await supabase.functions.invoke('aiva-chat', {
          body: {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: testMessage }
            ],
            context: '/ai-responder',
            stream: false
          }
        });

        if (error) {
          console.error('AI chat error:', error);
          if (error.message?.includes('429')) {
            setTestResponse('⚠️ Rate limit exceeded. Please wait a moment and try again.');
          } else if (error.message?.includes('402')) {
            setTestResponse('⚠️ AI credits exhausted. Please add credits to continue.');
          } else {
            throw error;
          }
          return;
        }

        if (data?.error) {
          setTestResponse(`⚠️ ${data.error}`);
          return;
        }
        
        setTestResponse(`🤖 AI Response (${aiReply.name}):\n\n${data.message || 'Unable to generate response'}`);
        toast.success('AI response generated!');
      } else {
        setTestResponse('ℹ️ No active responders found.\n\nTo test responses:\n1. Create a Keyword Reply or AI Auto Reply\n2. Make sure it\'s enabled (toggle on)\n3. Try your test message again');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setTestResponse(`❌ Failed to generate response: ${errorMsg}\n\nPlease check your responder settings and try again.`);
      toast.error('Failed to generate response');
    } finally {
      setIsGenerating(false);
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
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { 
                label: 'Keyword Replies', 
                value: stats.activeKeywordReplies, 
                icon: Tag, 
                gradient: 'from-amber-500 to-orange-500',
                bgGradient: 'from-amber-500/10 to-orange-500/10'
              },
              { 
                label: 'AI Auto Replies', 
                value: stats.activeAIReplies, 
                icon: Sparkles, 
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-500/10 to-pink-500/10'
              },
              { 
                label: 'Total Responses', 
                value: stats.totalResponses, 
                icon: TrendingUp, 
                gradient: 'from-emerald-500 to-teal-500',
                bgGradient: 'from-emerald-500/10 to-teal-500/10'
              },
              { 
                label: 'Keywords Tracked', 
                value: stats.keywordsTracked, 
                icon: Activity, 
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-500/10 to-cyan-500/10'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <stat.icon className="text-white" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-secondary p-1 rounded-xl">
              <TabsTrigger 
                value="responders" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200"
              >
                <MessageSquare size={16} />
                Responders
              </TabsTrigger>
              <TabsTrigger 
                value="test" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200"
              >
                <Play size={16} />
                Test
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200"
              >
                <Settings size={16} />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Responders Tab */}
            <TabsContent value="responders" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <KeywordReplySection />
              </motion.div>
              <div className="border-t border-border pt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <AIAutoReplySection />
                </motion.div>
              </div>
            </TabsContent>

            {/* Test Tab */}
            <TabsContent value="test" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card border-border overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="text-primary" size={20} />
                      Test Your Responders
                    </CardTitle>
                    <CardDescription>
                      Enter a test message to see how your responders will react
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
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                        <Button 
                          onClick={handleTestResponse} 
                          disabled={isGenerating}
                          className="gap-2 min-w-[100px] bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-200"
                        >
                          {isGenerating ? (
                            <>
                              <motion.div 
                                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              />
                              Testing...
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
                    
                    <AnimatePresence mode="wait">
                      {testResponse && (
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label className="flex items-center gap-2">
                            <CheckCircle className="text-emerald-500" size={14} />
                            Response
                          </Label>
                          <div className="p-4 bg-gradient-to-br from-secondary to-muted rounded-xl border border-border shadow-inner">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg">
                                <Bot className="text-white" size={20} />
                              </div>
                              <p className="text-foreground flex-1 leading-relaxed">{testResponse}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
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
