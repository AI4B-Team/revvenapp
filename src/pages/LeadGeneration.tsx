import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, MapPin, Mail, Hash, Globe, Target, Loader2, Sparkles, Zap, Download, Trash2, FileSpreadsheet, Clock, History, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaLinkedinIn, FaFacebookF, FaInstagram, FaGlobe } from 'react-icons/fa';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface LeadHistoryItem {
  id: string;
  location: string;
  platform: string;
  keywords: string | null;
  num_leads: number;
  file_name: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

const LeadGeneration = () => {
  const [searchParams] = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<LeadHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [webhookUrl] = useState('https://realcreator.app.n8n.cloud/webhook-test/d60a49d5-8173-43ba-be68-9e66d64541a6');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    email: '',
    numberOfLeads: '',
    platform: '',
    keywords: '',
    websiteUrl: ''
  });

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('lead_generation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!webhookUrl) {
      toast.error('Webhook URL not configured');
      return;
    }

    if (!formData.location || !formData.email || !formData.numberOfLeads || !formData.platform || !formData.keywords) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.platform === 'Website' && !formData.websiteUrl) {
      toast.error('Please enter the website URL for website scraping');
      return;
    }

    setIsLoading(true);

    try {
      // Collect URL query parameters
      const formQueryParameters: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        formQueryParameters[key] = value;
      });

      const payload = {
        location: formData.location,
        email: formData.email,
        numLeads: parseInt(formData.numberOfLeads),
        platform: formData.platform,
        keywords: formData.keywords,
        websiteUrl: formData.websiteUrl || '',
        'Location/Region': formData.location,
        'Your Email': formData.email,
        'Number of Leads': parseInt(formData.numberOfLeads),
        'Platform': formData.platform,
        'Target Industry/Keywords': formData.keywords,
        'Website URL (if Website selected)': formData.websiteUrl || '',
        submittedAt: new Date().toISOString(),
        formMode: 'production',
        formQueryParameters
      };

      const { data, error } = await supabase.functions.invoke('lead-generation-webhook', {
        body: { webhookUrl, payload }
      });

      if (error) {
        throw error;
      }

      if (data?.fileUrl) {
        toast.success('Leads generated! File saved to history.');
        // Refresh history to show new file
        fetchHistory();
      } else {
        toast.success('Lead generation started! Check your email for results.');
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast.error('Failed to start lead generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string, fileName: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('lead-files')
        .remove([fileName]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from history table
      const { error: dbError } = await supabase
        .from('lead_generation_history')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success('File deleted successfully');
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handlePreview = async (fileUrl: string, fileName: string) => {
    setIsLoadingPreview(true);
    setPreviewOpen(true);
    try {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1, 101) as string[][]; // Limit to 100 rows for preview
        setPreviewData({ headers, rows, fileName });
      } else {
        setPreviewData({ headers: [], rows: [], fileName });
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load file preview');
      setPreviewOpen(false);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formFields = [
    { id: 'location', icon: MapPin, label: 'Location/Region', placeholder: 'e.g., Pattaya Thailand, New York, London', type: 'text' },
    { id: 'email', icon: Mail, label: 'Your Email', placeholder: 'your@email.com', type: 'email', helper: 'Results will be sent to this email' },
    { id: 'numberOfLeads', icon: Hash, label: 'Number of Leads', placeholder: 'e.g., 100, 500, 1000', type: 'number' },
  ];

  const platforms = [
    { value: 'Google Maps', icon: FaGoogle, color: '#4285F4', label: 'Google Maps', description: 'Business Data' },
    { value: 'LinkedIn', icon: FaLinkedinIn, color: '#0A66C2', label: 'LinkedIn', description: 'Professional Leads' },
    { value: 'Facebook', icon: FaFacebookF, color: '#1877F2', label: 'Facebook', description: 'Social Leads' },
    { value: 'Instagram', icon: FaInstagram, color: '#E4405F', label: 'Instagram', description: 'Creator Leads' },
    { value: 'Website', icon: FaGlobe, color: '#6366F1', label: 'Website', description: 'Website Scraping' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Animated background gradient */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-primary/5 blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-primary/3 blur-3xl"
              animate={{
                x: [0, -100, 0],
                y: [0, -50, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Header with animations */}
            <motion.div 
              className="mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4 relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/10"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Users className="h-10 w-10 text-primary relative z-10" />
              </motion.div>
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                AI Lead Generation Agent
              </motion.h1>
              <motion.p 
                className="text-muted-foreground flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Generate high-quality leads from multiple platforms
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Generate Leads
                    </CardTitle>
                    <CardDescription>
                      Fill in the details below to start generating leads from your selected platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Animated form fields */}
                      {formFields.map((field, index) => (
                        <motion.div 
                          key={field.id}
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <Label htmlFor={field.id} className="flex items-center gap-2 text-sm">
                            <field.icon className="h-4 w-4 text-primary" />
                            {field.label} *
                          </Label>
                          <Input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            min={field.type === 'number' ? 1 : undefined}
                            max={field.type === 'number' ? 10000 : undefined}
                            value={formData[field.id as keyof typeof formData]}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                          />
                          {field.helper && (
                            <p className="text-xs text-muted-foreground">{field.helper}</p>
                          )}
                        </motion.div>
                      ))}

                      {/* Platform Selection */}
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Label className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-primary" />
                          Platform *
                        </Label>
                        <Select
                          value={formData.platform}
                          onValueChange={(value) => setFormData({ ...formData, platform: value })}
                        >
                          <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {platforms.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                <div className="flex items-center gap-2">
                                  <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                                  {platform.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      {/* Keywords */}
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Label htmlFor="keywords" className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-primary" />
                          Target Industry/Keywords *
                        </Label>
                        <Input
                          id="keywords"
                          placeholder="e.g., Real estate agency, Photography"
                          value={formData.keywords}
                          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          required
                        />
                      </motion.div>

                      {/* Website URL (conditional) */}
                      <AnimatePresence>
                        {formData.platform === 'Website' && (
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Label htmlFor="websiteUrl" className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-primary" />
                              Website URL *
                            </Label>
                            <Input
                              id="websiteUrl"
                              type="url"
                              placeholder="https://example.com"
                              value={formData.websiteUrl}
                              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              required={formData.platform === 'Website'}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full relative overflow-hidden group" 
                          size="lg"
                          disabled={isLoading}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Generating Leads...
                            </>
                          ) : (
                            <>
                              <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                              Generate Leads
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* History Section */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Generated Files
                    </CardTitle>
                    <CardDescription>
                      Download or manage your generated lead files
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No files generated yet</p>
                        <p className="text-sm">Generated files will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {history.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.file_name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{item.platform}</span>
                                  <span>•</span>
                                  <span>{item.location}</span>
                                  <span>•</span>
                                  <span>{formatFileSize(item.file_size)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(item.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePreview(item.file_url, item.file_name)}
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownload(item.file_url, item.file_name)}
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item.id, item.file_name)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Platform Cards */}
            <motion.div 
              className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className={`text-center p-4 cursor-pointer transition-all duration-300 border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${formData.platform === platform.value ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setFormData({ ...formData, platform: platform.value })}
                  >
                    <motion.div 
                      className="flex items-center justify-center mb-2"
                      animate={formData.platform === platform.value ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <platform.icon className="h-8 w-8" style={{ color: platform.color }} />
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{platform.label}</div>
                    <div className="text-sm font-medium">{platform.description}</div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* XLSX Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-[90vh] flex flex-col p-0">
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  {previewData?.fileName || 'File Preview'}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden p-4">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading preview...</span>
                  </div>
                ) : previewData && previewData.headers.length > 0 ? (
                  <div className="h-full overflow-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted z-10">
                        <TableRow>
                          {previewData.headers.map((header, idx) => (
                            <TableHead key={idx} className="font-semibold whitespace-nowrap bg-muted">
                              {header || `Column ${idx + 1}`}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.rows.map((row, rowIdx) => (
                          <TableRow key={rowIdx} className="hover:bg-muted/30">
                            {previewData.headers.map((_, colIdx) => (
                              <TableCell key={colIdx} className="whitespace-nowrap max-w-[300px] truncate">
                                {row[colIdx] ?? ''}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No data found in file</p>
                    </div>
                  </div>
                )}
              </div>
              {previewData && previewData.rows.length >= 100 && (
                <div className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground text-center">
                    Showing first 100 rows. Download the file to see all data.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default LeadGeneration;