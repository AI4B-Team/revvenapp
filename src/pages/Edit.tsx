import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import ImageEditingCanvas from "@/components/dashboard/ImageEditingCanvas";
import VideoEditingCanvas from "@/components/dashboard/VideoEditingCanvas";
import { Music } from "lucide-react";

const Edit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const image = location.state?.imageUrl || undefined;
  const videoUrl = location.state?.videoUrl || undefined;
  const initialEditorTab = location.state?.editorTab || 'image';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Edit');
  const [editorTab, setEditorTab] = useState<'image' | 'video' | 'audio'>(initialEditorTab);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = () => {
    navigate("/create");
  };

  const handleEditorTabChange = (tab: 'image' | 'video' | 'audio') => {
    setEditorTab(tab);
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 min-h-0 overflow-hidden">
          {editorTab === 'image' && (
            <ImageEditingCanvas
              image={image}
              onClose={handleClose}
              onSave={handleSave}
              onTabChange={handleEditorTabChange}
              activeEditorTab={editorTab}
            />
          )}
          {editorTab === 'video' && (
            <VideoEditingCanvas
              video={videoUrl}
              onClose={handleClose}
              onSave={handleSave}
              onTabChange={handleEditorTabChange}
              activeEditorTab={editorTab}
            />
          )}
          {editorTab === 'audio' && (
            <div className="flex items-center justify-center h-full bg-slate-50">
              <div className="text-center text-slate-500">
                <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Audio Editor</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Edit;
