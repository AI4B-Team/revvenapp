import React, { useState } from 'react';
import { BookOpen, Plus, Globe, FileText, Upload, Search, Trash2, Edit3, Download, CheckCircle, Clock } from 'lucide-react';

const MCKnowledgeBase: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'url' | 'text' | 'file'>('url');

  const knowledgeBases = [
    { id: '1', name: 'Sales Scripts & Playbooks', status: 'completed', items: 12, lastUpdated: '2 hours ago', size: '2.4 MB' },
    { id: '2', name: 'Product Documentation', status: 'processing', items: 8, lastUpdated: '10 minutes ago', size: '1.8 MB' },
    { id: '3', name: 'Objection Handling Guide', status: 'completed', items: 15, lastUpdated: 'Yesterday', size: '3.1 MB' }
  ];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground">Train your AI agents with your company knowledge</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Knowledge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: BookOpen, value: '3', label: 'Knowledge Bases', color: 'text-emerald-500' },
          { icon: FileText, value: '35', label: 'Total Documents', color: 'text-blue-500' },
          { icon: Globe, value: '8', label: 'Web Pages', color: 'text-purple-500' },
          { icon: CheckCircle, value: '7.3 MB', label: 'Total Size', color: 'text-emerald-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Knowledge Bases</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search knowledge..." 
                className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground" 
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {knowledgeBases.map((kb) => (
            <div key={kb.id} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{kb.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{kb.items} items</span>
                      <span>•</span>
                      <span>{kb.size}</span>
                      <span>•</span>
                      <span>Updated {kb.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    kb.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {kb.status === 'completed' ? (
                      <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" />Ready</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Processing</span>
                    )}
                  </span>
                  <button className="p-2 hover:bg-muted rounded-lg"><Edit3 className="w-5 h-5 text-muted-foreground" /></button>
                  <button className="p-2 hover:bg-muted rounded-lg"><Download className="w-5 h-5 text-muted-foreground" /></button>
                  <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-5 h-5 text-red-600" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Add Knowledge</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { type: 'url', icon: Globe, label: 'Web Page' },
                { type: 'text', icon: FileText, label: 'Text Entry' },
                { type: 'file', icon: Upload, label: 'Upload File' }
              ].map((option) => (
                <button 
                  key={option.type} 
                  onClick={() => setAddType(option.type as 'url' | 'text' | 'file')} 
                  className={`p-6 rounded-xl border-2 transition-all ${
                    addType === option.type 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-2 ${addType === option.type ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                  <div className="font-medium text-foreground">{option.label}</div>
                </button>
              ))}
            </div>

            {addType === 'url' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/documentation" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground" 
                />
              </div>
            )}

            {addType === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Document Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Sales Script - Cold Calling" 
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                  <textarea 
                    rows={6} 
                    placeholder="Paste your content here..." 
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground" 
                  />
                </div>
              </div>
            )}

            {addType === 'file' && (
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-muted/50">
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">Supports PDF, DOCX, TXT files up to 10MB</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors text-foreground"
              >
                Cancel
              </button>
              <button className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-sm">
                Add Knowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCKnowledgeBase;
