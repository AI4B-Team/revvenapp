import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Share2, Send, DollarSign, Target, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import BestTimeToPostModal from '@/components/dashboard/BestTimeToPostModal';

const Marketing = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPostingScheduleOpen, setIsPostingScheduleOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isMonetizePage={true} onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">MARKETING</h1>
            <p className="text-muted-foreground text-lg">
              Create and manage your marketing campaigns across multiple channels. Build engaging content, track performance, and grow your audience.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent border-emerald-500/50 hover:border-emerald-500"
              onClick={() => setIsPostingScheduleOpen(true)}
            >
              <Clock className="h-6 w-6 text-emerald-500" />
              <span>Posting Schedule</span>
            </Button>
          </div>
        </main>
      </div>
      
      <BestTimeToPostModal 
        isOpen={isPostingScheduleOpen} 
        onClose={() => setIsPostingScheduleOpen(false)} 
      />
    </div>
  );
};

export default Marketing;
