import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, FileText, Send, Clock, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, Download, Upload, Edit3, Eye, Trash2, Copy,
  MoreVertical, Mail, User, Users, Calendar, Link, Settings,
  ChevronDown, ChevronRight, Grid3X3, List, ArrowRight,
  FileUp, PenTool, Stamp, Type, Image, MessageSquare, Shield,
  Check, X, RefreshCw, ExternalLink, Archive, Tag, FolderOpen,
  Clock4, Bell, Zap, BarChart3, TrendingUp, FileCheck, AlertTriangle,
  History, Share2, Lock, Unlock, Globe, Building2, UserCheck,
  Layers, Move, RotateCw, ZoomIn, ZoomOut, Undo, Redo,
  ArrowUpRight, Sparkles, Command
} from 'lucide-react';
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Types
interface SignatureRequest {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'completed' | 'declined' | 'expired' | 'voided';
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  sender: {
    name: string;
    email: string;
  };
  recipients: Recipient[];
  documents: Document[];
  completedAt: string | null;
  remindersSent: number;
  tags: string[];
  folder: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: 'signer' | 'viewer' | 'approver' | 'carbon_copy';
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
  signedAt: string | null;
  order: number;
  accessCode?: string;
}

interface Document {
  id: string;
  name: string;
  size: number;
  pages: number;
  uploadedAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  documents: number;
  recipients: number;
  fields: number;
  usageCount: number;
  createdAt: string;
  thumbnail: string;
}

interface Folder {
  id: string;
  name: string;
  count: number;
  color: string;
}

