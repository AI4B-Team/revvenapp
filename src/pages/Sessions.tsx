import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import SessionsApp from "@/components/dashboard/SessionsApp";

const Sessions = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto bg-background">
          {/* Page Header */}
          <div className="px-8 py-6 border-b border-border">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/apps")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Sessions</h1>
                <p className="text-sm text-muted-foreground">Record and manage your creative sessions</p>
              </div>
            </div>
          </div>

          {/* Sessions Content */}
          <div className="flex-1 overflow-hidden">
            <SessionsApp standalone />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sessions;
