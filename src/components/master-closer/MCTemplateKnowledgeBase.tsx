import React, { useState, useRef } from 'react';
import { 
  Plus, 
  FileText, 
  Globe, 
  Type, 
  X, 
  Check, 
  Loader, 
  Trash2, 
  Upload,
  Video,
  Music,
  Book
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'website' | 'text';
  fileType?: 'pdf' | 'audio' | 'video' | 'text';
  content?: string;
  url?: string;
  status: 'training' | 'trained' | 'failed';
  createdAt: Date;
}

interface MCTemplateKnowledgeBaseProps {
  templateId: string;
  templateName: string;
  open: boolean;
  onClose: () => void;
  dataSources: DataSource[];
  onUpdate: (dataSources: DataSource[]) => void;
}

const MCTemplateKnowledgeBase: React.FC<MCTemplateKnowledgeBaseProps> = ({
  templateId,
  templateName,
  open,
  onClose,
  dataSources,
  onUpdate,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'file' | 'website' | 'text' | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataSourceTypes = [
    {
      type: 'file' as const,
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      label: 'Files',
      description: 'PDF, Audio, Video, Text',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400'
    },
    {
      type: 'website' as const,
      icon: <Globe className="w-6 h-6 text-green-600" />,
      label: 'Website',
      description: 'Crawl and extract content',
      color: 'bg-green-50 border-green-200 hover:border-green-400'
    },
    {
      type: 'text' as const,
      icon: <Type className="w-6 h-6 text-orange-600" />,
      label: 'Text',
      description: 'Add custom text content',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400'
    },
  ];

  const getFileType = (file: File): 'pdf' | 'audio' | 'video' | 'text' => {
    const type = file.type;
    if (type === 'application/pdf') return 'pdf';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    return 'text';
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'audio':
        return <Music className="w-5 h-5 text-blue-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (!sourceName) {
        setSourceName(file.name);
      }
    }
  };

  const handleAddSource = () => {
    if (!selectedType || !sourceName.trim()) return;

    const newSource: DataSource = {
      id: `${templateId}-${Date.now()}`,
      name: sourceName,
      type: selectedType,
      status: 'training',
      createdAt: new Date(),
      ...(selectedType === 'website' && { url: websiteUrl }),
      ...(selectedType === 'text' && { content: textContent }),
      ...(selectedType === 'file' && uploadedFile && { fileType: getFileType(uploadedFile) }),
    };

    onUpdate([...dataSources, newSource]);

    // Simulate training completion
    setTimeout(() => {
      onUpdate([...dataSources, { ...newSource, status: 'trained' }]);
    }, 2000);

    resetAddModal();
  };

  const resetAddModal = () => {
    setShowAddModal(false);
    setSelectedType(null);
    setSourceName('');
    setWebsiteUrl('');
    setTextContent('');
    setUploadedFile(null);
  };

  const removeSource = (id: string) => {
    onUpdate(dataSources.filter(s => s.id !== id));
  };

  const getStatusBadge = (status: DataSource['status']) => {
    switch (status) {
      case 'training':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Loader className="w-3 h-3 animate-spin" />
            Training
          </span>
        );
      case 'trained':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            <Check className="w-3 h-3" />
            Ready
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <X className="w-3 h-3" />
            Failed
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border border-border/50 shadow-2xl rounded-2xl [&>button]:hidden">
        {/* Header */}
        <div className="relative p-5 border-b border-border bg-gradient-to-r from-emerald-50 to-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Knowledge Base</h2>
              <p className="text-sm text-muted-foreground">Training data for {templateName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {!showAddModal ? (
            <>
              {/* Add Data Button */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Upload files to train the AI on your brand, products, and services
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Data
                </Button>
              </div>

              {/* Data Sources List */}
              <ScrollArea className="h-[300px]">
                {dataSources.length > 0 ? (
                  <div className="space-y-2">
                    {dataSources.map((source) => (
                      <div 
                        key={source.id} 
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border hover:border-emerald-200 transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          source.type === 'file' ? 'bg-purple-50' :
                          source.type === 'website' ? 'bg-green-50' :
                          'bg-orange-50'
                        }`}>
                          {source.type === 'file' ? getFileIcon(source.fileType) :
                           source.type === 'website' ? <Globe className="w-4 h-4 text-green-600" /> :
                           <Type className="w-4 h-4 text-orange-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{source.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                            {source.url && ` • ${source.url}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(source.status)}
                          <button
                            onClick={() => removeSource(source.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                      <Book className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground mb-1">No Training Data Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                      Add documents, websites, or text to help the AI understand your context
                    </p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Your First Source
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Add Data Form */}
              {!selectedType ? (
                <div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
                  >
                    ← Back
                  </button>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select the type of data you want to add
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {dataSourceTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => setSelectedType(type.type)}
                        className={`p-4 rounded-xl border-2 ${type.color} transition-all text-center`}
                      >
                        <div className="flex justify-center mb-2">
                          {type.icon}
                        </div>
                        <div className="font-medium text-foreground text-sm mb-0.5">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    ← Back
                  </button>

                  {/* Source Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Source Name
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g., Product Documentation"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Type-specific fields */}
                  {selectedType === 'file' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Upload File
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.txt,.doc,.docx,.mp3,.mp4,.wav,.m4a,.webm"
                        className="hidden"
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
                      >
                        {uploadedFile ? (
                          <div className="flex items-center justify-center gap-2">
                            {getFileIcon(getFileType(uploadedFile))}
                            <span className="text-sm font-medium text-foreground">{uploadedFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload PDF, Audio, Video, or Text files
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedType === 'website' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {selectedType === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Text Content
                      </label>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Enter information about your products, services, brand values, etc."
                        rows={6}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={resetAddModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSource}
                      disabled={!sourceName.trim() || 
                        (selectedType === 'file' && !uploadedFile) ||
                        (selectedType === 'website' && !websiteUrl.trim()) ||
                        (selectedType === 'text' && !textContent.trim())
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Add Source
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MCTemplateKnowledgeBase;
