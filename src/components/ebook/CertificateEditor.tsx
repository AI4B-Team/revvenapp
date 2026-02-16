import { useState, useRef } from 'react';
import { Award, Download, Palette, Type, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
  fontFamily: string;
  layout: 'classic' | 'modern' | 'minimal' | 'elegant';
}

export interface Certificate {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  description?: string;
  recipientLabel: string;
  dateLabel: string;
  signatureLabel?: string;
  signatureName?: string;
  signatureTitle?: string;
  logoUrl?: string;
  template: CertificateTemplate;
  createdAt: Date;
  updatedAt: Date;
}

interface CertificateEditorProps {
  certificate: Certificate;
  onCertificateUpdate: (certificate: Certificate) => void;
  recipientName?: string; // For preview
  completionDate?: Date;
}

const TEMPLATES: CertificateTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    backgroundColor: '#fffbeb',
    borderColor: '#d4af37',
    accentColor: '#1e3a5f',
    fontFamily: 'Georgia',
    layout: 'classic'
  },
  {
    id: 'modern',
    name: 'Modern',
    backgroundColor: '#ffffff',
    borderColor: '#10b981',
    accentColor: '#059669',
    fontFamily: 'Inter',
    layout: 'modern'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    accentColor: '#374151',
    fontFamily: 'Helvetica',
    layout: 'minimal'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    backgroundColor: '#1e1e2e',
    borderColor: '#c9a227',
    accentColor: '#fbbf24',
    fontFamily: 'Playfair Display',
    layout: 'elegant'
  }
];

