import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Check, Loader2, Users, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Newsletter = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  
  // Unsubscribe state
  const [unsubEmail, setUnsubEmail] = useState('');
  const [isUnsubLoading, setIsUnsubLoading] = useState(false);
  const [unsubscribeMessage, setUnsubscribeMessage] = useState('');
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // Send data directly to webhook via edge function
      const { data, error } = await supabase.functions.invoke('send-newsletter-email', {
        body: { 
          email: email.toLowerCase(), 
          name: name || '', 
          type: 'subscribe' 
        }
      });

      if (error) throw error;

      setSubscribeMessage(data?.message || 'Subscription processed');
      setIsSubscribed(true);
      
      if (data?.success) {
        toast.success('Successfully subscribed to the newsletter!');
      } else {
        toast.info(data?.message || 'Subscription processed');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
      setSubscribeMessage('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unsubEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsUnsubLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter-email', {
        body: { 
          email: unsubEmail.toLowerCase(), 
          name: '', 
          type: 'unsubscribe' 
        }
      });

      if (error) throw error;

      setUnsubscribeMessage(data?.message || 'Unsubscribe processed');
      setIsUnsubscribed(true);
      
      if (data?.success) {
        toast.success('You have been unsubscribed from the newsletter.');
      } else {
        toast.info(data?.message || 'Unsubscribe processed');
      }
    } catch (error: any) {
      console.error('Unsubscribe error:', error);
      toast.error('Failed to unsubscribe. Please try again.');
      setUnsubscribeMessage('Failed to unsubscribe. Please try again.');
    } finally {
      setIsUnsubLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, title: 'AI-Powered Content', description: 'Get curated content powered by artificial intelligence' },
    { icon: Send, title: 'Weekly Updates', description: 'Receive the latest news and updates every week' },
    { icon: Users, title: 'Community Access', description: 'Join a growing community of subscribers' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Job Newsletter</h1>
              <p className="text-sm text-muted-foreground">Stay updated with the latest</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the latest updates, exclusive content, and insider tips delivered straight to your inbox.
          </p>
        </div>

        {/* Subscription Card */}
        <Card className="mb-12 border-2 border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join the Community</CardTitle>
            <CardDescription>
              No spam, unsubscribe anytime. We respect your privacy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubscribed ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Response</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {subscribeMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4 max-w-md mx-auto">
                <div>
                  <Input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 hover:bg-card transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unsubscribe Section */}
        <Card className="border border-border bg-card/30">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-muted-foreground">Want to unsubscribe?</CardTitle>
            <CardDescription>
              Enter your email below to unsubscribe from the newsletter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unsubscribeMessage ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground whitespace-pre-line">
                  {unsubscribeMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={unsubEmail}
                  onChange={(e) => setUnsubEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={isUnsubLoading}
                >
                  {isUnsubLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Unsubscribe'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Newsletter;
