import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AIVASidePanel from '@/components/dashboard/AIVASidePanel';
import { 
  ArrowLeft, Upload, Trash2, 
  Loader2, Download, Sparkles, Scissors,
  CheckCircle2, Clock, Image as ImageIcon, X, Calendar, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { removeBackground } from '@/utils/backgroundRemoval';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UsageRecord {
  id: string;
  app_name: string;
  input_audio_url: string | null;
  output_audio_url: string | null;
  settings: any;
  status: string;
  created_at: string;
}

export default function BackgroundRemover() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIVAPanelOpen, setIsAIVAPanelOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<UsageRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'background_remover')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setUsageHistory(data);
      }
    };

    fetchHistory();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setOutputUrl(null);
    }
  };

  const handleRemoveBackground = async () => {
    if (!imageFile) {
      toast.error('Please upload an image');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to Cloudinary first
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'revven');

      const uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/dszt275xv/image/upload',
        { method: 'POST', body: formData }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) throw new Error('Upload failed');

      toast.info('Removing background with AI...', { duration: 10000 });

      // Call the remove-background function
      const result = await removeBackground(uploadData.secure_url);

      // Save to database
      await supabase.from('audio_app_usage').insert({
        user_id: user.id,
        app_name: 'background_remover',
        input_audio_url: uploadData.secure_url,
        output_audio_url: result,
        settings: {},
        status: 'completed'
      });

      setOutputUrl(result);
      toast.success('Background removed successfully!');

      // Refresh history
      const { data: history } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'background_remover')
        .order('created_at', { ascending: false })
        .limit(20);

      if (history) setUsageHistory(history);

    } catch (error: any) {
      toast.error(error.message || 'Failed to remove background');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRecord = async (recordId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const { error } = await supabase
        .from('audio_app_usage')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      setUsageHistory(prev => prev.filter(r => r.id !== recordId));
      setSelectedRecord(null);
      toast.success('Record deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar 
        onCollapseChange={setIsSidebarCollapsed}
        onAIVAPanelToggle={() => setIsAIVAPanelOpen(!isAIVAPanelOpen)}
        isAIVAPanelOpen={isAIVAPanelOpen}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Animated Background */}
          <div className={`fixed inset-0 pointer-events-none overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
            <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/create')}
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-all"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Create</span>
            </button>

            {/* Hero Header */}
            <div className="mb-10">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Scissors className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Background Remover
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Remove backgrounds instantly with AI
                  </p>
                </div>
              </div>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['Instant Removal', 'High Quality', 'Transparent PNG', 'Any Image'].map((feature) => (
                  <span key={feature} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm border border-purple-500/20">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Card */}
                <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Upload Image</h2>
                      <p className="text-sm text-muted-foreground">Select an image to remove background</p>
                    </div>
                  </div>
                  
                  {!imageUrl ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-10 border-2 border-dashed border-purple-500/30 rounded-2xl hover:border-purple-500/60 hover:bg-purple-500/5 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-lg font-medium text-foreground block">Drop image here or click to upload</span>
                          <span className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="p-5 bg-purple-500/5 rounded-2xl border border-purple-500/20">
                      <div className="flex items-start gap-4">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{imageFile?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {imageFile && `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setImageFile(null);
                            setImageUrl(null);
                            setOutputUrl(null);
                          }}
                          className="p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing || !imageFile}
                    className="w-full mt-6 h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25 rounded-2xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Remove Background
                      </>
                    )}
                  </Button>
                </div>

                {/* Output Card */}
                {outputUrl && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-purple-500/30 shadow-xl animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-purple-400">Background Removed</h2>
                        <p className="text-sm text-muted-foreground">Your image is ready to download</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Original</p>
                        <img src={imageUrl!} alt="Original" className="w-full h-48 object-contain rounded-xl bg-muted/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Result</p>
                        <div className="w-full h-48 rounded-xl bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3QgZmlsbD0iI2VlZSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2VlZSIgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCBmaWxsPSIjY2NjIiB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2NjYyIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjwvc3ZnPg==')] flex items-center justify-center">
                          <img src={outputUrl} alt="Result" className="max-w-full max-h-full object-contain" />
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href={outputUrl}
                      download="background-removed.png"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download PNG
                    </a>
                  </div>
                )}
              </div>

              {/* History Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-6 border border-border/50 shadow-xl sticky top-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <h2 className="text-lg font-semibold">Recent</h2>
                  </div>
                  
                  {usageHistory.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">No processed images yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {usageHistory.map((record) => (
                        <div 
                          key={record.id} 
                          onClick={() => setSelectedRecord(record)}
                          className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors group cursor-pointer"
                        >
                          {record.output_audio_url && (
                            <div className="relative">
                              <img src={record.output_audio_url} alt="Result" className="w-12 h-12 object-cover rounded-lg" />
                              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {record.status === 'completed' ? 'Completed' : 'Failed'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {record.output_audio_url && (
                              <a
                                href={record.output_audio_url}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-lg hover:bg-background/50"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={(e) => handleDeleteRecord(record.id, e)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Image Details Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              Background Removal Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6 mt-4">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedRecord.status === 'completed' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {selectedRecord.status === 'completed' ? 'Completed' : 'Failed'}
                </span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedRecord.created_at).toLocaleString()}
                </div>
              </div>

              {/* Images Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                {selectedRecord.input_audio_url && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Original Image</h3>
                    <div className="rounded-xl overflow-hidden bg-muted/50 border border-border">
                      <img 
                        src={selectedRecord.input_audio_url} 
                        alt="Original" 
                        className="w-full h-auto object-contain max-h-[400px]"
                      />
                    </div>
                  </div>
                )}

                {/* Result Image */}
                {selectedRecord.output_audio_url && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Result (Background Removed)</h3>
                    <div className="rounded-xl overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3QgZmlsbD0iI2VlZSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2VlZSIgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCBmaWxsPSIjY2NjIiB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2NjYyIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjwvc3ZnPg==')] border border-border">
                      <img 
                        src={selectedRecord.output_audio_url} 
                        alt="Result" 
                        className="w-full h-auto object-contain max-h-[400px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {selectedRecord.output_audio_url && (
                  <a
                    href={selectedRecord.output_audio_url}
                    download="background-removed.png"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download PNG
                  </a>
                )}
                <button
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  className="px-5 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
