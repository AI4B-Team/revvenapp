import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { Users, MapPin, Mail, Hash, Globe, Target, Loader2, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadGeneration = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl] = useState('https://realcreator.app.n8n.cloud/webhook-test/d60a49d5-8173-43ba-be68-9e66d64541a6');
  const [formData, setFormData] = useState({
    location: '',
    email: '',
    numberOfLeads: '',
    platform: '',
    keywords: '',
    websiteUrl: ''
  });

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
      const payload = {
        'Location/Region': formData.location,
        'Your Email': formData.email,
        'Number of Leads': parseInt(formData.numberOfLeads),
        'Platform': formData.platform,
        'Target Industry/Keywords': formData.keywords,
        'Website URL (if Website selected)': formData.websiteUrl || '',
        submittedAt: new Date().toISOString(),
        formMode: 'production'
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      toast.success('Lead generation started! Check your email for results.');
      
      setFormData({
        location: '',
        email: '',
        numberOfLeads: '',
        platform: '',
        keywords: '',
        websiteUrl: ''
      });
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast.error('Failed to start lead generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { id: 'location', icon: MapPin, label: 'Location/Region', placeholder: 'e.g., Pattaya Thailand, New York, London', type: 'text' },
    { id: 'email', icon: Mail, label: 'Your Email', placeholder: 'your@email.com', type: 'email', helper: 'Results will be sent to this email' },
    { id: 'numberOfLeads', icon: Hash, label: 'Number of Leads', placeholder: 'e.g., 100, 500, 1000', type: 'number' },
  ];

  const platforms = [
    { value: 'Google Maps', icon: '📍', label: 'Google Maps', description: 'Business Data' },
    { value: 'LinkedIn', icon: '💼', label: 'LinkedIn', description: 'Professional Leads' },
    { value: 'Facebook', icon: '📘', label: 'Facebook', description: 'Social Leads' },
    { value: 'Instagram', icon: '📸', label: 'Instagram', description: 'Creator Leads' },
    { value: 'Website', icon: '🌐', label: 'Website', description: 'Website Scraping' },
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

          <div className="max-w-2xl mx-auto relative z-10">
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

            {/* Main Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Animated form fields */}
                    {formFields.map((field, index) => (
                      <motion.div 
                        key={field.id}
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Label htmlFor={field.id} className="flex items-center gap-2">
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
                      <Label className="flex items-center gap-2">
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
                                <span>{platform.icon}</span> {platform.label}
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
                      <Label htmlFor="keywords" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Target Industry/Keywords *
                      </Label>
                      <Input
                        id="keywords"
                        placeholder="e.g., Real estate agency, Photography, Restaurants"
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
                          <Label htmlFor="websiteUrl" className="flex items-center gap-2">
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

            {/* Platform Cards */}
            <motion.div 
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {platforms.slice(0, 4).map((platform, index) => (
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
                      className="text-3xl mb-2"
                      animate={formData.platform === platform.value ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {platform.icon}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{platform.label}</div>
                    <div className="text-sm font-medium">{platform.description}</div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadGeneration;
