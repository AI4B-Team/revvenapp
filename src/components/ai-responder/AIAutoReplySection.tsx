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
  Zap
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
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">AI Auto Reply</h3>
            <p className="text-xs text-muted-foreground">
              Intelligent responses powered by your knowledge
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          size="sm"
          className="gap-1.5"
        >
          <Plus size={14} />
          Add AI Reply
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border border-border bg-card shadow-sm animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 font-medium">
              <Sparkles className="text-primary" size={16} />
              {editingId ? 'Edit AI Auto Reply' : 'New AI Auto Reply'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Name</Label>
              <Input
                placeholder="e.g., Customer Support AI"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">System Prompt</Label>
              <Textarea
                placeholder="You are a helpful customer support assistant..."
                value={formData.system_prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                rows={3}
                className="text-sm resize-none"
              />
              <p className="text-[10px] text-muted-foreground">
                This defines how the AI will behave and respond
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Knowledge Base</Label>
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
                  className="h-7 text-xs px-2"
                >
                  {uploadingFile ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent mr-1" />
                  ) : (
                    <Upload size={12} className="mr-1" />
                  )}
                  Upload
                </Button>
              </div>
              <Textarea
                placeholder="Enter knowledge base information..."
                value={formData.knowledge_base}
                onChange={(e) => setFormData(prev => ({ ...prev, knowledge_base: e.target.value }))}
                rows={4}
                className="text-sm resize-none"
              />
            </div>

            {knowledgeFiles.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Uploaded Files</Label>
                <div className="space-y-1.5">
                  {knowledgeFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-muted-foreground" />
                        <span className="text-xs">{file.file_name}</span>
                        {file.file_size && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save size={12} />
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {replies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
              <Bot className="text-muted-foreground" size={24} />
            </div>
            <p className="text-sm text-foreground font-medium mb-0.5">No AI auto replies yet</p>
            <p className="text-xs text-muted-foreground">Create your first AI auto reply to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <Card 
              key={reply.id} 
              className={`
                border bg-card transition-all duration-200 hover:shadow-md
                ${!reply.is_active && 'opacity-50'}
              `}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${reply.is_active ? 'bg-primary/10' : 'bg-muted'}
                      `}>
                        <Bot size={16} className={reply.is_active ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{reply.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {reply.is_active ? (
                            <Badge className="h-4 px-1.5 text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-medium">
                              Inactive
                            </Badge>
                          )}
                          {reply.knowledge_base && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px]">
                              <FileText size={8} className="mr-0.5" />
                              KB
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3 ml-[42px]">
                      {reply.system_prompt}
                    </p>
                    
                    <div className="flex items-center gap-4 ml-[42px]">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MessageSquare size={12} className="text-primary" />
                        <span className="font-medium text-foreground">{reply.response_count}</span>
                        <span className="text-muted-foreground">responses</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{formatDate(reply.last_triggered_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Switch
                      checked={reply.is_active}
                      onCheckedChange={() => handleToggle(reply.id, reply.is_active)}
                      className="scale-90"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(reply)}
                      className="h-8 w-8"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reply.id)}
                      className="h-8 w-8 hover:text-destructive"
                    >
                      <Trash2 size={14} />
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