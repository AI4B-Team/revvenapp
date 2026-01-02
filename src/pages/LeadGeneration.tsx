import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { Users, MapPin, Mail, Hash, Globe, Target, Settings, Loader2 } from 'lucide-react';

const LeadGeneration = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://realcreator.app.n8n.cloud/webhook-test/d60a49d5-8173-43ba-be68-9e66d64541a6');
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
      toast.error('Please enter your n8n webhook URL first');
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

      console.log('Sending to n8n webhook:', payload);

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      toast.success('Lead generation started! Check your email for results.');
      
      // Reset form
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
      toast.error('Failed to start lead generation. Please check your webhook URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">AI Lead Generation Agent</h1>
              <p className="text-muted-foreground">
                Generate high-quality leads from multiple platforms using AI-powered scraping
              </p>
            </div>


            {/* Lead Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Leads</CardTitle>
                <CardDescription>
                  Fill in the details below to start generating leads from your selected platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Location/Region *
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Pattaya Thailand, New York, London"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Your Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Results will be sent to this email</p>
                  </div>

                  {/* Number of Leads */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfLeads" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      Number of Leads *
                    </Label>
                    <Input
                      id="numberOfLeads"
                      type="number"
                      placeholder="e.g., 100, 500, 1000"
                      min="1"
                      max="10000"
                      value={formData.numberOfLeads}
                      onChange={(e) => setFormData({ ...formData, numberOfLeads: e.target.value })}
                      required
                    />
                  </div>

                  {/* Platform */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      Platform *
                    </Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) => setFormData({ ...formData, platform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Google Maps">
                          <div className="flex items-center gap-2">
                            <span>📍</span> Google Maps
                          </div>
                        </SelectItem>
                        <SelectItem value="LinkedIn">
                          <div className="flex items-center gap-2">
                            <span>💼</span> LinkedIn
                          </div>
                        </SelectItem>
                        <SelectItem value="Facebook">
                          <div className="flex items-center gap-2">
                            <span>📘</span> Facebook
                          </div>
                        </SelectItem>
                        <SelectItem value="Instagram">
                          <div className="flex items-center gap-2">
                            <span>📸</span> Instagram
                          </div>
                        </SelectItem>
                        <SelectItem value="Website">
                          <div className="flex items-center gap-2">
                            <span>🌐</span> Website
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="keywords" className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Target Industry/Keywords *
                    </Label>
                    <Input
                      id="keywords"
                      placeholder="e.g., Real estate agency, Photography, Restaurants"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      required
                    />
                  </div>

                  {/* Website URL (conditional) */}
                  {formData.platform === 'Website' && (
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Website URL *
                      </Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        placeholder="https://example.com"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        required={formData.platform === 'Website'}
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading || !webhookUrl}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Leads...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Generate Leads
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">📍</div>
                <div className="text-xs text-muted-foreground">Google Maps</div>
                <div className="text-sm font-medium">Business Data</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">💼</div>
                <div className="text-xs text-muted-foreground">LinkedIn</div>
                <div className="text-sm font-medium">Professional Leads</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">📘</div>
                <div className="text-xs text-muted-foreground">Facebook</div>
                <div className="text-sm font-medium">Social Leads</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl mb-1">📸</div>
                <div className="text-xs text-muted-foreground">Instagram</div>
                <div className="text-sm font-medium">Creator Leads</div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadGeneration;