const CertificateEditor = ({ 
  certificate, 
  onCertificateUpdate, 
  recipientName = 'John Doe',
  completionDate = new Date()
}: CertificateEditorProps) => {
  const [activeTab, setActiveTab] = useState<'design' | 'content'>('design');
  const [isDownloading, setIsDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleTemplateChange = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      onCertificateUpdate({
        ...certificate,
        template,
        updatedAt: new Date()
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${certificate.title || 'certificate'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Certificate downloaded!');
    } catch (e) {
      toast.error('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const isElegant = certificate.template.layout === 'elegant';
  const textColor = isElegant ? '#ffffff' : '#1a1a2e';
  const subtitleColor = isElegant ? '#c9a227' : certificate.template.accentColor;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-800">Certificate Designer</h2>
        </div>
        <Button onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          {isDownloading ? 'Exporting...' : 'Download'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'design'
              ? 'text-emerald-600 border-b-2 border-emerald-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Design
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'content'
              ? 'text-emerald-600 border-b-2 border-emerald-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Type className="w-4 h-4 inline mr-2" />
          Content
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Settings Panel */}
        <div className="w-72 border-r border-gray-200 overflow-y-auto p-4">
          {activeTab === 'design' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        certificate.template.id === template.id
                          ? 'border-emerald-500 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded mb-2 border"
                        style={{
                          backgroundColor: template.backgroundColor,
                          borderColor: template.borderColor
                        }}
                      />
                      <span className="text-xs font-medium text-gray-700">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={certificate.template.backgroundColor}
                    onChange={(e) => onCertificateUpdate({
                      ...certificate,
                      template: { ...certificate.template, backgroundColor: e.target.value },
                      updatedAt: new Date()
                    })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={certificate.template.backgroundColor}
                    onChange={(e) => onCertificateUpdate({
                      ...certificate,
                      template: { ...certificate.template, backgroundColor: e.target.value },
                      updatedAt: new Date()
                    })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={certificate.template.borderColor}
                    onChange={(e) => onCertificateUpdate({
                      ...certificate,
                      template: { ...certificate.template, borderColor: e.target.value },
                      updatedAt: new Date()
                    })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={certificate.template.borderColor}
                    onChange={(e) => onCertificateUpdate({
                      ...certificate,
                      template: { ...certificate.template, borderColor: e.target.value },
                      updatedAt: new Date()
                    })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={certificate.template.accentColor}
                    onChange={(e) => onCertificateUpdate({
                      ...certificate,
                      template: { ...certificate.template, accentColor: e.target.value },
                      updatedAt: new Date()
                    })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={certificate.template.accentColor}
                    onChange={(e) => onCertificateUpdate({
                      ...certificate,
                      template: { ...certificate.template, accentColor: e.target.value },
                      updatedAt: new Date()
                    })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</label>
                <Select
                  value={certificate.template.fontFamily}
                  onValueChange={(value) => onCertificateUpdate({
                    ...certificate,
                    template: { ...certificate.template, fontFamily: value },
                    updatedAt: new Date()
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Certificate Title</label>
                <Input
                  value={certificate.title}
                  onChange={(e) => onCertificateUpdate({ ...certificate, title: e.target.value, updatedAt: new Date() })}
                  placeholder="Certificate of Completion"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subtitle</label>
                <Input
                  value={certificate.subtitle || ''}
                  onChange={(e) => onCertificateUpdate({ ...certificate, subtitle: e.target.value, updatedAt: new Date() })}
                  placeholder="This is to certify that"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  value={certificate.description || ''}
                  onChange={(e) => onCertificateUpdate({ ...certificate, description: e.target.value, updatedAt: new Date() })}
                  placeholder="has successfully completed the course..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Label</label>
                <Input
                  value={certificate.recipientLabel}
                  onChange={(e) => onCertificateUpdate({ ...certificate, recipientLabel: e.target.value, updatedAt: new Date() })}
                  placeholder="Awarded to"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Label</label>
                <Input
                  value={certificate.dateLabel}
                  onChange={(e) => onCertificateUpdate({ ...certificate, dateLabel: e.target.value, updatedAt: new Date() })}
                  placeholder="Completed on"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Signature Name</label>
                <Input
                  value={certificate.signatureName || ''}
                  onChange={(e) => onCertificateUpdate({ ...certificate, signatureName: e.target.value, updatedAt: new Date() })}
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Signature Title</label>
                <Input
                  value={certificate.signatureTitle || ''}
                  onChange={(e) => onCertificateUpdate({ ...certificate, signatureTitle: e.target.value, updatedAt: new Date() })}
                  placeholder="Course Instructor"
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex-1 p-8 overflow-auto bg-gray-100 flex items-center justify-center">
          <div
            ref={certRef}
            className="w-full max-w-3xl aspect-[1.414/1] rounded-lg shadow-2xl p-8 relative"
            style={{
              backgroundColor: certificate.template.backgroundColor,
              border: `4px solid ${certificate.template.borderColor}`,
              fontFamily: certificate.template.fontFamily
            }}
          >
            {/* Decorative border */}
            <div
              className="absolute inset-4 border-2 rounded pointer-events-none"
              style={{ borderColor: certificate.template.borderColor, opacity: 0.5 }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
              {/* Award icon */}
              <Award
                className="w-16 h-16 mb-4"
                style={{ color: certificate.template.accentColor }}
              />

              {/* Title */}
              <h1
                className="text-4xl font-bold mb-2 tracking-wide"
                style={{ color: textColor }}
              >
                {certificate.title || 'Certificate of Completion'}
              </h1>

              {/* Subtitle */}
              <p
                className="text-lg mb-6"
                style={{ color: subtitleColor }}
              >
                {certificate.subtitle || 'This is to certify that'}
              </p>

              {/* Recipient */}
              <p
                className="text-3xl font-bold mb-4 border-b-2 pb-2 px-8"
                style={{ color: textColor, borderColor: certificate.template.borderColor }}
              >
                {recipientName}
              </p>

              {/* Description */}
              <p
                className="text-base mb-8 max-w-md"
                style={{ color: isElegant ? '#a0a0b0' : '#6b7280' }}
              >
                {certificate.description || 'has successfully completed all requirements of the course with distinction.'}
              </p>

              {/* Date */}
              <p
                className="text-sm mb-8"
                style={{ color: isElegant ? '#a0a0b0' : '#6b7280' }}
              >
                {certificate.dateLabel || 'Completed on'} {formatDate(completionDate)}
              </p>

              {/* Signature */}
              {certificate.signatureName && (
                <div className="mt-auto">
                  <div
                    className="border-t pt-2 px-12"
                    style={{ borderColor: certificate.template.borderColor }}
                  >
                    <p className="font-semibold" style={{ color: textColor }}>
                      {certificate.signatureName}
                    </p>
                    <p className="text-sm" style={{ color: isElegant ? '#a0a0b0' : '#6b7280' }}>
                      {certificate.signatureTitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateEditor;
