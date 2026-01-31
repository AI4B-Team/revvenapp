import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, Bug, Lightbulb, ArrowLeft, Upload, Camera, Video, 
  ChevronUp, ChevronDown, MessageCircle, Plus, AlertTriangle, AlertCircle,
  Info, Loader2, X, Image as ImageIcon
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFeedback, useFeedbackVotes, useFeedbackComments, useUploadFeedbackAttachment, FeedbackSubmission } from '@/hooks/useFeedback';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const severityConfig = {
  low: { label: 'Low', icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  medium: { label: 'Medium', icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  high: { label: 'High', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const FeedbackCard = ({ feedback, onClick }: { feedback: FeedbackSubmission; onClick: () => void }) => {
  const { hasVoted, toggleVote } = useFeedbackVotes(feedback.id);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleVote.mutate();
  };

  return (
    <div 
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleVote}
            disabled={toggleVote.isPending}
            className={cn(
              "p-2 rounded-lg transition-colors",
              hasVoted ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="font-semibold text-lg">{feedback.votes_count}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {feedback.title}
            </h3>
            {feedback.severity && (
              <Badge variant="outline" className={cn(severityConfig[feedback.severity].bg, severityConfig[feedback.severity].color, "shrink-0")}>
                {severityConfig[feedback.severity].label}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {feedback.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {feedback.comments_count} comments
            </span>
            <Badge variant="outline" className="text-xs">
              {feedback.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedbackDetailModal = ({ 
  feedback, 
  onClose 
}: { 
  feedback: FeedbackSubmission; 
  onClose: () => void;
}) => {
  const [newComment, setNewComment] = useState('');
  const { comments, isLoading, addComment } = useFeedbackComments(feedback.id);
  const { hasVoted, toggleVote } = useFeedbackVotes(feedback.id);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate(newComment, {
      onSuccess: () => setNewComment(''),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className="relative bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleVote.mutate()}
              disabled={toggleVote.isPending}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                hasVoted ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              )}
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{feedback.votes_count}</span>
            </button>
            <div>
              <h2 className="font-semibold text-lg">{feedback.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
                {feedback.severity && (
                  <Badge variant="outline" className={cn(severityConfig[feedback.severity].bg, severityConfig[feedback.severity].color)}>
                    {severityConfig[feedback.severity].label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-200px)]">
          <p className="text-foreground mb-4">{feedback.description}</p>

          {/* Attachments */}
          {feedback.attachments && feedback.attachments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Attachments</h4>
              <div className="flex flex-wrap gap-2">
                {feedback.attachments.map((url, idx) => (
                  <a 
                    key={idx} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="border-t border-border pt-4">
            <h4 className="font-medium mb-3">Comments ({comments?.length || 0})</h4>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author_avatar || undefined} />
                      <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Comment */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button onClick={handleAddComment} disabled={addComment.isPending || !newComment.trim()}>
              {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubmitFeedbackForm = ({ 
  type, 
  onSuccess 
}: { 
  type: 'general' | 'bug' | 'feature'; 
  onSuccess: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createFeedback } = useFeedback();
  const { uploadFile, uploading } = useUploadFeedbackAttachment();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) {
        setAttachments(prev => [...prev, url]);
      }
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    createFeedback.mutate({
      type,
      title,
      description,
      attachments,
      severity: type === 'bug' ? severity : undefined,
    }, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setAttachments([]);
        onSuccess();
      },
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Title *</label>
        <Input
          placeholder={type === 'bug' ? "Describe the bug briefly..." : type === 'feature' ? "What feature would you like?" : "What's on your mind?"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Description *</label>
        <Textarea
          placeholder="Provide more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      {type === 'bug' && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">Severity</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((s) => {
              const config = severityConfig[s];
              const Icon = config.icon;
              return (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                    severity === s 
                      ? `${config.bg} border-current ${config.color}` 
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Attachments</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((url, idx) => (
            <div key={idx} className="relative group">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload Image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Screenshot
          </Button>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={createFeedback.isPending || !title.trim() || !description.trim()}
        className="w-full"
      >
        {createFeedback.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Submit {type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'Feedback'}
      </Button>
    </div>
  );
};

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSubmission | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { feedbackList: generalFeedback, isLoading: loadingGeneral } = useFeedback('general');
  const { feedbackList: bugReports, isLoading: loadingBugs } = useFeedback('bug');
  const { feedbackList: featureRequests, isLoading: loadingFeatures } = useFeedback('feature');

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    setShowForm(false);
  };

  const getCurrentFeedback = () => {
    switch (activeTab) {
      case 'bugs': return bugReports;
      case 'features': return featureRequests;
      default: return generalFeedback;
    }
  };

  const isLoading = activeTab === 'bugs' ? loadingBugs : activeTab === 'features' ? loadingFeatures : loadingGeneral;
  const currentFeedback = getCurrentFeedback();

  // Group similar bug reports by title similarity
  const groupedBugReports = bugReports?.reduce((acc, bug) => {
    if (!bug.parent_id) {
      acc.push({ ...bug, related: bugReports.filter(b => b.parent_id === bug.id) });
    }
    return acc;
  }, [] as (FeedbackSubmission & { related: FeedbackSubmission[] })[]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={cn(
        "transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
      )}>
        <Header />
        
        <main className="p-4 lg:p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Feedback Hub</h1>
                <p className="text-muted-foreground">Share your thoughts, report bugs, or request features</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Submission
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="bugs" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Bug Reports
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Features
              </TabsTrigger>
            </TabsList>

            {/* General Feedback Tab */}
            <TabsContent value="general" className="space-y-4">
              {showForm ? (
                <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Submit General Feedback</h2>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <SubmitFeedbackForm type="general" onSuccess={() => setShowForm(false)} />
                </div>
              ) : (
                <>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : currentFeedback?.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
                      <p className="text-muted-foreground mb-4">Be the first to share your thoughts!</p>
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-3xl">
                      {currentFeedback?.map((feedback) => (
                        <FeedbackCard
                          key={feedback.id}
                          feedback={feedback}
                          onClick={() => setSelectedFeedback(feedback)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Bug Reports Tab */}
            <TabsContent value="bugs" className="space-y-4">
              {showForm ? (
                <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Report a Bug</h2>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <SubmitFeedbackForm type="bug" onSuccess={() => setShowForm(false)} />
                </div>
              ) : (
                <>
                  {loadingBugs ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : bugReports?.length === 0 ? (
                    <div className="text-center py-12">
                      <Bug className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No bug reports</h3>
                      <p className="text-muted-foreground mb-4">Everything seems to be working great!</p>
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Report Bug
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-3xl">
                      {bugReports?.map((feedback) => (
                        <FeedbackCard
                          key={feedback.id}
                          feedback={feedback}
                          onClick={() => setSelectedFeedback(feedback)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Feature Requests Tab */}
            <TabsContent value="features" className="space-y-4">
              {showForm ? (
                <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Request a Feature</h2>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <SubmitFeedbackForm type="feature" onSuccess={() => setShowForm(false)} />
                </div>
              ) : (
                <>
                  {loadingFeatures ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : featureRequests?.length === 0 ? (
                    <div className="text-center py-12">
                      <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No feature requests</h3>
                      <p className="text-muted-foreground mb-4">Got a great idea? Share it with us!</p>
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Request Feature
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-3xl">
                      {featureRequests?.map((feedback) => (
                        <FeedbackCard
                          key={feedback.id}
                          feedback={feedback}
                          onClick={() => setSelectedFeedback(feedback)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
};

export default Feedback;
