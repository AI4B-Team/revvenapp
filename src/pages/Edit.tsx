import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import ImageEditingCanvas from "@/components/dashboard/ImageEditingCanvas";

const Edit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const image = location.state?.imageUrl || undefined;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Edit');

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = () => {
    navigate("/create");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <main className="flex-1 overflow-hidden">
          <ImageEditingCanvas
            image={image}
            onClose={handleClose}
            onSave={handleSave}
          />
        </main>
      </div>
    </div>
  );
};

export default Edit;
