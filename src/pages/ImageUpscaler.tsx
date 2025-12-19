import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  ArrowLeft, Upload, Trash2, 
  Loader2, Download, Sparkles, ZoomIn,
  CheckCircle2, Clock, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UsageRecord {
  id: string;
  app_name: string;
  input_audio_url: string | null;
  output_audio_url: string | null;
  settings: any;
  status: string;
  created_at: string;
}

export default function ImageUpscaler() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [upscaleFactor, setUpscaleFactor] = useState(2);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'image_upscaler')
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

  const handleUpscale = async () => {
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

      toast.info('Upscaling image with AI...', { duration: 15000 });

      // Call the upscale-image edge function
      const { data, error } = await supabase.functions.invoke('upscale-image', {
        body: { image_url: uploadData.secure_url, scale_factor: upscaleFactor }
      });

      if (error) throw new Error(error.message || 'Failed to upscale image');
      if (!data?.image_url) throw new Error('No image URL returned');

      // Save to database
      await supabase.from('audio_app_usage').insert({
        user_id: user.id,
        app_name: 'image_upscaler',
        input_audio_url: uploadData.secure_url,
        output_audio_url: data.image_url,
        settings: { scale_factor: upscaleFactor },
        status: 'completed'
      });

      setOutputUrl(data.image_url);
      toast.success('Image upscaled successfully!');

      // Refresh history
      const { data: history } = await supabase
        .from('audio_app_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_name', 'image_upscaler')
        .order('created_at', { ascending: false })
        .limit(20);

      if (history) setUsageHistory(history);

    } catch (error: any) {
      toast.error(error.message || 'Failed to upscale image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('audio_app_usage')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      setUsageHistory(prev => prev.filter(r => r.id !== recordId));
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
            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <ZoomIn className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Image Upscaler
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Enhance image resolution with AI
                  </p>
                </div>
              </div>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['2x Upscale', '4x Upscale', 'AI Enhanced', 'High Quality'].map((feature) => (
                  <span key={feature} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
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
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Upload Image</h2>
                      <p className="text-sm text-muted-foreground">Select an image to upscale</p>
                    </div>
                  </div>
                  
                  {!imageUrl ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-10 border-2 border-dashed border-blue-500/30 rounded-2xl hover:border-blue-500/60 hover:bg-blue-500/5 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-lg font-medium text-foreground block">Drop image here or click to upload</span>
                          <span className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/20">
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

                  {/* Scale Factor Selector */}
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3">Upscale Factor</p>
                    <div className="flex gap-3">
                      {[2, 4].map((factor) => (
                        <button
                          key={factor}
                          onClick={() => setUpscaleFactor(factor)}
                          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                            upscaleFactor === factor
                              ? 'bg-blue-500 text-white'
                              : 'bg-secondary hover:bg-secondary/80 text-foreground'
                          }`}
                        >
                          {factor}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleUpscale}
                    disabled={isProcessing || !imageFile}
                    className="w-full mt-6 h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-500/25 rounded-2xl"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Upscaling Image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Upscale {upscaleFactor}x
                      </>
                    )}
                  </Button>
                </div>

                {/* Output Card */}
                {outputUrl && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 border border-blue-500/30 shadow-xl animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-blue-400">Image Upscaled</h2>
                        <p className="text-sm text-muted-foreground">Your enhanced image is ready</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Original</p>
                        <img src={imageUrl!} alt="Original" className="w-full h-48 object-contain rounded-xl bg-muted/50" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Upscaled {upscaleFactor}x</p>
                        <img src={outputUrl} alt="Upscaled" className="w-full h-48 object-contain rounded-xl bg-muted/50" />
                      </div>
                    </div>
                    
                    <a
                      href={outputUrl}
                      download="upscaled-image.png"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
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
                      <p className="text-muted-foreground text-sm">No upscaled images yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {usageHistory.map((record) => (
                        <div key={record.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors group">
                          {record.output_audio_url && (
                            <img src={record.output_audio_url} alt="Result" className="w-12 h-12 object-cover rounded-lg" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {record.settings?.scale_factor || 2}x Upscale
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
                                className="p-2 rounded-lg hover:bg-background/50"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
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
    </div>
  );
}
