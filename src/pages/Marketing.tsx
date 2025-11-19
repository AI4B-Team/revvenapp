import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Share2, Send, DollarSign, Target, Calendar } from 'lucide-react';

const Marketing = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">MARKETING</h1>
            <p className="text-muted-foreground text-lg">
              Create and manage your marketing campaigns across multiple channels. Build engaging content, track performance, and grow your audience.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
            >
              <Share2 className="h-6 w-6" />
              <span>Social</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
            >
              <Send className="h-6 w-6" />
              <span>Emails</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
            >
              <DollarSign className="h-6 w-6" />
              <span>Ads</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
            >
              <Target className="h-6 w-6" />
              <span>Campaign</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
            >
              <Calendar className="h-6 w-6" />
              <span>Calendar</span>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Marketing;
