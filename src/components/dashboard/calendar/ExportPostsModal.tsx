import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Image as ImageIcon, Calendar, Check, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPlatformIcon } from '../SocialIcons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: string;
  imageUrl?: string;
  caption?: string;
  hashtags?: string[];
}

interface ExportPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: ContentItem[];
}

const ExportPostsModal: React.FC<ExportPostsModalProps> = ({ isOpen, onClose, posts }) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set(posts.map(p => p.id)));

  const togglePost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleExport = () => {
    const selectedItems = posts.filter(p => selectedPosts.has(p.id));
    
    if (exportFormat === 'json') {
      const jsonData = JSON.stringify(selectedItems.map(p => ({
        id: p.id,
        title: p.title,
        platform: p.platform,
        date: p.date.toISOString(),
        status: p.status,
        caption: p.caption,
        hashtags: p.hashtags,
      })), null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      const headers = ['Title', 'Platform', 'Date', 'Time', 'Status', 'Caption', 'Hashtags'];
      const rows = selectedItems.map(p => [
        `"${p.title.replace(/"/g, '""')}"`,
        p.platform,
        p.date.toLocaleDateString(),
        p.date.toLocaleTimeString(),
        p.status,
        `"${(p.caption || '').replace(/"/g, '""')}"`,
        `"${(p.hashtags || []).join(', ')}"`,
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF - create a simple text-based PDF alternative (HTML to print)
      const printContent = selectedItems.map(p => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0;">${p.title}</h3>
          <p><strong>Platform:</strong> ${p.platform}</p>
          <p><strong>Date:</strong> ${p.date.toLocaleDateString()} at ${p.date.toLocaleTimeString()}</p>
          <p><strong>Status:</strong> ${p.status}</p>
          ${p.caption ? `<p><strong>Caption:</strong> ${p.caption}</p>` : ''}
          ${p.hashtags?.length ? `<p><strong>Hashtags:</strong> ${p.hashtags.join(', ')}</p>` : ''}
        </div>
      `).join('');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Content Export</title></head>
            <body style="font-family: system-ui, sans-serif; padding: 20px;">
              <h1>Content Export - ${new Date().toLocaleDateString()}</h1>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
    onClose();
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'csv': return <FileSpreadsheet className="w-4 h-4" />;
      case 'json': return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Export Posts</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {posts.map(post => (
            <div 
              key={post.id}
              onClick={() => togglePost(post.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedPosts.has(post.id) 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              {/* Selection indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                selectedPosts.has(post.id) 
                  ? 'border-emerald-500 bg-emerald-500' 
                  : 'border-muted-foreground'
              }`}>
                {selectedPosts.has(post.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              
              {/* Image thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                  {getPlatformIcon(post.platform, 'w-3 h-3 text-white')}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">
                    {post.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                  <span>
                    {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      🏷️ {post.hashtags.length}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-2">{post.caption || post.title}</p>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No posts to export</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {selectedPosts.size} Posts selected
          </span>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {getFormatIcon()}
                  {exportFormat.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setExportFormat('pdf')}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportFormat('csv')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportFormat('json')}>
                  <FileText className="w-4 h-4 mr-2" />
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={selectedPosts.size === 0}
            >
              <Download className="w-4 h-4" />
              Download file
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPostsModal;
