import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Copy,
  Tag,
  MessageSquare,
  Clock,
  X,
  Save,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface KeywordReply {
  id: string;
  name: string;
  keywords: string[];
  response_message: string;
  is_active: boolean;
  response_count: number;
  last_triggered_at: string | null;
}

const KeywordReplySection = () => {
  const [replies, setReplies] = useState<KeywordReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    response_message: ''
  });

  useEffect(() => {
    loadReplies();
  }, []);

  const loadReplies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('keyword_replies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading keyword replies:', error);
      toast.error('Failed to load keyword replies');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.keywords || !formData.response_message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in');
        return;
      }

      const keywords = formData.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);

      if (editingId) {
        const { error } = await supabase
          .from('keyword_replies')
          .update({
            name: formData.name,
            keywords,
            response_message: formData.response_message
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Keyword reply updated!');
      } else {
        const { error } = await supabase
          .from('keyword_replies')
          .insert({
            user_id: user.id,
            name: formData.name,
            keywords,
            response_message: formData.response_message
          });

        if (error) throw error;
        toast.success('Keyword reply created!');
      }

      resetForm();
      loadReplies();
    } catch (error) {
      console.error('Error saving keyword reply:', error);
      toast.error('Failed to save keyword reply');
    }
  };

  const handleEdit = (reply: KeywordReply) => {
    setEditingId(reply.id);
    setFormData({
      name: reply.name,
      keywords: reply.keywords.join(', '),
      response_message: reply.response_message
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('keyword_replies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReplies(prev => prev.filter(r => r.id !== id));
      toast.success('Keyword reply deleted');
    } catch (error) {
      console.error('Error deleting keyword reply:', error);
      toast.error('Failed to delete keyword reply');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('keyword_replies')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      setReplies(prev => prev.map(r => r.id === id ? { ...r, is_active: !isActive } : r));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error toggling keyword reply:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDuplicate = async (reply: KeywordReply) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('keyword_replies')
        .insert({
          user_id: user.id,
          name: `${reply.name} (Copy)`,
          keywords: reply.keywords,
          response_message: reply.response_message,
          is_active: false
        });

      if (error) throw error;
      toast.success('Keyword reply duplicated');
      loadReplies();
    } catch (error) {
      console.error('Error duplicating keyword reply:', error);
      toast.error('Failed to duplicate');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', keywords: '', response_message: '' });
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
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Tag className="text-white" size={20} />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold">Keyword Reply</h3>
            <p className="text-sm text-muted-foreground">
              Set keywords and auto-reply with predefined messages
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20 transition-all duration-200">
          <Plus size={16} />
          Add Keyword Reply
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
            <Card className="border-amber-500/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={16} />
                  {editingId ? 'Edit Keyword Reply' : 'New Keyword Reply'}
                </CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., Greeting Response"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Keywords (comma separated)</Label>
              <Input
                placeholder="e.g., hello, hi, hey, greetings"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                When someone sends a message containing any of these keywords, the response will be sent
              </p>
            </div>
            <div className="space-y-2">
              <Label>Response Message</Label>
              <Textarea
                placeholder="Enter the message to send when triggered..."
                value={formData.response_message}
                onChange={(e) => setFormData(prev => ({ ...prev, response_message: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={resetForm} className="gap-1 hover:bg-muted transition-colors">
                <X size={16} />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
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

      {/* List */}
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
                className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-4"
              >
                <Tag className="text-amber-500" size={32} />
              </motion.div>
              <p className="text-foreground font-medium">No keyword replies yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first keyword reply to get started</p>
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
                <Card className={`group hover:shadow-md transition-all duration-300 ${!reply.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{reply.name}</h4>
                          <Badge 
                            variant={reply.is_active ? 'default' : 'secondary'}
                            className={reply.is_active ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                          >
                            {reply.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {reply.keywords.map((keyword, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                            >
                              <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400">
                                {keyword}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {reply.response_message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} className="text-primary" />
                            <span className="font-medium">{reply.response_count}</span> responses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Last: {formatDate(reply.last_triggered_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={reply.is_active}
                          onCheckedChange={() => handleToggle(reply.id, reply.is_active)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(reply)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(reply)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reply.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
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

export default KeywordReplySection;
