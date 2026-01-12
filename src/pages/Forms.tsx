import React, { useState } from 'react';
import { 
  Plus, LayoutTemplate, Link2, Upload, Edit3, Eye, Share2, 
  BarChart3, Settings, Trash2, Copy, Search, Filter, Download,
  ChevronDown, ChevronRight, Grid3x3, List, Calendar, Clock,
  DollarSign, FileText, Image, Video, Mic, MapPin, Phone,
  Mail, User, Hash, CheckSquare, ToggleLeft, Star, Sliders,
  AlertCircle, XCircle, Save, Send, Code, Zap, Database,
  ArrowRight, Check, X, FolderOpen, Folder, MoreVertical,
  TrendingUp, Users, MessageSquare, Bell, Lock, Unlock,
  ExternalLink, Palette, Type, Layout, Sparkles, Target,
  GitBranch, RefreshCw, Box, Package
} from 'lucide-react';
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";

interface Form {
  id: number;
  name: string;
  status: 'published' | 'draft';
  submissions: number;
  views: number;
  conversion: number;
  lastModified: string;
  template: string;
  fields: number;
}

interface FieldType {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  preview: string;
  fields: number;
  popular: boolean;
}

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
}

interface FormBuilder {
  name: string;
  description: string;
  fields: FormField[];
  theme: 'dark' | 'light';
  branding: boolean;
  notifications: boolean;
  redirectUrl: string;
  customCss: string;
}

interface FormField {
  id: number;
  type: string;
  label: string;
  required: boolean;
  placeholder: string;
  options: string[];
}

