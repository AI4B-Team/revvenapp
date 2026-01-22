import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Bot,
  MessageSquare,
  Clock,
  X,
  Save,
  Upload,
  FileText,
  Sparkles,
  Zap,
  Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIAutoReply {
  id: string;
  name: string;
  system_prompt: string;
  knowledge_base: string | null;
  is_active: boolean;
  response_count: number;
  last_triggered_at: string | null;
}

interface KnowledgeFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
}

const AIAutoReplySection = () => {
  const [replies, setReplies] = useState<AIAutoReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    knowledge_base: ''
  });

  useEffect(() => {
    loadReplies();

    const channel = supabase
      .channel('ai_auto_replies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_auto_replies'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'UPDATE') {
            setReplies(prev => prev.map(r => 
              r.id === payload.new.id ? { ...r, ...payload.new } as AIAutoReply : r
            ));
          } else if (payload.eventType === 'INSERT') {
            setReplies(prev => [payload.new as AIAutoReply, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setReplies(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadReplies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_auto_replies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading AI auto replies:', error);
      toast.error('Failed to load AI auto replies');
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeFiles = async (replyId: string) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_files')
        .select('id, file_name, file_type, file_size')
        .eq('ai_auto_reply_id', replyId);

      if (error) throw error;
      setKnowledgeFiles(data || []);
    } catch (error) {
      console.error('Error loading knowledge files:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.system_prompt) {
      toast.error('Please provide a name and system prompt');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in');
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from('ai_auto_replies')
          .update({
            name: formData.name,
            system_prompt: formData.system_prompt,
            knowledge_base: formData.knowledge_base || null
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('AI auto reply updated!');
      } else {
        const { error } = await supabase
          .from('ai_auto_replies')
          .insert({
            user_id: user.id,
            name: formData.name,
            system_prompt: formData.system_prompt,
            knowledge_base: formData.knowledge_base || null
          });

        if (error) throw error;
        toast.success('AI auto reply created!');
      }

      resetForm();
      loadReplies();
    } catch (error) {
      console.error('Error saving AI auto reply:', error);
      toast.error('Failed to save AI auto reply');
    }
  };

  const handleEdit = async (reply: AIAutoReply) => {
    setEditingId(reply.id);
    setFormData({
      name: reply.name,
      system_prompt: reply.system_prompt,
      knowledge_base: reply.knowledge_base || ''
    });
    await loadKnowledgeFiles(reply.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_auto_replies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReplies(prev => prev.filter(r => r.id !== id));
      toast.success('AI auto reply deleted');
    } catch (error) {
      console.error('Error deleting AI auto reply:', error);
      toast.error('Failed to delete AI auto reply');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_auto_replies')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      setReplies(prev => prev.map(r => r.id === id ? { ...r, is_active: !isActive } : r));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error toggling AI auto reply:', error);
      toast.error('Failed to update status');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['text/plain', 'application/pdf'];
    const allowedExtensions = ['.txt', '.pdf'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('Only .txt and .pdf files are supported');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingFile(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in');
        return;
      }

      let content = '';
      if (file.type === 'text/plain' || fileExtension === '.txt') {
        content = await file.text();
      } else {
        content = `[PDF File: ${file.name}] - Content will be parsed when processing messages.`;
        toast.info('PDF content will be parsed when processing messages');
      }

      if (editingId) {
        const { error } = await supabase
          .from('knowledge_files')
          .insert({
            user_id: user.id,
            ai_auto_reply_id: editingId,
            file_name: file.name,
            file_type: file.type || 'text/plain',
            file_content: content,
            file_size: file.size
          });

        if (error) throw error;
        await loadKnowledgeFiles(editingId);
        toast.success('File uploaded successfully');
      } else {
        setFormData(prev => ({
          ...prev,
          knowledge_base: prev.knowledge_base 
            ? `${prev.knowledge_base}\n\n--- ${file.name} ---\n${content}`
            : content
        }));
        toast.success('File content added to knowledge base');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      setKnowledgeFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setKnowledgeFiles([]);
    setFormData({ name: '', system_prompt: '', knowledge_base: '' });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <Bot className="absolute inset-0 m-auto text-primary" size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Brain className="text-white" size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
              <Zap size={8} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              AI Auto Reply
            </h3>
            <p className="text-sm text-muted-foreground">
              Intelligent responses powered by your knowledge
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
        >
          <Plus size={16} />
          Add AI Reply
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 animate-scale-in overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />
          <CardHeader className="pb-4 relative">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {editingId ? 'Edit AI Auto Reply' : 'New AI Auto Reply'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 relative">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Name</Label>
              <Input
                placeholder="e.g., Customer Support AI"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800/50 border-slate-700/50 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">System Prompt</Label>
              <Textarea
                placeholder="You are a helpful customer support assistant. Be friendly, concise, and helpful..."
                value={formData.system_prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                rows={4}
                className="bg-slate-800/50 border-slate-700/50 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all resize-none"
              />
              <p className="text-xs text-slate-500">
                This defines how the AI will behave and respond to messages
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-300">Knowledge Base</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.pdf"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="border-slate-700 hover:bg-slate-800 hover:border-violet-500/50 transition-all"
                  >
                    {uploadingFile ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent mr-1" />
                    ) : (
                      <Upload size={14} className="mr-1" />
                    )}
                    Upload File
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Enter knowledge base information here, or upload a file..."
                value={formData.knowledge_base}
                onChange={(e) => setFormData(prev => ({ ...prev, knowledge_base: e.target.value }))}
                rows={5}
                className="bg-slate-800/50 border-slate-700/50 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all resize-none"
              />
            </div>

            {knowledgeFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Uploaded Files</Label>
                <div className="space-y-2">
                  {knowledgeFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-violet-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <FileText size={16} className="text-violet-400" />
                        </div>
                        <div>
                          <span className="text-sm text-slate-200">{file.file_name}</span>
                          {file.file_size && (
                            <span className="text-xs text-slate-500 ml-2">
                              {formatFileSize(file.file_size)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={resetForm}
                className="hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-purple-500/25"
              >
                <Save size={16} className="mr-2" />
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {replies.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-700/50 bg-slate-900/30 backdrop-blur">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
              <Bot className="text-violet-400" size={32} />
            </div>
            <p className="text-slate-300 font-medium mb-1">No AI auto replies yet</p>
            <p className="text-sm text-slate-500">Create your first AI auto reply to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {replies.map((reply, index) => (
            <Card 
              key={reply.id} 
              className={`
                group relative border-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 
                backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-xl
                ${reply.is_active ? 'hover:shadow-violet-500/20' : 'opacity-60 hover:opacity-80'}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none
              `} />
              
              {/* Active indicator */}
              {reply.is_active && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-60" />
              )}

              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${reply.is_active 
                          ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-purple-500/25' 
                          : 'bg-slate-800'
                        }
                      `}>
                        <Bot className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100">{reply.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge 
                            variant={reply.is_active ? 'default' : 'secondary'}
                            className={`
                              text-[10px] px-2 py-0 h-5 font-medium
                              ${reply.is_active 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }
                            `}
                          >
                            {reply.is_active ? '● Active' : 'Inactive'}
                          </Badge>
                          {reply.knowledge_base && (
                            <Badge 
                              variant="outline" 
                              className="text-[10px] px-2 py-0 h-5 border-violet-500/30 text-violet-400 bg-violet-500/10"
                            >
                              <FileText size={10} className="mr-1" />
                              Knowledge
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 pl-[52px]">
                      {reply.system_prompt}
                    </p>
                    
                    <div className="flex items-center gap-6 pl-[52px]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <MessageSquare size={14} className="text-violet-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-100">{reply.response_count}</p>
                          <p className="text-[10px] text-slate-500 -mt-0.5">responses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                          <Clock size={14} className="text-fuchsia-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{formatDate(reply.last_triggered_at)}</p>
                          <p className="text-[10px] text-slate-500 -mt-0.5">last active</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reply.is_active}
                      onCheckedChange={() => handleToggle(reply.id, reply.is_active)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-fuchsia-500"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(reply)}
                      className="h-9 w-9 hover:bg-slate-800 hover:text-violet-400 transition-colors"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reply.id)}
                      className="h-9 w-9 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAutoReplySection;
