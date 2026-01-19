import React, { useState } from 'react';
import { Palette, Upload, Globe, Check, Image, Type, Link } from 'lucide-react';

const MCWhiteLabel: React.FC = () => {
  const [companyName, setCompanyName] = useState('Master Closer');
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [secondaryColor, setSecondaryColor] = useState('#6366F1');

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">White-Label Settings</h1>
        <p className="text-muted-foreground">Customize the platform with your brand identity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Name */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Type className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Company Name</h3>
                <p className="text-sm text-muted-foreground">This appears in the header and emails</p>
              </div>
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground"
              placeholder="Your Company Name"
            />
          </div>

          {/* Logo Upload */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Logo</h3>
                <p className="text-sm text-muted-foreground">Recommended: 200x50px, PNG or SVG</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Drop your logo here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Favicon</h3>
                <p className="text-sm text-muted-foreground">32x32px, ICO or PNG</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Drop your favicon here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Brand Colors</h3>
                <p className="text-sm text-muted-foreground">Customize the color scheme</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Link className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Custom Domain</h3>
                <p className="text-sm text-muted-foreground">Use your own domain for the platform</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="app.yourcompany.com"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Point your domain's CNAME record to: closer.yourplatform.com
            </p>
          </div>

          {/* Save Button */}
          <button className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Save White-Label Settings
          </button>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 sticky top-8">
            <h3 className="font-semibold text-foreground mb-4">Preview</h3>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-lg">
                    {companyName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{companyName}</h4>
                  <p className="text-xs text-muted-foreground">AI Sales Platform</p>
                </div>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-8 rounded-lg w-full"
                  style={{ backgroundColor: primaryColor }}
                />
                <div 
                  className="h-8 rounded-lg w-3/4"
                  style={{ backgroundColor: secondaryColor }}
                />
                <div className="h-8 rounded-lg w-1/2 bg-muted-foreground/20" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              This is how your branded platform will look
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCWhiteLabel;