const Forms = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [forms, setForms] = useState<Form[]>([
    { 
      id: 1, 
      name: 'Customer Feedback Form', 
      status: 'published', 
      submissions: 247,
      views: 1423,
      conversion: 17.4,
      lastModified: '2 hours ago',
      template: 'feedback',
      fields: 8
    },
    { 
      id: 2, 
      name: 'Job Application', 
      status: 'draft', 
      submissions: 0,
      views: 0,
      conversion: 0,
      lastModified: '1 day ago',
      template: 'job-application',
      fields: 15
    },
    { 
      id: 3, 
      name: 'Event Registration', 
      status: 'published', 
      submissions: 89,
      views: 432,
      conversion: 20.6,
      lastModified: '3 days ago',
      template: 'event',
      fields: 12
    }
  ]);
  
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [formBuilder, setFormBuilder] = useState<FormBuilder>({
    name: 'Untitled Form',
    description: '',
    fields: [],
    theme: 'dark',
    branding: true,
    notifications: true,
    redirectUrl: '',
    customCss: ''
  });

  const fieldTypes: FieldType[] = [
    { id: 'short-text', name: 'Short Text', icon: Type, category: 'input' },
    { id: 'long-text', name: 'Long Text', icon: FileText, category: 'input' },
    { id: 'email', name: 'Email', icon: Mail, category: 'input' },
    { id: 'phone', name: 'Phone', icon: Phone, category: 'input' },
    { id: 'number', name: 'Number', icon: Hash, category: 'input' },
    { id: 'dropdown', name: 'Dropdown', icon: ChevronDown, category: 'choice' },
    { id: 'multiple-choice', name: 'Multiple Choice', icon: CheckSquare, category: 'choice' },
    { id: 'checkboxes', name: 'Checkboxes', icon: CheckSquare, category: 'choice' },
    { id: 'date', name: 'Date Picker', icon: Calendar, category: 'date-time' },
    { id: 'time', name: 'Time Picker', icon: Clock, category: 'date-time' },
    { id: 'date-range', name: 'Date Range', icon: Calendar, category: 'date-time' },
    { id: 'file-upload', name: 'File Upload', icon: Upload, category: 'media' },
    { id: 'image-upload', name: 'Image Upload', icon: Image, category: 'media' },
    { id: 'signature', name: 'Signature', icon: Edit3, category: 'media' },
    { id: 'rating', name: 'Rating', icon: Star, category: 'advanced' },
    { id: 'slider', name: 'Slider', icon: Sliders, category: 'advanced' },
    { id: 'location', name: 'Location', icon: MapPin, category: 'advanced' },
    { id: 'payment', name: 'Payment', icon: DollarSign, category: 'advanced' },
    { id: 'section', name: 'Section Break', icon: Layout, category: 'layout' },
    { id: 'heading', name: 'Heading', icon: Type, category: 'layout' },
    { id: 'paragraph', name: 'Paragraph', icon: FileText, category: 'layout' }
  ];

  const templateCategories = [
    { id: 'popular', name: 'Most Popular', count: 14 },
    { id: 'application', name: 'Application Forms', count: 30 },
    { id: 'appointment', name: 'Appointment Forms', count: 11 },
    { id: 'booking', name: 'Booking Forms', count: 22 },
    { id: 'business', name: 'Business Forms', count: 113 },
    { id: 'contact', name: 'Contact Forms', count: 16 },
    { id: 'customer-service', name: 'Customer Service', count: 20 },
    { id: 'education', name: 'Education', count: 50 },
    { id: 'ecommerce', name: 'Ecommerce', count: 96 },
    { id: 'employment', name: 'Employment Forms', count: 40 },
    { id: 'event', name: 'Event Forms', count: 35 },
    { id: 'feedback', name: 'Feedback Forms', count: 28 },
    { id: 'healthcare', name: 'Healthcare', count: 42 },
    { id: 'lead-gen', name: 'Lead Generation', count: 55 },
    { id: 'order', name: 'Order Forms', count: 38 },
    { id: 'payment', name: 'Payment Forms', count: 24 },
    { id: 'registration', name: 'Registration Forms', count: 45 },
    { id: 'survey', name: 'Survey Forms', count: 67 }
  ];

  const templates: Template[] = [
    {
      id: 1,
      name: 'Job Application Form',
      description: 'Comprehensive job application with resume upload',
      category: 'employment',
      preview: '/api/placeholder/400/300',
      fields: 15,
      popular: true
    },
    {
      id: 2,
      name: 'Contact Form',
      description: 'Simple contact form with message field',
      category: 'contact',
      preview: '/api/placeholder/400/300',
      fields: 5,
      popular: true
    },
    {
      id: 3,
      name: 'Event Registration',
      description: 'Event signup with payment integration',
      category: 'event',
      preview: '/api/placeholder/400/300',
      fields: 12,
      popular: true
    },
    {
      id: 4,
      name: 'Customer Feedback',
      description: 'Collect customer satisfaction ratings',
      category: 'feedback',
      preview: '/api/placeholder/400/300',
      fields: 8,
      popular: true
    },
    {
      id: 5,
      name: 'Lead Generation',
      description: 'Capture leads with qualifying questions',
      category: 'lead-gen',
      preview: '/api/placeholder/400/300',
      fields: 10,
      popular: true
    },
    {
      id: 6,
      name: 'Order Form',
      description: 'Product order with payment processing',
      category: 'ecommerce',
      preview: '/api/placeholder/400/300',
      fields: 14,
      popular: false
    }
  ];

  // Brand logo components
  const GoogleDriveIcon = () => (
    <svg viewBox="0 0 87.3 78" className="w-6 h-6">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
      <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 52.35c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85l5.8 10.6 7.9 13.2z" fill="#EA4335"/>
      <path d="M43.65 25L57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2H34.35c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D"/>
      <path d="M59.85 53H27.5l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.85c1.6 0 3.15-.45 4.5-1.2L59.85 53z" fill="#2684FC"/>
      <path d="M73.4 26.5L60.1 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.2 28h27.45c0-1.55-.4-3.1-1.2-4.5l-12.7-22z" fill="#FFBA00"/>
    </svg>
  );

  const NotionIcon = () => (
    <svg viewBox="0 0 100 100" className="w-6 h-6">
      <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="#fff"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L75.5 3.397c-4.273-3.107-6.02-3.5-12.15-3.17zM25.92 19.523c-5.247.353-6.437.433-9.417-1.99L8.927 11.507c-.77-.78-.383-1.753 1.557-1.947l53.193-3.887c4.467-.39 6.793 1.167 8.54 2.527l9.123 6.61c.39.197 1.36 1.36.193 1.36l-54.933 3.307-.68.047zM19.803 88.3V30.367c0-2.53.777-3.697 3.103-3.893L86 22.78c2.14-.193 3.107 1.167 3.107 3.693v57.547c0 2.53-.39 4.67-3.883 4.863l-60.377 3.5c-3.493.193-5.043-.97-5.043-4.083zm59.6-54.827c.387 1.75 0 3.5-1.75 3.7l-2.917.553v42.773c-2.527 1.36-4.853 2.137-6.797 2.137-3.107 0-3.883-.977-6.21-3.887l-19.03-29.94v28.967l6.02 1.363s0 3.5-4.857 3.5l-13.39.777c-.39-.78 0-2.723 1.357-3.11l3.497-.97v-38.3L30.48 40.667c-.39-1.75.58-4.277 3.3-4.473l14.367-.967 19.8 30.327V37.943l-5.047-.583c-.39-2.143 1.163-3.7 3.103-3.89l13.4-.78z" fill="#000"/>
    </svg>
  );

  const GoogleSheetsIcon = () => (
    <svg viewBox="0 0 48 48" className="w-6 h-6">
      <path fill="#43a047" d="M37 45H11c-2.2 0-4-1.8-4-4V7c0-2.2 1.8-4 4-4h19l11 11v27c0 2.2-1.8 4-4 4z"/>
      <path fill="#c8e6c9" d="M40 14H30V4z"/>
      <path fill="#2e7d32" d="M30 14l10 10V14z"/>
      <path fill="#e8f5e9" d="M31 23H17v16h14V23zm-12 2h4v3h-4v-3zm0 5h4v3h-4v-3zm0 5h4v2h-4v-2zm6-10h4v3h-4v-3zm0 5h4v3h-4v-3zm0 5h4v2h-4v-2z"/>
    </svg>
  );

  const HubSpotIcon = () => (
    <svg viewBox="0 0 512 512" className="w-6 h-6">
      <path fill="#ff7a59" d="M267.4 211.6c-3.5-4.5-5.9-9.7-7.1-15.3-1.2-5.6-1.2-11.3-.1-16.9 1.1-5.6 3.4-10.8 6.7-15.3 3.3-4.5 7.5-8.2 12.3-10.9v-40.8c0-9.3-7.5-16.8-16.8-16.8H97.2c-9.3 0-16.8 7.5-16.8 16.8v165.3c0 9.3 7.5 16.8 16.8 16.8h165.3c9.3 0 16.8-7.5 16.8-16.8V222.5c-4.9-2.7-9.1-6.4-12.3-10.9zm88.2-5.4c-6.6 0-11.9-5.3-11.9-11.9v-28.8c0-6.6 5.3-11.9 11.9-11.9 6.6 0 11.9 5.3 11.9 11.9v28.8c0 6.6-5.3 11.9-11.9 11.9zm47.1 47.1c0 6.6-5.3 11.9-11.9 11.9h-28.8c-6.6 0-11.9-5.3-11.9-11.9 0-6.6 5.3-11.9 11.9-11.9h28.8c6.6 0 11.9 5.3 11.9 11.9z"/>
      <circle cx="355.6" cy="253.3" r="35.8" fill="#ff7a59"/>
    </svg>
  );

  const integrations: Integration[] = [
    { id: 'google-drive', name: 'Google Drive', icon: <GoogleDriveIcon />, connected: true },
    { id: 'notion', name: 'Notion', icon: <NotionIcon />, connected: false },
    { id: 'google-sheets', name: 'Google Sheets', icon: <GoogleSheetsIcon />, connected: true },
    { id: 'hubspot', name: 'HubSpot', icon: <HubSpotIcon />, connected: true },
    { id: 'slack', name: 'Slack', icon: <span className="text-xl">💬</span>, connected: true },
    { id: 'zapier', name: 'Zapier', icon: <span className="text-xl">⚡</span>, connected: true },
    { id: 'stripe', name: 'Stripe', icon: <span className="text-xl">💳</span>, connected: false },
    { id: 'paypal', name: 'PayPal', icon: <span className="text-xl">💰</span>, connected: false }
  ];

  const dashboardStats = {
    totalForms: forms.length,
    totalSubmissions: forms.reduce((acc, form) => acc + form.submissions, 0),
    avgConversion: (forms.reduce((acc, form) => acc + form.conversion, 0) / forms.length).toFixed(1),
    activeIntegrations: integrations.filter(i => i.connected).length
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Forms</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardStats.totalForms}</p>
              <p className="text-emerald-500 text-sm mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% this month
              </p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Submissions</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardStats.totalSubmissions}</p>
              <p className="text-emerald-500 text-sm mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +24% this week
              </p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg Conversion</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardStats.avgConversion}%</p>
              <p className="text-emerald-500 text-sm mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3.2% improvement
              </p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Integrations</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardStats.activeIntegrations}</p>
              <p className="text-muted-foreground text-sm mt-2">
                Active connections
              </p>
            </div>
            <div className="bg-orange-500/10 p-3 rounded-lg">
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-emerald-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveView('create')}
            className="group bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg p-6 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3">
              <Plus className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-lg mb-1">Create New Form</h4>
            <p className="text-sm text-emerald-50">Start from scratch or use a template</p>
          </button>

          <button
            onClick={() => setActiveView('templates')}
            className="group bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3">
              <LayoutTemplate className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-lg mb-1">Browse Templates</h4>
            <p className="text-sm text-blue-50">500+ professional templates</p>
          </button>

          <button
            onClick={() => setActiveView('integrations')}
            className="group bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3">
              <Link2 className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-lg mb-1">Connect Apps</h4>
            <p className="text-sm text-purple-50">100+ integrations available</p>
          </button>
        </div>
      </div>

      {/* Recent Forms */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground flex items-center">
            <FileText className="w-5 h-5 mr-2 text-emerald-500" />
            Recent Forms
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-background border border-border rounded-lg p-4 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  setSelectedForm(form);
                  setActiveView('builder');
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1 group-hover:text-emerald-500 transition-colors">
                      {form.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{form.fields} fields</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    form.status === 'published' 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {form.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 py-3 border-y border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Submissions</p>
                    <p className="text-lg font-bold text-foreground">{form.submissions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="text-lg font-bold text-foreground">{form.views}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conv. Rate</p>
                    <p className="text-lg font-bold text-emerald-500">{form.conversion}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Modified {form.lastModified}
                  </p>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-muted hover:bg-emerald-500 rounded text-foreground hover:text-white transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 bg-muted hover:bg-blue-500 rounded text-foreground hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 bg-muted hover:bg-purple-500 rounded text-foreground hover:text-white transition-colors">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-background border border-border rounded-lg p-4 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  setSelectedForm(form);
                  setActiveView('builder');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <FileText className="w-10 h-10 text-emerald-500" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1 group-hover:text-emerald-500 transition-colors">
                        {form.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{form.fields} fields • Modified {form.lastModified}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{form.submissions}</p>
                      <p className="text-xs text-muted-foreground">Submissions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-500">{form.conversion}%</p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      form.status === 'published' 
                        ? 'bg-emerald-500/20 text-emerald-500' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {form.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCreateView = () => (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-2">Create a New Form</h2>
        <p className="text-muted-foreground">Choose how you'd like to start</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveView('builder')}
          className="group bg-muted/50 border-2 border-border hover:border-emerald-500 rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
        >
          <div className="bg-emerald-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/20 transition-colors">
            <Plus className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Start Blank</h3>
          <p className="text-muted-foreground">Build from scratch with full control</p>
        </button>

        <button
          onClick={() => setActiveView('templates')}
          className="group bg-muted/50 border-2 border-border hover:border-emerald-500 rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
        >
          <div className="bg-emerald-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/20 transition-colors">
            <LayoutTemplate className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Use Template</h3>
          <p className="text-muted-foreground">Start with a professional template</p>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full font-medium">
              500+ templates
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('integrations')}
          className="group bg-muted/50 border-2 border-border hover:border-emerald-500 rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
        >
          <div className="bg-emerald-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/20 transition-colors">
            <Link2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Connect</h3>
          <p className="text-muted-foreground">Forms with 3rd party apps</p>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            {integrations.slice(0, 4).map((integration) => (
              <div
                key={integration.id}
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl"
              >
                {integration.icon}
              </div>
            ))}
          </div>
        </button>
      </div>

      <div className="text-center pt-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-muted-foreground hover:text-emerald-500 transition-colors underline"
        >
          Or, import existing form
        </button>
      </div>
    </div>
  );

  const TemplatesView = () => {
    const [selectedCategory, setSelectedCategory] = useState('popular');
    const filteredTemplates = templates.filter(t => 
      selectedCategory === 'popular' ? t.popular : t.category === selectedCategory
    );

    return (
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-2">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates"
                className="w-full bg-background text-foreground pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-sm">{category.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    selectedCategory === category.id
                      ? 'bg-emerald-500/30 text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Templates Grid */}
        <div className="col-span-9">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {templateCategories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-muted-foreground">
              {filteredTemplates.length} professional templates to get you started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-muted/50 border border-border rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowTemplateModal(true);
                }}
              >
                <div className="relative aspect-video bg-gradient-to-br from-muted to-background flex items-center justify-center">
                  <FileText className="w-16 h-16 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  {template.popular && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Popular
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-emerald-500 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.fields} fields</span>
                    <button className="text-emerald-500 hover:text-emerald-400 font-medium">
                      Use template →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFormBuilder = () => (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
      {/* Left Sidebar - Field Types */}
      <div className="col-span-2 bg-muted/50 border border-border rounded-lg p-4 overflow-y-auto">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center">
          <Plus className="w-4 h-4 mr-2 text-emerald-500" />
          Add Fields
        </h3>
        
        <div className="space-y-4">
          {['input', 'choice', 'date-time', 'media', 'advanced', 'layout'].map((category) => (
            <div key={category}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {category.replace('-', ' ')}
              </p>
              <div className="space-y-1">
                {fieldTypes
                  .filter(field => field.category === category)
                  .map((field) => {
                    const Icon = field.icon;
                    return (
                      <button
                        key={field.id}
                        className="w-full flex items-center space-x-2 px-3 py-2 bg-background hover:bg-emerald-500/20 hover:border-emerald-500 border border-transparent rounded-lg text-sm text-muted-foreground hover:text-emerald-500 transition-all duration-200"
                        onClick={() => {
                          setFormBuilder({
                            ...formBuilder,
                            fields: [
                              ...formBuilder.fields,
                              {
                                id: Date.now(),
                                type: field.id,
                                label: field.name,
                                required: false,
                                placeholder: '',
                                options: field.category === 'choice' ? ['Option 1', 'Option 2'] : []
                              }
                            ]
                          });
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{field.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Form Preview */}
      <div className="col-span-7 bg-background border border-border rounded-lg p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Form Header */}
          <div className="mb-8">
            <input
              type="text"
              value={formBuilder.name}
              onChange={(e) => setFormBuilder({ ...formBuilder, name: e.target.value })}
              className="text-3xl font-bold text-foreground bg-transparent border-b-2 border-transparent hover:border-border focus:border-emerald-500 focus:outline-none w-full mb-2 transition-colors"
              placeholder="Form Title"
            />
            <textarea
              value={formBuilder.description}
              onChange={(e) => setFormBuilder({ ...formBuilder, description: e.target.value })}
              className="text-muted-foreground bg-transparent border-b-2 border-transparent hover:border-border focus:border-emerald-500 focus:outline-none w-full resize-none transition-colors"
              placeholder="Form description (optional)"
              rows={2}
            />
          </div>

          {/* Form Fields */}
          {formBuilder.fields.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No fields yet</p>
              <p className="text-sm text-muted-foreground">Click on a field type from the left to add it</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formBuilder.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="group bg-muted/30 border-2 border-border hover:border-emerald-500 rounded-lg p-4 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...formBuilder.fields];
                          newFields[index].label = e.target.value;
                          setFormBuilder({ ...formBuilder, fields: newFields });
                        }}
                        className="text-foreground font-medium bg-transparent border-b border-transparent hover:border-border focus:border-emerald-500 focus:outline-none w-full transition-colors"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{field.type}</p>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1.5 bg-muted hover:bg-red-500 rounded text-foreground hover:text-white transition-colors"
                        onClick={() => {
                          const newFields = formBuilder.fields.filter((_, i) => i !== index);
                          setFormBuilder({ ...formBuilder, fields: newFields });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 bg-muted hover:bg-muted/80 rounded text-foreground transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Field Preview */}
                  {field.type.includes('text') || field.type === 'email' || field.type === 'phone' ? (
                    <input
                      type="text"
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : field.type === 'dropdown' ? (
                    <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Select an option</option>
                      {field.options.map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkboxes' || field.type === 'multiple-choice' ? (
                    <div className="space-y-2">
                      {field.options.map((opt, i) => (
                        <label key={i} className="flex items-center space-x-2 text-foreground">
                          <input
                            type={field.type === 'checkboxes' ? 'checkbox' : 'radio'}
                            className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border">
                    <label className="flex items-center space-x-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const newFields = [...formBuilder.fields];
                          newFields[index].required = e.target.checked;
                          setFormBuilder({ ...formBuilder, fields: newFields });
                        }}
                        className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 rounded"
                      />
                      <span>Required</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button Preview */}
          {formBuilder.fields.length > 0 && (
            <div className="mt-8">
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                Submit Form
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Settings */}
      <div className="col-span-3 bg-muted/50 border border-border rounded-lg p-4 overflow-y-auto">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2 text-emerald-500" />
          Form Settings
        </h3>

        <div className="space-y-4">
          {/* General Settings */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              General
            </p>
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm text-foreground cursor-pointer">
                <span>Show branding</span>
                <input
                  type="checkbox"
                  checked={formBuilder.branding}
                  onChange={(e) => setFormBuilder({ ...formBuilder, branding: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
              <label className="flex items-center justify-between text-sm text-foreground cursor-pointer">
                <span>Email notifications</span>
                <input
                  type="checkbox"
                  checked={formBuilder.notifications}
                  onChange={(e) => setFormBuilder({ ...formBuilder, notifications: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
            </div>
          </div>

          {/* Theme */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Theme
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormBuilder({ ...formBuilder, theme: 'dark' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formBuilder.theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="w-full h-8 bg-gray-900 rounded mb-2"></div>
                <p className="text-xs text-foreground">Dark</p>
              </button>
              <button
                onClick={() => setFormBuilder({ ...formBuilder, theme: 'light' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formBuilder.theme === 'light'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="w-full h-8 bg-white rounded mb-2 border border-border"></div>
                <p className="text-xs text-foreground">Light</p>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-2">
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Form</span>
            </button>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button 
              onClick={() => setActiveView('dashboard')}
              className="w-full bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsView = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Connect Your Favorite Apps</h2>
        <p className="text-muted-foreground">Sync form data with 100+ integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={`group bg-muted/50 border-2 rounded-lg p-6 transition-all duration-300 cursor-pointer ${
              integration.connected
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`text-5xl mb-4 p-4 rounded-xl ${
                integration.connected
                  ? 'bg-emerald-500/10'
                  : 'bg-muted'
              }`}>
                {integration.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{integration.name}</h3>
              {integration.connected ? (
                <div className="flex items-center space-x-1 text-emerald-500 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Connected</span>
                </div>
              ) : (
                <button className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        {/* Forms Header */}
        <div className="border-b border-border bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Forms Studio</h1>
                    <p className="text-xs text-muted-foreground">REVVEN Forms</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveView('create')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Form</span>
                </button>
                <button className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 mt-4">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutTemplate },
                { id: 'create', label: 'Create', icon: Plus },
                { id: 'templates', label: 'Templates', icon: Grid3x3 },
                { id: 'submissions', label: 'Submissions', icon: Database },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'integrations', label: 'Integrations', icon: Link2 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeView === tab.id
                        ? 'bg-emerald-500/20 text-emerald-600'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'create' && renderCreateView()}
            {activeView === 'templates' && <TemplatesView />}
            {activeView === 'builder' && renderFormBuilder()}
            {activeView === 'integrations' && renderIntegrationsView()}
            {activeView === 'submissions' && (
              <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
                <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Submissions View</h3>
                <p className="text-muted-foreground">View and manage form submissions with advanced filtering</p>
              </div>
            )}
            {activeView === 'analytics' && (
              <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">Track form performance and conversion metrics</p>
              </div>
            )}
          </div>
        </div>

        {/* Template Modal */}
        {showTemplateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{selectedTemplate.name}</h3>
                  <p className="text-muted-foreground">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>
              <div className="p-6">
                <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-24 h-24 text-muted-foreground" />
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setShowTemplateModal(false);
                      setActiveView('builder');
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    Use This Template
                  </button>
                  <button className="px-6 py-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forms;
