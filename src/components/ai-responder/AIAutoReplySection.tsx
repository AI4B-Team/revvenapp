import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const isPdf = file.type === 'application/pdf' || fileExtension === '.pdf';
      
      if (isPdf) {
        // Convert PDF to base64 and send to parsing function
        toast.info('Extracting text from PDF...');
        
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        
        // Call the PDF parser edge function
        const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-pdf', {
          body: { 
            pdfBase64: base64,
            fileName: file.name 
          }
        });
        
        if (parseError) {
          console.error('PDF parsing error:', parseError);
          toast.error('Failed to extract text from PDF');
          content = `[PDF File: ${file.name}] - Text extraction failed. Please try a different file format.`;
        } else if (parseResult?.text) {
          content = `=== ${file.name} ===\n\n${parseResult.text}`;
          toast.success(`Extracted ${parseResult.charCount} characters from PDF`);
        } else {
          content = `[PDF File: ${file.name}] - No text could be extracted.`;
          toast.warning('PDF appears to be image-based. Consider using a text file.');
        }
      } else {
        // Plain text file
        content = await file.text();
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
        toast.success('Knowledge file uploaded and processed!');
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
        <motion.div 
          className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Brain className="text-white" size={20} />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold">AI Auto Reply</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent responses powered by your knowledge
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/20 transition-all duration-200"
        >
          <Plus size={16} />
          Add AI Reply
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Card className="border-purple-500/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="text-purple-500" size={16} />
                  {editingId ? 'Edit AI Auto Reply' : 'New AI Auto Reply'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Name</Label>
                  <Input
                    placeholder="e.g., Customer Support AI"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">System Prompt</Label>
                  <Textarea
                    placeholder="You are a helpful customer support assistant..."
                    value={formData.system_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                    rows={3}
                    className="resize-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    This defines how the AI will behave and respond
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Knowledge Base</Label>
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
                      className="gap-1.5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-colors"
                    >
                      {uploadingFile ? (
                        <motion.div 
                          className="h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <Upload size={14} />
                      )}
                      Upload
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter knowledge base information..."
                    value={formData.knowledge_base}
                    onChange={(e) => setFormData(prev => ({ ...prev, knowledge_base: e.target.value }))}
                    rows={4}
                    className="resize-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {knowledgeFiles.length > 0 && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Label className="text-sm font-medium">Uploaded Files</Label>
                    <div className="space-y-2">
                      {knowledgeFiles.map((file, index) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg border border-purple-500/20 group hover:border-purple-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-purple-500" />
                            <span className="text-sm">{file.file_name}</span>
                            {file.file_size && (
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.file_size)}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                          >
                            <X size={14} />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={resetForm} className="gap-1 hover:bg-muted transition-colors">
                    <X size={16} />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Save size={16} />
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {replies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-dashed border-2 bg-gradient-to-br from-muted/30 to-muted/10">
            <CardContent className="py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-4"
              >
                <Brain className="text-purple-500" size={32} />
              </motion.div>
              <p className="text-foreground font-medium">No AI auto replies yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first AI auto reply to get started</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <Card className={`group hover:shadow-md transition-all duration-300 overflow-hidden ${!reply.is_active ? 'opacity-50' : ''}`}>
                  <div className={`h-0.5 ${reply.is_active ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-muted'}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2">
                          <motion.div 
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              reply.is_active 
                                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
                                : 'bg-muted'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Bot size={18} className={reply.is_active ? 'text-purple-500' : 'text-muted-foreground'} />
                          </motion.div>
                          <div>
                            <h4 className="text-sm font-medium">{reply.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {reply.is_active ? (
                                <Badge className="h-5 px-2 text-xs bg-emerald-500 hover:bg-emerald-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="h-5 px-2 text-xs">
                                  Inactive
                                </Badge>
                              )}
                              {reply.knowledge_base && (
                                <Badge variant="outline" className="h-5 px-2 text-xs bg-purple-500/10 border-purple-500/30">
                                  <FileText size={10} className="mr-1" />
                                  KB
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-3 ml-[46px]">
                          {reply.system_prompt}
                        </p>
                        
                        <div className="flex items-center gap-4 ml-[46px]">
                          <div className="flex items-center gap-1.5 text-sm">
                            <MessageSquare size={14} className="text-purple-500" />
                            <span className="font-medium">{reply.response_count}</span>
                            <span className="text-muted-foreground">responses</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Clock size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">{formatDate(reply.last_triggered_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Switch
                          checked={reply.is_active}
                          onCheckedChange={() => handleToggle(reply.id, reply.is_active)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(reply)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reply.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AIAutoReplySection;