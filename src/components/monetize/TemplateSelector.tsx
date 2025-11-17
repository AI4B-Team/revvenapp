import { useState } from 'react';

const TemplateSelector = () => {
  const [activeTab, setActiveTab] = useState('website');
  const [activeCategory, setActiveCategory] = useState('all');

  const tabs = [
    { id: 'website', label: 'Website' },
    { id: 'online-store', label: 'Online Store' },
    { id: 'funnels', label: 'Funnels' }
  ];

  const categories = [
    'All',
    'Academy / Community',
    'Art',
    'Business',
    'Fashion',
    'Membership',
    'Personal',
    'Photography',
    'Real Estate',
    'Restaurant',
    'School',
    'Services'
  ];

  const templates = [
    {
      id: 'nova',
      name: 'Nova',
      category: 'business',
      description: 'Catchy Headline About Your Services',
    },
    {
      id: 'cascade',
      name: 'Cascade',
      category: 'academy',
      description: 'Headline Of Your Academy',
    },
    {
      id: 'minerva',
      name: 'Minerva',
      category: 'services',
      description: 'Catchy Headline About Your Services',
    }
  ];

  const handleSelect = (templateId: string) => {
    console.log('Selected template:', templateId);
    // Add your selection logic here - navigate to customization page
  };

  const handlePreview = (templateId: string) => {
    console.log('Preview template:', templateId);
    // Add your preview logic here - open preview modal or new window
  };

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-6">
          Start By Selecting A Template
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Sidebar Categories */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-card rounded-lg shadow-sm p-2 border border-border">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category.toLowerCase())}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeCategory === category.toLowerCase()
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-border"
              >
                {/* Template Preview */}
                <div className="relative bg-gradient-to-br from-sidebar to-sidebar-hover h-64 overflow-hidden">
                  {/* Mockup Hero Section */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-sidebar-text">
                    <div className="absolute top-4 right-4 text-xs text-sidebar-text-muted">
                      Company
                    </div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-yellow rounded-full opacity-20 blur-3xl" />
                    <h3 className="text-2xl font-bold text-center mb-4 relative z-10">
                      {template.description}
                    </h3>
                    <button className="bg-brand-yellow text-primary px-6 py-2 rounded-lg font-semibold relative z-10 hover:opacity-90 transition-opacity">
                      Get Started
                    </button>
                  </div>
                  
                  {/* Thumbnail Images Section */}
                  <div className="absolute bottom-0 left-0 right-0 bg-sidebar/80 p-4">
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-20 h-16 bg-sidebar-hover rounded border border-border"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {template.name}
                  </h3>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSelect(template.id)}
                      className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                    >
                      SELECT
                    </button>
                    <button
                      onClick={() => handlePreview(template.id)}
                      className="flex-1 bg-card text-foreground px-6 py-3 rounded-full font-semibold border border-border hover:bg-muted transition-colors"
                    >
                      PREVIEW
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
