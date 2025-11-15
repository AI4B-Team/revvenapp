import React, { useState } from 'react';
import { Upload, Palette, Type, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

interface IdentityPageProps {
  formData: {
    logo?: File | string;
    brandName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    primaryFont: string;
    secondaryFont: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

const IdentityPage: React.FC<IdentityPageProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
  canGoBack = false,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.brandName?.trim()) {
      newErrors.brandName = 'Brand name is required';
    }

    if (!formData.primaryColor) {
      newErrors.primaryColor = 'Primary color is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  const fontOptions = [
    'Inter',
    'Roboto',
    'Poppins',
    'Montserrat',
    'Open Sans',
    'Lato',
    'Raleway',
    'Nunito',
    'Playfair Display',
    'Merriweather',
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Palette size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Brand Identity</h1>
            <p className="text-sm text-gray-600">Define your visual brand elements</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Step 1 of 5</span>
            <span>20% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '20%' }}></div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable 2 Column Layout */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN - Inputs */}
            <div className="space-y-6">
              
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => onUpdate({ brandName: e.target.value })}
                  placeholder="Enter your brand name"
                  className={`w-full px-4 py-3 border ${errors.brandName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.brandName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.brandName}
                  </p>
                )}
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Brand Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  {logoPreview || (typeof formData.logo === 'string' && formData.logo) ? (
                    <div className="space-y-3">
                      <img 
                        src={logoPreview || formData.logo as string} 
                        alt="Logo preview" 
                        className="max-h-24 mx-auto"
                      />
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors text-sm">
                        <Upload size={16} />
                        Change Logo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Upload your brand logo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG or SVG (Max 5MB)
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Choose File
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Brand Colors</h3>
                <div className="space-y-4">
                  
                  {/* Primary Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor || '#3B82F6'}
                        onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                        className="w-14 h-11 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor || '#3B82F6'}
                        onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                        placeholder="#3B82F6"
                        className={`flex-1 px-3 py-2 border ${errors.primaryColor ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    {errors.primaryColor && (
                      <p className="mt-1 text-xs text-red-500">{errors.primaryColor}</p>
                    )}
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.secondaryColor || '#6B7280'}
                        onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                        className="w-14 h-11 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor || '#6B7280'}
                        onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                        placeholder="#6B7280"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.accentColor || '#10B981'}
                        onChange={(e) => onUpdate({ accentColor: e.target.value })}
                        className="w-14 h-11 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.accentColor || '#10B981'}
                        onChange={(e) => onUpdate({ accentColor: e.target.value })}
                        placeholder="#10B981"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Type size={16} />
                  Typography
                </h3>
                <div className="space-y-4">
                  
                  {/* Primary Font */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Font (Headings)
                    </label>
                    <select
                      value={formData.primaryFont || 'Inter'}
                      onChange={(e) => onUpdate({ primaryFont: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Font */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Font (Body)
                    </label>
                    <select
                      value={formData.secondaryFont || 'Inter'}
                      onChange={(e) => onUpdate({ secondaryFont: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - Preview (Sticky) */}
            <div>
              <div className="lg:sticky lg:top-0">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Brand Preview</h3>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="space-y-6">
                      {/* Logo and Name */}
                      <div className="text-center">
                        {(logoPreview || formData.logo) && (
                          <img 
                            src={logoPreview || formData.logo as string} 
                            alt="Logo" 
                            className="h-12 mx-auto mb-3"
                          />
                        )}
                        <h2 
                          className="text-xl font-bold"
                          style={{ 
                            color: formData.primaryColor || '#3B82F6',
                            fontFamily: formData.primaryFont || 'Inter'
                          }}
                        >
                          {formData.brandName || 'Your Brand Name'}
                        </h2>
                      </div>

                      {/* Preview Text */}
                      <div className="border-t border-gray-200 pt-4">
                        <p 
                          className="text-sm text-gray-700"
                          style={{ fontFamily: formData.secondaryFont || 'Inter' }}
                        >
                          This is how your brand will appear across all your content and campaigns.
                        </p>
                      </div>

                      {/* Color Swatches */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex gap-2 justify-center">
                          <div 
                            className="w-14 h-14 rounded-lg shadow-sm border border-gray-200"
                            style={{ backgroundColor: formData.primaryColor || '#3B82F6' }}
                            title="Primary"
                          ></div>
                          <div 
                            className="w-14 h-14 rounded-lg shadow-sm border border-gray-200"
                            style={{ backgroundColor: formData.secondaryColor || '#6B7280' }}
                            title="Secondary"
                          ></div>
                          <div 
                            className="w-14 h-14 rounded-lg shadow-sm border border-gray-200"
                            style={{ backgroundColor: formData.accentColor || '#10B981' }}
                            title="Accent"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer - Fixed/Sticky */}
      <div className="flex-shrink-0 px-8 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
        {canGoBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
        )}
        
        <div className={`${!canGoBack ? 'ml-auto' : ''}`}>
          <button
            onClick={validateAndProceed}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Continue
            <Check size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityPage;