// Sample Data
const sampleRequests: SignatureRequest[] = [
  {
    id: 'sig_001',
    title: 'Employment Agreement - John Smith',
    status: 'pending',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-12T14:30:00Z',
    expiresAt: '2026-01-24T23:59:59Z',
    sender: { name: 'Sarah Johnson', email: 'sarah@company.com' },
    recipients: [
      { id: 'r1', name: 'John Smith', email: 'john.smith@email.com', role: 'signer', status: 'viewed', signedAt: null, order: 1 },
      { id: 'r2', name: 'HR Manager', email: 'hr@company.com', role: 'signer', status: 'pending', signedAt: null, order: 2 }
    ],
    documents: [{ id: 'd1', name: 'Employment_Agreement_2026.pdf', size: 245000, pages: 12, uploadedAt: '2026-01-10T09:00:00Z' }],
    completedAt: null,
    remindersSent: 1,
    tags: ['HR', 'Employment'],
    folder: 'HR Documents'
  },
  {
    id: 'sig_002',
    title: 'NDA - Acme Corporation',
    status: 'completed',
    createdAt: '2026-01-05T11:00:00Z',
    updatedAt: '2026-01-08T16:45:00Z',
    expiresAt: null,
    sender: { name: 'Legal Team', email: 'legal@company.com' },
    recipients: [
      { id: 'r3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'signer', status: 'signed', signedAt: '2026-01-08T16:45:00Z', order: 1 }
    ],
    documents: [{ id: 'd2', name: 'NDA_Acme_Corp.pdf', size: 89000, pages: 4, uploadedAt: '2026-01-05T11:00:00Z' }],
    completedAt: '2026-01-08T16:45:00Z',
    remindersSent: 0,
    tags: ['NDA', 'Legal'],
    folder: 'Legal'
  },
  {
    id: 'sig_003',
    title: 'Software License Agreement',
    status: 'declined',
    createdAt: '2026-01-03T08:30:00Z',
    updatedAt: '2026-01-07T10:15:00Z',
    expiresAt: null,
    sender: { name: 'Sales Team', email: 'sales@company.com' },
    recipients: [
      { id: 'r4', name: 'Client Corp', email: 'contracts@client.com', role: 'signer', status: 'declined', signedAt: null, order: 1 }
    ],
    documents: [{ id: 'd3', name: 'Software_License_v2.pdf', size: 156000, pages: 8, uploadedAt: '2026-01-03T08:30:00Z' }],
    completedAt: null,
    remindersSent: 2,
    tags: ['Sales', 'License'],
    folder: 'Sales'
  },
  {
    id: 'sig_004',
    title: 'Vendor Contract - TechSupply Inc',
    status: 'expired',
    createdAt: '2025-12-15T14:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    expiresAt: '2025-12-31T23:59:59Z',
    sender: { name: 'Procurement', email: 'procurement@company.com' },
    recipients: [
      { id: 'r5', name: 'TechSupply', email: 'contracts@techsupply.com', role: 'signer', status: 'pending', signedAt: null, order: 1 }
    ],
    documents: [{ id: 'd4', name: 'Vendor_Contract_2025.pdf', size: 320000, pages: 15, uploadedAt: '2025-12-15T14:00:00Z' }],
    completedAt: null,
    remindersSent: 3,
    tags: ['Vendor', 'Procurement'],
    folder: 'Procurement'
  },
  {
    id: 'sig_005',
    title: 'Partnership Agreement - Draft',
    status: 'draft',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
    expiresAt: null,
    sender: { name: 'Business Dev', email: 'bizdev@company.com' },
    recipients: [],
    documents: [{ id: 'd5', name: 'Partnership_Draft.pdf', size: 180000, pages: 10, uploadedAt: '2026-01-12T10:00:00Z' }],
    completedAt: null,
    remindersSent: 0,
    tags: ['Partnership'],
    folder: 'Business Development'
  }
];

const sampleTemplates: Template[] = [
  {
    id: 'tpl_001',
    name: 'Employment Agreement',
    description: 'Standard employment contract with all necessary clauses',
    category: 'HR',
    documents: 1,
    recipients: 2,
    fields: 15,
    usageCount: 45,
    createdAt: '2025-06-15T00:00:00Z',
    thumbnail: '/api/placeholder/200/260'
  },
  {
    id: 'tpl_002',
    name: 'Non-Disclosure Agreement',
    description: 'Mutual NDA for business partnerships',
    category: 'Legal',
    documents: 1,
    recipients: 2,
    fields: 8,
    usageCount: 128,
    createdAt: '2025-05-20T00:00:00Z',
    thumbnail: '/api/placeholder/200/260'
  },
  {
    id: 'tpl_003',
    name: 'Sales Contract',
    description: 'Product/service sales agreement',
    category: 'Sales',
    documents: 1,
    recipients: 2,
    fields: 20,
    usageCount: 67,
    createdAt: '2025-07-10T00:00:00Z',
    thumbnail: '/api/placeholder/200/260'
  },
  {
    id: 'tpl_004',
    name: 'Lease Agreement',
    description: 'Commercial property lease contract',
    category: 'Real Estate',
    documents: 2,
    recipients: 3,
    fields: 25,
    usageCount: 23,
    createdAt: '2025-08-05T00:00:00Z',
    thumbnail: '/api/placeholder/200/260'
  }
];

const folders: Folder[] = [
  { id: 'all', name: 'All Documents', count: 156, color: 'bg-blue-500' },
  { id: 'inbox', name: 'Inbox', count: 12, color: 'bg-green-500' },
  { id: 'sent', name: 'Sent', count: 89, color: 'bg-purple-500' },
  { id: 'drafts', name: 'Drafts', count: 8, color: 'bg-yellow-500' },
  { id: 'completed', name: 'Completed', count: 134, color: 'bg-emerald-500' },
  { id: 'archived', name: 'Archived', count: 45, color: 'bg-gray-500' }
];

// Signature field interface
interface SignatureField {
  id: string;
  type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  signed: boolean;
  signatureData?: string;
  label?: string;
  required: boolean;
}

const Signature = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'documents' | 'templates' | 'editor' | 'signing' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Signing state
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([
    { id: 'sig1', type: 'signature', x: 100, y: 200, width: 200, height: 60, page: 1, signed: false, label: 'Signer 1 Signature', required: true },
    { id: 'sig2', type: 'signature', x: 450, y: 200, width: 200, height: 60, page: 1, signed: false, label: 'Signer 2 Signature', required: true },
    { id: 'sig3', type: 'initials', x: 100, y: 350, width: 80, height: 40, page: 1, signed: false, label: 'Initials', required: true },
    { id: 'date1', type: 'date', x: 200, y: 350, width: 120, height: 30, page: 1, signed: false, label: 'Date', required: true },
  ]);
  const [activeSignatureField, setActiveSignatureField] = useState<string | null>(null);
  const [showAutoFillPrompt, setShowAutoFillPrompt] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<HTMLCanvasElement>(null);

  // Dashboard stats
  const stats = {
    pending: sampleRequests.filter(r => r.status === 'pending').length,
    completed: sampleRequests.filter(r => r.status === 'completed').length,
    expiringSoon: sampleRequests.filter(r => r.status === 'pending' && r.expiresAt).length,
    drafts: sampleRequests.filter(r => r.status === 'draft').length,
    totalSent: 156,
    avgCompletionTime: '1.2 days',
    completionRate: '94%'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'declined': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'voided': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'draft': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'draft': return <Edit3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredRequests = sampleRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.recipients.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = (requestId: string) => {
    toast.success("Reminder sent successfully");
  };

  const handleVoidRequest = (requestId: string) => {
    toast.success("Signature request voided");
  };

  const handleResend = (requestId: string) => {
    toast.success("Request resent to recipients");
  };

  // Signature handling functions
  const getUnsignedSignatureFields = () => {
    return signatureFields.filter(f => f.type === 'signature' && !f.signed);
  };

  const handleSignatureFieldClick = (fieldId: string) => {
    const field = signatureFields.find(f => f.id === fieldId);
    if (field && !field.signed && (field.type === 'signature' || field.type === 'initials')) {
      setActiveSignatureField(fieldId);
      setShowSignaturePad(true);
    } else if (field && field.type === 'date' && !field.signed) {
      // Auto-fill date
      const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      setSignatureFields(prev => prev.map(f => 
        f.id === fieldId ? { ...f, signed: true, signatureData: today } : f
      ));
      toast.success("Date filled");
    }
  };

  const handleSignatureComplete = (signatureData: string) => {
    if (!activeSignatureField) return;
    
    const field = signatureFields.find(f => f.id === activeSignatureField);
    
    setSignatureFields(prev => prev.map(f => 
      f.id === activeSignatureField ? { ...f, signed: true, signatureData } : f
    ));
    
    setCurrentSignature(signatureData);
    setShowSignaturePad(false);
    
    // Check if there are other unsigned signature fields
    const unsignedFields = signatureFields.filter(f => 
      f.id !== activeSignatureField && 
      f.type === 'signature' && 
      !f.signed
    );
    
    if (unsignedFields.length > 0) {
      setShowAutoFillPrompt(true);
    } else {
      toast.success("Signed!");
    }
    
    setActiveSignatureField(null);
  };

  const handleAutoFillAllSignatures = useCallback(() => {
    if (!currentSignature) return;
    
    setSignatureFields(prev => prev.map(f => 
      f.type === 'signature' && !f.signed 
        ? { ...f, signed: true, signatureData: currentSignature } 
        : f
    ));
    
    setShowAutoFillPrompt(false);
    toast.success("All signature fields filled!");
  }, [currentSignature]);

  const handleDeclineAutoFill = () => {
    setShowAutoFillPrompt(false);
    toast.success("Signed!");
  };

  // Keyboard shortcut for auto-fill (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAutoFillPrompt && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAutoFillAllSignatures();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAutoFillPrompt, handleAutoFillAllSignatures]);

  const clearSignature = (fieldId: string) => {
    setSignatureFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, signed: false, signatureData: undefined } : f
    ));
    toast.success("Signature cleared");
  };

  // Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.pending}</span>
          </div>
          <p className="text-sm text-muted-foreground">Awaiting Signature</p>
          <p className="text-xs text-amber-400 mt-1">+2 today</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.completed}</span>
          </div>
          <p className="text-sm text-muted-foreground">Completed This Week</p>
          <p className="text-xs text-emerald-400 mt-1">{stats.completionRate} success rate</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.totalSent}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Sent</p>
          <p className="text-xs text-purple-400 mt-1">Last 30 days</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.avgCompletionTime}</span>
          </div>
          <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
          <p className="text-xs text-blue-400 mt-1">-0.3 days vs last month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="group bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-6 text-left hover:border-primary/50 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">New Signature Request</h3>
          <p className="text-sm text-muted-foreground">Upload documents and send for signature</p>
        </button>

        <button
          onClick={() => setShowTemplateModal(true)}
          className="group bg-card/50 border border-border/50 rounded-xl p-6 text-left hover:border-purple-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Use Template</h3>
          <p className="text-sm text-muted-foreground">Start from a pre-built template</p>
        </button>

        <button
          onClick={() => setActiveView('documents')}
          className="group bg-card/50 border border-border/50 rounded-xl p-6 text-left hover:border-emerald-500/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">View Documents</h3>
          <p className="text-sm text-muted-foreground">Manage all signature requests</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <Button variant="ghost" size="sm" onClick={() => setActiveView('documents')}>
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="divide-y divide-border/50">
          {sampleRequests.slice(0, 5).map((request) => (
            <div key={request.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(request.status).split(' ')[0]}`}>
                  {getStatusIcon(request.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{request.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.recipients.length} recipient{request.recipients.length !== 1 ? 's' : ''} • {formatDate(request.updatedAt)}
                  </p>
                </div>
                <Badge className={`${getStatusColor(request.status)} border`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => {}}>
                      <Eye className="w-4 h-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    {request.status === 'pending' && (
                      <>
                        <DropdownMenuItem onClick={() => handleSendReminder(request.id)}>
                          <Bell className="w-4 h-4 mr-2" /> Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVoidRequest(request.id)} className="text-red-400">
                          <XCircle className="w-4 h-4 mr-2" /> Void Request
                        </DropdownMenuItem>
                      </>
                    )}
                    {request.status === 'completed' && (
                      <DropdownMenuItem onClick={() => {}}>
                        <Download className="w-4 h-4 mr-2" /> Download Signed
                      </DropdownMenuItem>
                    )}
                    {request.status === 'draft' && (
                      <DropdownMenuItem onClick={() => {}}>
                        <Edit3 className="w-4 h-4 mr-2" /> Continue Editing
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Needs Attention */}
      {stats.expiringSoon > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div className="flex-1">
              <p className="font-medium text-amber-400">Action Required</p>
              <p className="text-sm text-amber-400/70">{stats.expiringSoon} document(s) expiring soon</p>
            </div>
            <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20">
              Review Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Documents List View
  const renderDocuments = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/50">
                <Filter className="w-4 h-4 mr-2" />
                {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('declined')}>Declined</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('expired')}>Expired</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'bg-card/50 text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'bg-card/50 text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => setShowNewRequestModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Request
          </Button>
        </div>
      </div>

      {/* Folders Sidebar + Documents */}
      <div className="flex gap-6">
        {/* Folders Sidebar */}
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Folders</p>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${
                  selectedFolder === folder.id ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                  <span>{folder.name}</span>
                </div>
                <span className="text-xs">{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1">
          {viewMode === 'list' ? (
            <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Document</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Recipients</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated</th>
                    <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{request.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {request.documents[0]?.name} • {formatFileSize(request.documents[0]?.size || 0)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {request.recipients.slice(0, 3).map((recipient, idx) => (
                              <div
                                key={recipient.id}
                                className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-foreground"
                                title={recipient.name}
                              >
                                {recipient.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                          {request.recipients.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{request.recipients.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(request.status)} border`}>
                          <span className="mr-1.5">{getStatusIcon(request.status)}</span>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{formatDate(request.updatedAt)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                            <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {request.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleSendReminder(request.id)}>
                                  <Bell className="w-4 h-4 mr-2" /> Send Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVoidRequest(request.id)} className="text-red-400">
                                  <XCircle className="w-4 h-4 mr-2" /> Void
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-card/50 border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <Badge className={`${getStatusColor(request.status)} border`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground mb-1 line-clamp-1">{request.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{request.documents[0]?.name}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {request.recipients.slice(0, 3).map((recipient) => (
                        <div
                          key={recipient.id}
                          className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium"
                        >
                          {recipient.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(request.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Templates View
  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground">Create reusable document templates with pre-defined fields</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Create Template
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search templates..." className="pl-10 bg-card/50 border-border/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sampleTemplates.map((template) => (
          <div key={template.id} className="bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all group">
            <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
              <FileText className="w-16 h-16 text-muted-foreground/30" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{template.category}</Badge>
              </div>
              <h4 className="font-medium text-foreground mb-1">{template.name}</h4>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{template.fields} fields</span>
                <span>Used {template.usageCount}x</span>
              </div>
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" className="flex-1 bg-primary/90 hover:bg-primary">
                  <Send className="w-3 h-3 mr-1" /> Use
                </Button>
                <Button size="sm" variant="outline" className="border-border/50">
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // New Request Modal
  const renderNewRequestModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">New Signature Request</h2>
            <button onClick={() => setShowNewRequestModal(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Upload Documents</label>
            <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-1">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground">PDF, DOC, DOCX up to 25MB each</p>
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Document Name</label>
            <Input placeholder="Enter document name" className="bg-muted/50 border-border/50" />
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Recipients</label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input placeholder="Name" className="flex-1 bg-muted/50 border-border/50" />
                <Input placeholder="Email" className="flex-1 bg-muted/50 border-border/50" />
                <select className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground">
                  <option value="signer">Signer</option>
                  <option value="viewer">Viewer</option>
                  <option value="approver">Approver</option>
                  <option value="carbon_copy">CC</option>
                </select>
              </div>
              <Button variant="outline" size="sm" className="border-border/50">
                <Plus className="w-4 h-4 mr-2" /> Add Recipient
              </Button>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message (Optional)</label>
            <textarea 
              placeholder="Add a message for the recipients..."
              className="w-full h-24 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Expiration</label>
            <select className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground">
              <option value="">No expiration</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowNewRequestModal(false)} className="border-border/50">
            Cancel
          </Button>
          <Button variant="outline" className="border-border/50">
            <Edit3 className="w-4 h-4 mr-2" /> Add Fields
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4 mr-2" /> Send for Signature
          </Button>
        </div>
      </div>
    </div>
  );

  // Settings View
  const renderSettings = () => (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Signature Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your e-signature preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">Default Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Default Expiration</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground">
                  <option value="">No expiration</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Reminder Frequency</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground">
                  <option value="none">No reminders</option>
                  <option value="3">Every 3 days</option>
                  <option value="7">Every week</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Sequential Signing</p>
                <p className="text-sm text-muted-foreground">Recipients sign in order</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-primary/20 relative">
                <div className="w-5 h-5 rounded-full bg-primary absolute top-0.5 right-0.5" />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Decline to Sign</p>
                <p className="text-sm text-muted-foreground">Allow recipients to decline</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-primary/20 relative">
                <div className="w-5 h-5 rounded-full bg-primary absolute top-0.5 right-0.5" />
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 mt-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">Email Branding</h3>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Company Logo</label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload your logo (PNG, SVG)</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary border border-border" />
                <Input placeholder="#8B5CF6" className="flex-1 bg-muted/50 border-border/50" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">Email Notifications</h3>
            
            {[
              { title: 'Document Viewed', desc: 'When a recipient views your document' },
              { title: 'Document Signed', desc: 'When a recipient signs' },
              { title: 'Document Completed', desc: 'When all recipients have signed' },
              { title: 'Document Declined', desc: 'When a recipient declines to sign' },
              { title: 'Document Expired', desc: 'When a document expires unsigned' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <button className="w-12 h-6 rounded-full bg-primary/20 relative">
                  <div className="w-5 h-5 rounded-full bg-primary absolute top-0.5 right-0.5" />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">Security Settings</h3>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Access Code Protection</p>
                <p className="text-sm text-muted-foreground">Require access code to view documents</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-muted relative">
                <div className="w-5 h-5 rounded-full bg-muted-foreground absolute top-0.5 left-0.5" />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Require SMS verification</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-muted relative">
                <div className="w-5 h-5 rounded-full bg-muted-foreground absolute top-0.5 left-0.5" />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">ID Verification</p>
                <p className="text-sm text-muted-foreground">Verify signer identity with government ID</p>
              </div>
              <Badge variant="secondary">Enterprise</Badge>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6 mt-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">API Access</h3>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">API Key</label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  value="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx" 
                  readOnly 
                  className="flex-1 bg-muted/50 border-border/50 font-mono" 
                />
                <Button variant="outline" className="border-border/50">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="border-border/50">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Webhook URL</label>
              <Input placeholder="https://your-domain.com/webhooks/signature" className="bg-muted/50 border-border/50" />
            </div>

            <div className="pt-4">
              <Button variant="outline" className="border-border/50">
                <ExternalLink className="w-4 h-4 mr-2" /> View API Documentation
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Signing View with Auto-Fill Feature
  const renderSigningView = () => {
    const signedCount = signatureFields.filter(f => f.signed).length;
    const totalRequired = signatureFields.filter(f => f.required).length;
    
    return (
      <div className="space-y-4">
        {/* Signing Header */}
        <div className="flex items-center justify-between bg-card/50 border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveView('documents')}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <div>
              <h3 className="font-medium text-foreground">Employment Agreement - John Smith</h3>
              <p className="text-sm text-muted-foreground">
                {signedCount} of {totalRequired} required fields completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-border/50">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              disabled={signedCount < totalRequired}
            >
              <Check className="w-4 h-4 mr-2" /> Finish Signing
            </Button>
          </div>
        </div>

        {/* Document Canvas with Signature Fields */}
        <div className="relative bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          {/* Document simulation */}
          <div className="bg-white p-12 min-h-[800px] relative mx-auto max-w-[850px] shadow-lg">
            {/* Sample document content */}
            <div className="text-gray-800">
              <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">EMPLOYMENT AGREEMENT</h1>
              
              <p className="mb-4 text-sm leading-relaxed text-gray-700">
                This Employment Agreement ("Agreement") is entered into as of the date last signed below, by and between 
                ABC Corporation ("Company") and the undersigned employee ("Employee").
              </p>
              
              <p className="mb-4 text-sm leading-relaxed text-gray-700">
                WHEREAS, the Company desires to employ the Employee, and the Employee desires to be employed by the Company, 
                subject to the terms and conditions set forth herein;
              </p>
              
              <p className="mb-4 text-sm leading-relaxed text-gray-700">
                NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth and for other 
                good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties 
                agree as follows...
              </p>

              <p className="mt-8 mb-2 text-sm font-semibold text-gray-900">
                I have read and agree to the terms and conditions set forth above:
              </p>
            </div>

            {/* Signature Fields */}
            <div className="mt-8 grid grid-cols-2 gap-8">
              {/* Left column - Signer 1 */}
              <div className="space-y-4">
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 mb-2">Name: <span className="font-normal">DOLMAR ANTOINE CROSS</span></p>
                </div>
                
                {/* Signature Field 1 */}
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 mb-1">Signature:</p>
                  <div 
                    onClick={() => handleSignatureFieldClick('sig1')}
                    className={`relative border-b-2 border-gray-400 h-16 flex items-end justify-start cursor-pointer transition-all group ${
                      signatureFields.find(f => f.id === 'sig1')?.signed 
                        ? 'bg-transparent' 
                        : 'hover:bg-blue-50/50'
                    }`}
                  >
                    {signatureFields.find(f => f.id === 'sig1')?.signed ? (
                      <>
                        <img 
                          src={signatureFields.find(f => f.id === 'sig1')?.signatureData} 
                          alt="Signature" 
                          className="h-14 object-contain"
                        />
                        {/* Signed badge with delete option */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                          <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            Signed
                            <button 
                              onClick={(e) => { e.stopPropagation(); clearSignature('sig1'); }}
                              className="hover:bg-white/20 rounded p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-blue-500 text-sm mb-2 group-hover:underline">Click to sign</span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <p className="text-sm font-medium text-gray-700">Title: <span className="font-normal">Owner</span></p>
                </div>
                
                {/* Date Field */}
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 mb-1">Date:</p>
                  <div 
                    onClick={() => handleSignatureFieldClick('date1')}
                    className={`border-b-2 border-gray-400 h-8 flex items-end cursor-pointer ${
                      signatureFields.find(f => f.id === 'date1')?.signed 
                        ? '' 
                        : 'hover:bg-blue-50/50'
                    }`}
                  >
                    {signatureFields.find(f => f.id === 'date1')?.signed ? (
                      <span className="text-gray-800 mb-1">{signatureFields.find(f => f.id === 'date1')?.signatureData}</span>
                    ) : (
                      <span className="text-blue-500 text-sm mb-1">Click to fill date</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column - Signer 2 */}
              <div className="space-y-4">
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 mb-2">Name: <span className="font-normal border-b border-gray-400 inline-block w-48"></span></p>
                </div>
                
                {/* Signature Field 2 */}
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 mb-1">Signature:</p>
                  <div 
                    onClick={() => handleSignatureFieldClick('sig2')}
                    className={`relative border-b-2 border-gray-400 h-16 flex items-end justify-start cursor-pointer transition-all group ${
                      signatureFields.find(f => f.id === 'sig2')?.signed 
                        ? 'bg-transparent' 
                        : 'hover:bg-blue-50/50'
                    }`}
                  >
                    {signatureFields.find(f => f.id === 'sig2')?.signed ? (
                      <>
                        <img 
                          src={signatureFields.find(f => f.id === 'sig2')?.signatureData} 
                          alt="Signature" 
                          className="h-14 object-contain"
                        />
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                          <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            Signed
                            <button 
                              onClick={(e) => { e.stopPropagation(); clearSignature('sig2'); }}
                              className="hover:bg-white/20 rounded p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-blue-500 text-sm mb-2 group-hover:underline">Click to sign</span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <p className="text-sm font-medium text-gray-700">Title: <span className="font-normal border-b border-gray-400 inline-block w-48"></span></p>
                </div>
                
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700">Date: <span className="font-normal border-b border-gray-400 inline-block w-32"></span></p>
                </div>
              </div>
            </div>

            {/* Auto-fill prompt */}
            {showAutoFillPrompt && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center gap-4 animate-in fade-in zoom-in duration-200">
                  <div className="text-left">
                    <p className="font-semibold text-blue-600 text-sm uppercase tracking-wide">AUTO-FILL ALL SIGNATURES</p>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono border">Command</kbd> + <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono border">Enter</kbd> to fill out
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleDeclineAutoFill}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={handleAutoFillAllSignatures}
                      className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Page number */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">1</div>
          </div>
        </div>

        {/* Signature Pad Modal */}
        {showSignaturePad && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Draw Your Signature</h3>
                <button 
                  onClick={() => { setShowSignaturePad(false); setActiveSignatureField(null); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <SignaturePad 
                  onComplete={handleSignatureComplete}
                  onCancel={() => { setShowSignaturePad(false); setActiveSignatureField(null); }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          {activeView !== 'signing' && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>Apps</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">Signature</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <PenTool className="w-5 h-5 text-white" />
                    </div>
                    Signature
                  </h1>
                  <p className="text-muted-foreground mt-1">Send, sign, and manage documents electronically</p>
                </div>
                {activeView === 'dashboard' && (
                  <Button onClick={() => setActiveView('signing')} variant="outline" className="border-primary text-primary">
                    <PenTool className="w-4 h-4 mr-2" /> Try Signing Demo
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          {activeView !== 'signing' && (
            <div className="flex items-center gap-1 mb-6 border-b border-border/50">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'templates', label: 'Templates', icon: Layers },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeView === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'documents' && renderDocuments()}
          {activeView === 'templates' && renderTemplates()}
          {activeView === 'settings' && renderSettings()}
          {activeView === 'signing' && renderSigningView()}
        </main>
      </div>

      {/* Modals */}
      {showNewRequestModal && renderNewRequestModal()}
    </div>
  );
};

// Signature Pad Component
interface SignaturePadProps {
  onComplete: (signatureData: string) => void;
  onCancel: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasDrawn(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL('image/png');
    onComplete(signatureData);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <p className="text-center text-sm text-muted-foreground">Draw your signature above</p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={clearCanvas}>
          <RefreshCw className="w-4 h-4 mr-2" /> Clear
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-primary hover:bg-primary/90" 
          onClick={handleComplete}
          disabled={!hasDrawn}
        >
          <Check className="w-4 h-4 mr-2" /> Apply
        </Button>
      </div>
    </div>
  );
};

export default Signature;
