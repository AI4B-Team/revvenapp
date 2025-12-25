import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import FileFormatIcons from '@/components/ui/FileFormatIcons';

interface EditorImagePanelProps {
  onSelectImage?: (imageUrl: string, thumbnailUrl: string) => void;
  onOpenReferences?: () => void;
}

const EditorImagePanel: React.FC<EditorImagePanelProps> = ({ onSelectImage, onOpenReferences }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      toast.success(`Uploaded ${file.name}`);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        toast.success(`Uploaded ${file.name}`);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Click To Upload Section */}
      <div 
        className={`bg-white rounded-xl p-8 text-center transition-all cursor-pointer border-2 border-dashed ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-400 hover:bg-emerald-50 hover:border-emerald-500'
        }`}
        onClick={() => onOpenReferences ? onOpenReferences() : fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="w-8 h-8 text-emerald-500 mb-1" />
          <span className="text-gray-900 font-semibold text-lg">Click To Upload</span>
          <p className="text-gray-500 text-sm">or, drag and drop a file here</p>
          
          <FileFormatIcons />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default EditorImagePanel;