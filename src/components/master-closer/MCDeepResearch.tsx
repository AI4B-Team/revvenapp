import React, { useState } from 'react';
import { Search, Globe, Linkedin, Twitter, Building2, Users, TrendingUp, FileText, Clock, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResearchResult {
  id: string;
  type: 'company' | 'person' | 'news' | 'social';
  title: string;
  description: string;
  source: string;
  date: string;
  relevance: number;
}

const MCDeepResearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [results, setResults] = useState<ResearchResult[]>([]);

  const sampleResults: ResearchResult[] = [
    { id: '1', type: 'company', title: 'TechCorp Q4 Earnings Report', description: 'Revenue up 23% YoY, expanding into European markets. CEO mentioned digital transformation as key priority.', source: 'SEC Filings', date: '1 week ago', relevance: 95 },
    { id: '2', type: 'person', title: 'Sarah Johnson - VP of Sales', description: 'Recently promoted from Director. 15+ years in enterprise sales. Published article on sales automation trends.', source: 'LinkedIn', date: '3 days ago', relevance: 92 },
    { id: '3', type: 'news', title: 'TechCorp Announces Partnership with Microsoft', description: 'Strategic partnership to integrate with Microsoft 365. Expected to accelerate enterprise adoption.', source: 'TechCrunch', date: '2 weeks ago', relevance: 88 },
    { id: '4', type: 'social', title: 'Company Culture Initiative', description: 'CEO posted about new hybrid work policy. Employees expressing positive sentiment.', source: 'Twitter', date: '5 days ago', relevance: 75 },
    { id: '5', type: 'company', title: 'Competitor Analysis', description: 'TechCorp using legacy CRM system. Potential pain point for our pitch.', source: 'BuiltWith', date: '1 day ago', relevance: 90 },
  ];

  const handleSearch = () => {
    setIsSearching(true);
    setSearchProgress(0);
    
    const interval = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSearching(false);
          setResults(sampleResults);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return <Building2 className="w-4 h-4" />;
      case 'person': return <Users className="w-4 h-4" />;
      case 'news': return <FileText className="w-4 h-4" />;
      case 'social': return <Twitter className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'company': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'person': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'news': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'social': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const dataSources = [
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { name: 'News', icon: FileText, color: 'text-orange-500' },
    { name: 'SEC Filings', icon: Building2, color: 'text-gray-600' },
    { name: 'Tech Stack', icon: Globe, color: 'text-emerald-500' },
    { name: 'Company Data', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Deep Research</h1>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          <p className="text-muted-foreground">Comprehensive prospect and company intelligence</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Enter company name, person, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
          <Button 
            size="lg" 
            className="bg-emerald-500 hover:bg-emerald-600 h-12 px-8"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Research
              </>
            )}
          </Button>
        </div>

        {/* Data Sources */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Searching:</span>
          {dataSources.map((source, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              <source.icon className={`w-3 h-3 mr-1 ${source.color}`} />
              {source.name}
            </Badge>
          ))}
        </div>

        {/* Progress */}
        {isSearching && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gathering intelligence...</span>
              <span className="font-medium text-foreground">{searchProgress}%</span>
            </div>
            <Progress value={searchProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Research Results</h2>
                <span className="text-sm text-muted-foreground">{results.length} findings</span>
              </div>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-border">
                {results.map((result) => (
                  <div key={result.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeColor(result.type)}>
                            {getTypeIcon(result.type)}
                            <span className="ml-1">{result.type}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">{result.source}</span>
                        </div>
                        <h3 className="font-medium text-foreground mb-1">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {result.relevance}% relevance
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">AI Summary</h3>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                TechCorp is a high-potential prospect going through digital transformation. 
                Recent funding and Microsoft partnership indicate budget availability. 
                VP of Sales Sarah Johnson is the ideal contact - she's focused on automation.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Key Talking Points</h3>
              <ul className="space-y-3">
                {[
                  'Reference their Microsoft partnership',
                  'Mention Q4 growth trajectory',
                  "Address Sarah's interest in automation",
                  'Highlight European expansion support',
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-emerald-600">{index + 1}</span>
                    </div>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Potential Objections</h3>
              <ul className="space-y-2 text-sm">
                {[
                  'Integration with existing Microsoft stack',
                  'Budget timing with recent expansion',
                  'Change management concerns',
                ].map((objection, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span>{objection}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && results.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Start Your Research</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Enter a company name, person, or domain to gather comprehensive intelligence from multiple sources.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['TechCorp', 'StartupXYZ', 'sarah.johnson@techcorp.com'].map((example, index) => (
              <Button 
                key={index}
                variant="outline" 
                size="sm"
                onClick={() => setSearchQuery(example)}
              >
                Try: {example}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MCDeepResearch;
