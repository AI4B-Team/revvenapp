import React, { useState } from 'react';
import { Book, Plus, FileText, Globe, Type, X, Check, Loader, Trash2, ExternalLink } from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'website' | 'text';
  content?: string;
  url?: string;
  status: 'training' | 'trained' | 'failed';
  createdAt: Date;
}

interface KnowledgeBasePageProps {
  formData: {
    dataSources: DataSource[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState<'select' | 'details'>('select');
  const [selectedType, setSelectedType] = useState<'file' | 'website' | 'text' | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [includedLinks, setIncludedLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const dataSourceTypes = [
    {
      type: 'file' as const,
      icon: <FileText size={32} className="text-purple-600" />,
      label: 'Files',
      description: 'Upload documents, PDFs, or text files',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      type: 'website' as const,
      icon: <Globe size={32} className="text-green-600" />,
      label: 'Website',
      description: 'Crawl and extract content from URLs',
      color: 'bg-green-50 border-green-200'
    },
    {
      type: 'text' as const,
      icon: <Type size={32} className="text-orange-600" />,
      label: 'Text',
      description: 'Add custom text or information',
      color: 'bg-orange-50 border-orange-200'
    },
  ];

  const handleSelectType = (type: 'file' | 'website' | 'text') => {
    setSelectedType(type);
    setModalStep('details');
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

  const addIncludedLink = () => {
    if (newLink.trim() && !includedLinks.includes(newLink.trim())) {
      setIncludedLinks([...includedLinks, newLink.trim()]);
      setNewLink('');
    }
  };

  const removeIncludedLink = (link: string) => {
    setIncludedLinks(includedLinks.filter(l => l !== link));
  };

  const handleAddSource = () => {
    if (!selectedType || !sourceName.trim()) return;

    const newSource: DataSource = {
      id: Date.now().toString(),
      name: sourceName,
      type: selectedType,
      status: 'training',
      createdAt: new Date(),
      ...(selectedType === 'website' && { url: websiteUrl }),
      ...(selectedType === 'text' && { content: textContent }),
    };

    const currentSources = formData.dataSources || [];
    onUpdate({ dataSources: [...currentSources, newSource] });

    // Simulate training completion
    setTimeout(() => {
      const updatedSources = [...currentSources, { ...newSource, status: 'trained' }];
      onUpdate({ dataSources: updatedSources });
    }, 2000);

    resetModal();
  };

  const resetModal = () => {
    setShowAddModal(false);
    setModalStep('select');
    setSelectedType(null);
    setSourceName('');
    setWebsiteUrl('');
    setIncludedLinks([]);
    setNewLink('');
    setTextContent('');
    setUploadedFile(null);
  };

  const removeSource = (id: string) => {
    const currentSources = formData.dataSources || [];
    onUpdate({ dataSources: currentSources.filter(s => s.id !== id) });
  };

  const getStatusBadge = (status: DataSource['status']) => {
    switch (status) {
      case 'training':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <Loader size={12} className="animate-spin" />
            Training
          </span>
        );
      case 'trained':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <Check size={12} />
            Trained
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <X size={12} />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Book size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-sm text-gray-600">Add data sources to train your AI agents</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Step 3 of 5</span>
            <span>60% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Add Data Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Data Sources</h2>
              <p className="text-sm text-gray-600">Add and manage your knowledge base sources</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Data
            </button>
          </div>

          {/* Data Sources List */}
          {formData.dataSources && formData.dataSources.length > 0 ? (
            <div className="space-y-3">
              {formData.dataSources.map((source) => (
                <div key={source.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      source.type === 'file' ? 'bg-purple-50' :
                      source.type === 'website' ? 'bg-green-50' :
                      'bg-orange-50'
                    }`}>
                      {source.type === 'file' && <FileText size={20} className="text-purple-600" />}
                      {source.type === 'website' && <Globe size={20} className="text-green-600" />}
                      {source.type === 'text' && <Type size={20} className="text-orange-600" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{source.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {source.type.charAt(0).toUpperCase() + source.type.slice(1)} • 
                            Added {source.createdAt.toLocaleDateString()}
                          </p>
                          {source.url && (
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                            >
                              {source.url}
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(source.status)}
                          <button
                            onClick={() => removeSource(source.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Book size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your first data source to start building your knowledge base
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus size={18} />
                Add Data Source
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          Continue
          <Check size={18} />
        </button>
      </div>

      {/* Add Data Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-gray-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Add Data Source</h2>
              </div>
              <button
                onClick={resetModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              
              {modalStep === 'select' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select a data source that you want to add to your knowledge-base
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {dataSourceTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => handleSelectType(type.type)}
                        className={`p-6 rounded-xl border-2 ${type.color} hover:shadow-md transition-all text-center`}
                      >
                        <div className="flex justify-center mb-3">
                          {type.icon}
                        </div>
                        <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                        <div className="text-xs text-gray-600">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {modalStep === 'details' && selectedType === 'file' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setModalStep('select')}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source name
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Enter a name for this source"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload file
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      {uploadedFile ? (
                        <div className="space-y-3">
                          <FileText size={32} className="text-purple-600 mx-auto" />
                          <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                          <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
                            Change File
                            <input 
                              type="file" 
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <FileText size={32} className="text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, TXT (Max 10MB)
                          </p>
                          <input 
                            type="file" 
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalStep === 'details' && selectedType === 'website' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setModalStep('select')}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    ← Back
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source name
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Enter a name for this source"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium">
                        Crawl for Links
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will crawl all the links starting with the URL (not including files on the website). Has to be server side rendered website
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        INCLUDED LINKS
                      </label>
                      <button
                        onClick={() => setIncludedLinks([])}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                      {includedLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-gray-700 flex-1 truncate">{link}</span>
                          <button
                            onClick={() => removeIncludedLink(link)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addIncludedLink()}
                        placeholder="https://www.example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={addIncludedLink}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                      >
                        + Add Another Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalStep === 'details' && selectedType === 'text' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setModalStep('select')}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    ← Back
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source name
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Enter a name for this source"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text content
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Enter or paste your text content here..."
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {modalStep === 'details' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={handleAddSource}
                  disabled={!sourceName.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Data Source
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePage;
