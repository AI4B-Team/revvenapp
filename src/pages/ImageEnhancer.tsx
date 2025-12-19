import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Upload, Trash2, 
  Loader2, Download, Sparkles, Wand2,
  CheckCircle2, Clock, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// DEMO MODE - Set to true to use mock data instead of real API calls
const DEMO_MODE = true;

const MOCK_HISTORY: UsageRecord[] = [
  {
    id: 'mock-1',
    app_name: 'image_enhancer',
    input_audio_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    output_audio_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200',
    settings: {},
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock-2',
    app_name: 'image_enhancer',
    input_audio_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    output_audio_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
    settings: {},
    status: 'completed',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

interface UsageRecord {
  id: string;
  app_name: string;
  input_audio_url: string | null;
  output_audio_url: string | null;
  settings: any;
  status: string;
  created_at: string;
}

export default function ImageEnhancer() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>(DEMO_MODE ? MOCK_HISTORY : []);
  const [selectedRecord, setSelectedRecord] = useState<UsageRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'image_enhancer')
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

  const handleEnhance = async () => {
    if (!imageFile) {
      toast.error('Please upload an image');
      return;
    }

    setIsProcessing(true);

    try {
      if (DEMO_MODE) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Use a higher resolution version as mock output
        const mockOutputUrl = imageUrl?.replace('w=400', 'w=1200') || imageUrl;
        setOutputUrl(mockOutputUrl);
        
        // Add to mock history
        const newRecord: UsageRecord = {
          id: `mock-${Date.now()}`,
          app_name: 'image_enhancer',
          input_audio_url: imageUrl,
          output_audio_url: mockOutputUrl,
          settings: {},
          status: 'completed',
          created_at: new Date().toISOString()
        };
        setUsageHistory(prev => [newRecord, ...prev]);
        
        toast.success('Image enhanced successfully! (Demo Mode)');
        setIsProcessing(false);
        return;
      }

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

      toast.info('Enhancing image with AI...', { duration: 30000 });

      // Call the enhance-image edge function
      const { data, error } = await supabase.functions.invoke('enhance-image', {
        body: { image_url: uploadData.secure_url }
      });

      if (error) throw new Error(error.message || 'Failed to enhance image');
      if (!data?.image_url) throw new Error('No image URL returned');

      // Save to database
      await supabase.from('audio_app_usage').insert({
        user_id: user.id,
        app_name: 'image_enhancer',
        input_audio_url: uploadData.secure_url,
        output_audio_url: data.image_url,
        settings: {},
        status: 'completed'
      });

      setOutputUrl(data.image_url);
      toast.success('Image enhanced successfully!');

      // Refresh history
      const { data: history } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'image_enhancer')
        .order('created_at', { ascending: false })
        .limit(20);

      if (history) setUsageHistory(history);

    } catch (error: any) {
      toast.error(error.message || 'Failed to enhance image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (DEMO_MODE) {
      setUsageHistory(prev => prev.filter(r => r.id !== recordId));
      setSelectedRecord(null);
      toast.success('Record deleted (Demo Mode)');
      return;
    }
    
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
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Animated Background */}
          <div className={`fixed inset-0 pointer-events-none overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
            <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Wand2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Image Enhancer
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Improve image details with AI
                  </p>
                </div>
              </div>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['Detail Enhancement', 'Color Correction', 'Noise Reduction', 'Sharpening'].map((feature) => (
                  <span key={feature} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm border border-amber-500/20">
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
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Upload Image</h2>
                      <p className="text-sm text-muted-foreground">Select an image to enhance</p>
                    </div>
                  </div>
                  
                  {!imageUrl ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-10 border-2 border-dashed border-amber-500/30 rounded-2xl hover:border-amber-500/60 hover:bg-amber-500/5 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-lg font-medium text-foreground block">Drop image here or click to upload</span>
                          <span className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20">
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
                    onClick={handleEnhance}
                    disabled={isProcessing || !imageFile}
                    className="w-full mt-6 h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 rounded-2xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enhancing Image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Enhance Image
                      </>
                    )}
                  </Button>
                </div>

                {/* Output Card */}
                {outputUrl && (
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl p-8 border border-amber-500/30 shadow-xl animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-amber-400">Image Enhanced</h2>
                        <p className="text-sm text-muted-foreground">Your improved image is ready</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Original</p>
                        <img src={imageUrl!} alt="Original" className="w-full h-48 object-contain rounded-xl bg-muted/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Enhanced</p>
                        <img src={outputUrl} alt="Enhanced" className="w-full h-48 object-contain rounded-xl bg-muted/50" />
                      </div>
                    </div>
                    
                    <a
                      href={outputUrl}
                      download="enhanced-image.png"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Image
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
                      <p className="text-muted-foreground text-sm">No enhanced images yet</p>
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
                            <img src={record.output_audio_url} alt="Result" className="w-12 h-12 object-cover rounded-lg" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Enhanced
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord(record.id);
                              }}
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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-xl">Enhanced Image Details</span>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Created on {selectedRecord && new Date(selectedRecord.created_at).toLocaleString()}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 mt-4">
              {/* Images Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Original Image</h3>
                  {selectedRecord.input_audio_url ? (
                    <img 
                      src={selectedRecord.input_audio_url} 
                      alt="Original" 
                      className="w-full rounded-xl border border-border/50 bg-muted/20"
                    />
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-muted/50 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Enhanced Image */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Enhanced Image</h3>
                  {selectedRecord.output_audio_url ? (
                    <img 
                      src={selectedRecord.output_audio_url} 
                      alt="Enhanced" 
                      className="w-full rounded-xl border border-amber-500/30 bg-muted/20"
                    />
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-muted/50 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Enhancement Type</p>
                  <p className="font-medium">AI Enhancement</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium capitalize flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {selectedRecord.status}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedRecord.output_audio_url && (
                  <a
                    href={selectedRecord.output_audio_url}
                    download="enhanced-image.png"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Enhanced Image
                  </a>
                )}
                <button
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  className="px-5 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
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
