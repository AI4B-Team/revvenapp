import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import ImageEditingCanvas from "@/components/dashboard/ImageEditingCanvas";
import VideoEditingCanvas from "@/components/dashboard/VideoEditingCanvas";
import { Image, Video, Music } from "lucide-react";

const Edit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const image = location.state?.imageUrl || undefined;
  const videoUrl = location.state?.videoUrl || undefined;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Edit');
  const [editorTab, setEditorTab] = useState<'image' | 'video' | 'audio'>('image');

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
        
        {/* Editor Type Tabs */}
        <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
          <button
            onClick={() => { console.log('Switching to image'); setEditorTab('image'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              editorTab === 'image' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Image className="w-4 h-4" />
            Image
          </button>
          <button
            onClick={() => { console.log('Switching to video'); setEditorTab('video'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              editorTab === 'video' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
          <button
            onClick={() => { console.log('Switching to audio'); setEditorTab('audio'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              editorTab === 'audio' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Music className="w-4 h-4" />
            Audio
          </button>
          <span className="ml-4 text-xs text-slate-400">Current: {editorTab}</span>
        </div>
        
        <main className="flex-1 overflow-hidden">
          {editorTab === 'image' && (
            <ImageEditingCanvas
              image={image}
              onClose={handleClose}
              onSave={handleSave}
            />
          )}
          {editorTab === 'video' && (
            <VideoEditingCanvas
              video={videoUrl}
              onClose={handleClose}
              onSave={handleSave}
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
