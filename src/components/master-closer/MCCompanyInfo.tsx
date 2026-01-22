import React, { useState } from 'react';
import { Building2, Globe, Users, DollarSign, MapPin, Linkedin, Twitter, TrendingUp, Search, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CompanyData {
  name: string;
  domain: string;
  industry: string;
  size: string;
  revenue: string;
  founded: string;
  location: string;
  description: string;
  linkedin: string;
  twitter: string;
  techStack: string[];
  recentNews: { title: string; date: string; source: string }[];
  keyPeople: { name: string; title: string; linkedin: string }[];
}

const MCCompanyInfo = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const companyData: CompanyData = {
    name: 'TechCorp Industries',
    domain: 'techcorp.com',
    industry: 'Enterprise Software',
    size: '501-1000 employees',
    revenue: '$50M - $100M',
    founded: '2015',
    location: 'San Francisco, CA',
    description: 'TechCorp is a leading provider of enterprise software solutions, specializing in digital transformation and cloud infrastructure.',
    linkedin: 'linkedin.com/company/techcorp',
    twitter: '@techcorp',
    techStack: ['Salesforce', 'AWS', 'Slack', 'HubSpot', 'Zoom', 'Jira'],
    recentNews: [
      { title: 'TechCorp announces Series C funding round', date: '2 days ago', source: 'TechCrunch' },
      { title: 'New partnership with Microsoft Cloud', date: '1 week ago', source: 'Business Wire' },
      { title: 'TechCorp named top workplace 2024', date: '2 weeks ago', source: 'Forbes' },
    ],
    keyPeople: [
      { name: 'Sarah Johnson', title: 'CEO', linkedin: 'linkedin.com/in/sarahjohnson' },
      { name: 'Mike Chen', title: 'CTO', linkedin: 'linkedin.com/in/mikechen' },
      { name: 'Lisa Park', title: 'VP of Sales', linkedin: 'linkedin.com/in/lisapark' },
    ],
  };

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Info</h1>
          <p className="text-muted-foreground">AI-powered company research and intelligence</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Enriched
        </Badge>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter company name or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Research
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{companyData.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>{companyData.domain}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </div>

            <p className="text-muted-foreground mb-6">{companyData.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Building2, label: 'Industry', value: companyData.industry },
                { icon: Users, label: 'Size', value: companyData.size },
                { icon: DollarSign, label: 'Revenue', value: companyData.revenue },
                { icon: MapPin, label: 'Location', value: companyData.location },
              ].map((item, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              {companyData.techStack.map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent News */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent News</h3>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {companyData.recentNews.map((news, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{news.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key People & Social */}
        <div className="space-y-6">
          {/* Social Links */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Social Presence</h3>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <Linkedin className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">LinkedIn</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors">
                <Twitter className="w-5 h-5 text-sky-500" />
                <span className="text-sm font-medium text-sky-500">{companyData.twitter}</span>
              </a>
            </div>
          </div>

          {/* Key People */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Key People</h3>
            <div className="space-y-3">
              {companyData.keyPeople.map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.title}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-700 dark:text-purple-400">AI Insights</h3>
            </div>
            <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
              <li>• Recent funding indicates expansion plans</li>
              <li>• Tech stack suggests enterprise focus</li>
              <li>• Growing team in sales department</li>
              <li>• High engagement on social platforms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCCompanyInfo;
