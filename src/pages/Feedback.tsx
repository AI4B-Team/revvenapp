// Feedback Center - Share thoughts, report bugs, request features
import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, Bug, Lightbulb, Upload, Image as ImageIcon,
  ChevronUp, MessageCircle, Plus, AlertTriangle, AlertCircle,
  Info, Loader2, X, Archive, ThumbsUp, Monitor, Video
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFeedback, useFeedbackVotes, useFeedbackComments, useUploadFeedbackAttachment, FeedbackSubmission } from '@/hooks/useFeedback';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { captureElementToPngBlob } from '@/utils/domCapture';
import { revokePreviewUrl } from '@/utils/imageUtils';

type AttachmentItem =
  | { kind: 'remote'; url: string }
  | { kind: 'local'; previewUrl: string; file: File };

const severityOptions = [
  { value: 'low', label: 'Low - Minor issue, workaround available', icon: Info, color: 'text-blue-500' },
  { value: 'medium', label: 'Medium - Affects functionality', icon: AlertCircle, color: 'text-amber-500' },
  { value: 'high', label: 'High - Critical, blocking issue', icon: AlertTriangle, color: 'text-red-500' },
];

const severityConfig = {
  low: { label: 'Low', icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  medium: { label: 'Medium', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  high: { label: 'High', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const statusConfig = {
  open: { label: 'open', icon: Info, className: 'bg-muted text-muted-foreground border-border' },
  in_progress: { label: 'in progress', icon: Loader2, className: 'bg-primary/10 text-primary border-primary/20' },
  resolved: { label: 'resolved', icon: Info, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  closed: { label: 'closed', icon: Info, className: 'bg-muted text-muted-foreground border-border' },
  planned: { label: 'planned', icon: Info, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
};

const FeedbackCard = ({ feedback, onClick, isArchived = false }: { feedback: FeedbackSubmission; onClick: () => void; isArchived?: boolean }) => {
  const { hasVoted, toggleVote } = useFeedbackVotes(feedback.id);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isArchived) {
      toggleVote.mutate();
    }
  };

  const getSeverityIcon = () => {
    if (feedback.type === 'bug' && feedback.severity) {
      const config = severityConfig[feedback.severity];
      const Icon = config.icon;
      return <Icon className={cn("w-4 h-4 shrink-0", config.color)} />;
    }
    return null;
  };

  const status = statusConfig[feedback.status] || statusConfig.open;

  // Show first attachment as image preview if available
  const hasImageAttachment = feedback.attachments && feedback.attachments.length > 0;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer",
        isArchived && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {getSeverityIcon()}
          <h3 className={cn("font-semibold line-clamp-1", isArchived ? "text-muted-foreground" : "text-foreground")}>
            {feedback.title}
          </h3>
        </div>
        {isArchived ? (
          <span className="text-xs text-muted-foreground shrink-0">Archived</span>
        ) : (
          <Badge 
            variant="outline" 
            className={cn("shrink-0 text-xs font-normal", status.className)}
          >
            {status.label}
          </Badge>
        )}
      </div>
      
      <p className={cn(
        "text-sm line-clamp-2 mb-2",
        isArchived ? "text-muted-foreground/70" : "text-muted-foreground"
      )}>
        {feedback.description}
      </p>

      {/* Image attachment preview */}
      {hasImageAttachment && (
        <div className="mb-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
            <img 
              src={feedback.attachments![0]} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mb-3">
        By <span className="font-medium text-foreground">User</span> · {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
      </p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleVote}
          disabled={toggleVote.isPending || isArchived}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors",
            isArchived 
              ? "text-muted-foreground/50 cursor-default" 
              : hasVoted 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ThumbsUp className={cn("w-4 h-4", hasVoted && !isArchived && "fill-primary")} />
          <span>{feedback.votes_count}</span>
        </button>
        <span className={cn(
          "flex items-center gap-1.5 text-sm",
          isArchived ? "text-muted-foreground/50" : "text-muted-foreground"
        )}>
          <MessageCircle className="w-4 h-4" />
          {feedback.comments_count}
        </span>
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
    addComment.mutate({ content: newComment }, {
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
                  <div key={comment.id} className={cn(
                    "flex gap-3",
                    comment.is_admin_reply && "bg-primary/5 -mx-2 px-2 py-2 rounded-lg border border-primary/20"
                  )}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author_avatar || undefined} />
                      <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        {comment.is_admin_reply && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                            Official Reply
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Comment */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">
            💡 Reply to share updates, ask questions, or provide more details. The author will be notified.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Write a reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
            />
            <Button onClick={handleAddComment} disabled={addComment.isPending || !newComment.trim()}>
              {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubmitFeedbackModal = ({ 
  type, 
  open,
  onOpenChange,
  onSuccess
}: { 
  type: 'general' | 'bug' | 'feature'; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { createFeedback } = useFeedback();
  const { uploadFile, uploading } = useUploadFeedbackAttachment();

  const maxTitleLength = 100;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) {
        setAttachments(prev => [...prev, { kind: 'remote', url }]);
      }
    }
  };

  const handleScreenshot = async () => {
    setIsCapturing(true);
    try {
      // Capture the in-app page DOM (no auth required; no screen-sharing prompt).
      // Prefer capturing <main> so the modal (ported) is typically excluded.
      const target =
        (document.querySelector('main') as HTMLElement | null) ||
        (document.querySelector('#root') as HTMLElement | null) ||
        (document.body as HTMLElement | null);

      if (!target) throw new Error('No capture target found');

      const blob = await captureElementToPngBlob(target);
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
      const previewUrl = URL.createObjectURL(blob);

      setAttachments((prev) => [...prev, { kind: 'local', previewUrl, file }]);
      toast.success('Screenshot added to attachments.');
    } catch (error) {
      console.error('Screenshot error:', error);
      toast.error('Failed to capture screenshot in this browser.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRecordScreen = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        audio: true
      });
      
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        
        const url = await uploadFile(file);
        if (url) {
          setAttachments((prev) => [...prev, { kind: 'remote', url }]);
          toast.success('Screen recording saved!');
        }
        
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };
      
      // Also stop when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        mediaRecorderRef.current?.stop();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started. Click "Stop Recording" when done.');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording. Please allow screen sharing.');
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Never store local blob: URLs in the database.
    // If the user is authenticated, try to upload local attachments at submit time.
    const remoteUrls: string[] = attachments
      .filter((a): a is { kind: 'remote'; url: string } => a.kind === 'remote')
      .map((a) => a.url);

    const localFiles = attachments.filter(
      (a): a is { kind: 'local'; previewUrl: string; file: File } => a.kind === 'local',
    );

    if (localFiles.length > 0) {
      for (const item of localFiles) {
        const url = await uploadFile(item.file);
        if (url) remoteUrls.push(url);
      }
    }

    createFeedback.mutate({
      type,
      title,
      description,
      attachments: remoteUrls,
      severity: type === 'bug' ? severity : undefined,
    }, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setAttachments((prev) => {
          prev.forEach((a) => {
            if (a.kind === 'local') revokePreviewUrl(a.previewUrl);
          });
          return [];
        });
        onSuccess();
        onOpenChange(false);
      },
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const item = prev[index];
      if (item?.kind === 'local') revokePreviewUrl(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getFormConfig = () => {
    switch (type) {
      case 'bug': return { 
        title: 'Report a Bug', 
        icon: Bug, 
        iconColor: 'text-red-500',
        titlePlaceholder: 'Brief description of the issue',
        descPlaceholder: `Example:
**Steps to reproduce:**
1. Go to the dashboard
2. Click on "Create" button
3. Select "Video" option

**Expected behavior:**
The video editor should open

**Actual behavior:**
Page shows a blank screen

**Browser/Device:**
Chrome on Windows 11`,
        descExample: 'Describe the bug with steps to reproduce, expected vs actual behavior, and your browser/device info.'
      };
      case 'feature': return { 
        title: 'Request a Feature', 
        icon: Lightbulb, 
        iconColor: 'text-amber-500',
        titlePlaceholder: 'What feature would you like?',
        descPlaceholder: `Example:
**Feature description:**
Add the ability to schedule posts for multiple platforms at once.

**Use case:**
As a content creator, I want to post the same content across Instagram, Twitter, and Facebook simultaneously to save time.

**Proposed solution:**
Add a "Post to all" checkbox in the scheduling modal.

**Alternatives considered:**
Currently I have to create separate posts for each platform.`,
        descExample: 'Describe the feature, your use case, and how it would help you.'
      };
      default: return { 
        title: 'Submit Feedback', 
        icon: MessageSquare, 
        iconColor: 'text-blue-500',
        titlePlaceholder: "What's on your mind?",
        descPlaceholder: `Example:
**What I love:**
The new dashboard design is much cleaner!

**What could be improved:**
The loading times for video previews feel slow.

**Suggestions:**
Consider adding keyboard shortcuts for common actions.`,
        descExample: 'Share your thoughts, suggestions, or general feedback about the app.'
      };
    }
  };

  const config = getFormConfig();
  const FormIcon = config.icon;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxTitleLength) {
      setTitle(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FormIcon className={cn("w-5 h-5", config.iconColor)} />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title with character count */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Title *</label>
              <span className="text-xs text-muted-foreground">{title.length}/{maxTitleLength}</span>
            </div>
            <Input
              placeholder={config.titlePlaceholder}
              value={title}
              onChange={handleTitleChange}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Description *</label>
              <span className="text-xs text-muted-foreground">{config.descExample}</span>
            </div>
            <Textarea
              placeholder={config.descPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[150px] resize-y font-mono text-sm"
            />
          </div>

          {/* Severity Dropdown for bugs */}
          {type === 'bug' && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Severity</label>
              <Select value={severity} onValueChange={(val: 'low' | 'medium' | 'high') => setSeverity(val)}>
                <SelectTrigger>
                  <SelectValue>
                    {(() => {
                      const option = severityOptions.find(o => o.value === severity);
                      if (!option) return null;
                      const Icon = option.icon;
                      return (
                        <span className="flex items-center gap-2">
                          <Icon className={cn("w-4 h-4", option.color)} />
                          {option.label}
                        </span>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <Icon className={cn("w-4 h-4", option.color)} />
                          {option.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Attachments */}
          <div>
            <label className="text-sm font-medium mb-2 block">Attachments</label>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {attachments.map((att, idx) => {
                  const url = att.kind === 'remote' ? att.url : att.previewUrl;
                  return (
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
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
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
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                Upload Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleScreenshot}
                disabled={uploading || isCapturing || isRecording}
              >
                {isCapturing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                {isCapturing ? 'Capturing...' : 'Screenshot Page'}
              </Button>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={handleRecordScreen}
                disabled={uploading || isCapturing}
              >
                {isRecording ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                {isRecording ? 'Stop Recording' : 'Record Screen'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createFeedback.isPending || !title.trim() || !description.trim()}
            >
              {createFeedback.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Category card component - white rectangular with rounded corners
const CategoryCard = ({ 
  icon: Icon, 
  iconBg, 
  iconColor,
  title, 
  subtitle,
  onClick 
}: { 
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background hover:border-primary/50 hover:shadow-sm transition-all text-left w-full"
  >
    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
      <Icon className={cn("w-6 h-6", iconColor)} />
    </div>
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </button>
);

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSubmission | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'general' | 'bug' | 'feature'>('general');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { feedbackList: generalFeedback, isLoading: loadingGeneral } = useFeedback('general');
  const { feedbackList: bugReports, isLoading: loadingBugs } = useFeedback('bug');
  const { feedbackList: featureRequests, isLoading: loadingFeatures } = useFeedback('feature');

  // Sample data for demonstration
  const sampleFeedback: FeedbackSubmission[] = [
    {
      id: 'sample-1',
      user_id: 'demo',
      title: 'Add dark mode support',
      description: 'It would be great to have a dark mode option for the dashboard. Many users prefer working at night.',
      type: 'feature',
      status: 'in_progress',
      severity: null,
      votes_count: 24,
      comments_count: 5,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      user_id: 'demo',
      title: 'Export functionality for reports',
      description: 'Would love to be able to export analytics reports to PDF or Excel format.',
      type: 'feature',
      status: 'open',
      severity: null,
      votes_count: 18,
      comments_count: 3,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      user_id: 'demo',
      title: 'Mobile app version',
      description: 'A mobile app would make it easier to manage content on the go.',
      type: 'feature',
      status: 'open',
      severity: null,
      votes_count: 42,
      comments_count: 12,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'sample-4',
      user_id: 'demo',
      title: 'Keyboard shortcuts',
      description: 'Add keyboard shortcuts for common actions like save, undo, and navigation.',
      type: 'feature',
      status: 'open',
      severity: null,
      votes_count: 15,
      comments_count: 2,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const sampleBugs: FeedbackSubmission[] = [
    {
      id: 'bug-1',
      user_id: 'demo',
      title: 'Video upload fails on large files',
      description: 'When uploading videos larger than 500MB, the upload process fails without an error message.',
      type: 'bug',
      status: 'in_progress',
      severity: 'high',
      votes_count: 8,
      comments_count: 4,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bug-2',
      user_id: 'demo',
      title: 'Sidebar flickering on page transition',
      description: 'The sidebar flickers briefly when navigating between pages.',
      type: 'bug',
      status: 'open',
      severity: 'low',
      votes_count: 3,
      comments_count: 1,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const sampleGeneral: FeedbackSubmission[] = [
    {
      id: 'general-1',
      user_id: 'demo',
      title: 'Love the new dashboard design!',
      description: 'The recent UI update looks amazing. Great job on the modern look and feel.',
      type: 'general',
      status: 'open',
      severity: null,
      votes_count: 12,
      comments_count: 2,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'general-2',
      user_id: 'demo',
      title: 'Documentation could be improved',
      description: 'Some sections of the documentation are outdated. Would be helpful to have more examples.',
      type: 'general',
      status: 'open',
      severity: null,
      votes_count: 7,
      comments_count: 3,
      attachments: null,
      screen_recording_url: null,
      parent_id: null,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const openFormModal = (type: 'general' | 'bug' | 'feature') => {
    setFormType(type);
    setShowForm(true);
  };

  const getCurrentFeedback = () => {
    switch (activeTab) {
      case 'bugs': 
        const bugs = bugReports?.filter(f => f.status !== 'closed' && f.status !== 'resolved');
        return bugs && bugs.length > 0 ? bugs : sampleBugs;
      case 'features': 
        const features = featureRequests?.filter(f => f.status !== 'closed' && f.status !== 'resolved');
        return features && features.length > 0 ? features : sampleFeedback;
      case 'archived': 
        return [...(generalFeedback || []), ...(bugReports || []), ...(featureRequests || [])].filter(f => f.status === 'closed' || f.status === 'resolved');
      default: 
        const general = generalFeedback?.filter(f => f.status !== 'closed' && f.status !== 'resolved');
        return general && general.length > 0 ? general : sampleGeneral;
    }
  };

  const getArchivedCount = () => {
    const allFeedback = [...(generalFeedback || []), ...(bugReports || []), ...(featureRequests || [])];
    return allFeedback.filter(f => f.status === 'closed' || f.status === 'resolved').length;
  };

  const isLoading = activeTab === 'archived' 
    ? loadingGeneral || loadingBugs || loadingFeatures
    : activeTab === 'bugs' 
      ? loadingBugs 
      : activeTab === 'features' 
        ? loadingFeatures 
        : loadingGeneral;
  const currentFeedback = getCurrentFeedback();
  const isArchivedTab = activeTab === 'archived';

  const renderFeedbackList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!currentFeedback || currentFeedback.length === 0) {
      const emptyConfig = {
        general: { icon: MessageSquare, title: 'No Feedback Yet', subtitle: 'Be the first to share your thoughts!' },
        bugs: { icon: Bug, title: 'No Feedback Yet', subtitle: 'Everything seems to be working great!' },
        features: { icon: Lightbulb, title: 'No Feedback Yet', subtitle: 'Got a great idea? Share it with us!' },
        archived: { icon: Archive, title: 'No Feedback Yet', subtitle: 'Closed or resolved items will appear here.' },
      };
      const config = emptyConfig[activeTab as keyof typeof emptyConfig] || emptyConfig.general;
      const Icon = config.icon;

      return (
        <div className="text-center py-12">
          <Icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
          <p className="text-muted-foreground mb-4">{config.subtitle}</p>
          {!isArchivedTab && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {isArchivedTab && (
          <p className="text-sm text-muted-foreground border-l-2 border-border pl-3 mb-4">
            Archived items are closed for voting and new comments.
          </p>
        )}
        {currentFeedback.map((feedback) => (
          <FeedbackCard
            key={feedback.id}
            feedback={feedback}
            onClick={() => setSelectedFeedback(feedback)}
            isArchived={isArchivedTab}
          />
        ))}
      </div>
    );
  };

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
        
        <main className="p-4 lg:p-6 max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Feedback Center</h1>
            <p className="text-muted-foreground">Share your thoughts, report bugs, or request new features</p>
          </div>

          {/* Category Cards - clicking opens modal for that type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <CategoryCard
              icon={MessageSquare}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
              title="General Feedback"
              subtitle="Share your thoughts"
              onClick={() => openFormModal('general')}
            />
            <CategoryCard
              icon={Bug}
              iconBg="bg-red-500/10"
              iconColor="text-red-500"
              title="Report a Bug"
              subtitle="Something not working?"
              onClick={() => openFormModal('bug')}
            />
            <CategoryCard
              icon={Lightbulb}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
              title="Feature Request"
              subtitle="Suggest an improvement"
              onClick={() => openFormModal('feature')}
            />
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => handleTabChange('general')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border",
                activeTab === 'general'
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/30"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => handleTabChange('bugs')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border",
                activeTab === 'bugs'
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/30"
              )}
            >
              <Bug className="w-4 h-4" />
              Bug Reports
            </button>
            <button
              onClick={() => handleTabChange('features')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border",
                activeTab === 'features'
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/30"
              )}
            >
              <Lightbulb className="w-4 h-4" />
              Feature Requests
            </button>
            <button
              onClick={() => handleTabChange('archived')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border",
                activeTab === 'archived'
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/30"
              )}
            >
              <Archive className="w-4 h-4" />
              Archived ({getArchivedCount()})
            </button>
          </div>


          {/* Feedback List */}
          {renderFeedbackList()}
        </main>
      </div>

      {/* Submit Feedback Modal */}
      <SubmitFeedbackModal
        type={formType}
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={() => {}}
      />

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
