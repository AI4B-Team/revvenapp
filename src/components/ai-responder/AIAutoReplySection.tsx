import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Sparkles
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

    // Subscribe to real-time updates
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

      // Read file content
      let content = '';
      if (file.type === 'text/plain' || fileExtension === '.txt') {
        content = await file.text();
      } else {
        // For PDF, we'll just store the file name and notify user
        content = `[PDF File: ${file.name}] - Content will be parsed when processing messages.`;
        toast.info('PDF content will be parsed when processing messages');
      }

      // If editing, save to database
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
        // Append to knowledge base text
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="text-primary" size={20} />
            AI Auto Reply
          </h3>
          <p className="text-sm text-muted-foreground">
            AI responds based on your system prompt and knowledge base
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} />
          Add AI Reply
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="text-primary" size={18} />
              {editingId ? 'Edit AI Auto Reply' : 'New AI Auto Reply'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., Customer Support AI"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                placeholder="You are a helpful customer support assistant. Be friendly, concise, and helpful. Answer questions based on the knowledge base provided..."
                value={formData.system_prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This defines how the AI will behave and respond to messages
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Knowledge Base (Optional)</Label>
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
                  >
                    {uploadingFile ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-1" />
                    ) : (
                      <Upload size={14} className="mr-1" />
                    )}
                    Upload File
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Enter knowledge base information here, or upload a file. This will help the AI provide accurate responses..."
                value={formData.knowledge_base}
                onChange={(e) => setFormData(prev => ({ ...prev, knowledge_base: e.target.value }))}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Add FAQs, product info, policies, or any information the AI should know
              </p>
            </div>

            {/* Uploaded Files */}
            {knowledgeFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {knowledgeFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span className="text-sm">{file.file_name}</span>
                        {file.file_size && (
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.file_size)})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetForm}>
                <X size={16} className="mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-1" />
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {replies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Bot className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="text-muted-foreground">No AI auto replies yet</p>
            <p className="text-sm text-muted-foreground">Create your first AI auto reply to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <Card key={reply.id} className={`${!reply.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{reply.name}</h4>
                      <Badge variant={reply.is_active ? 'default' : 'secondary'}>
                        {reply.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {reply.knowledge_base && (
                        <Badge variant="outline" className="text-xs">
                          <FileText size={10} className="mr-1" />
                          Has Knowledge
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {reply.system_prompt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {reply.response_count} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Last: {formatDate(reply.last_triggered_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reply.is_active}
                      onCheckedChange={() => handleToggle(reply.id, reply.is_active)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(reply)}>
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reply.id)}
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
      )}
    </div>
  );
};

export default AIAutoReplySection;
