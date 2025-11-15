import React, { useState } from 'react';
import { Users, Mail, Globe, Plus, Trash2, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IntelligencePageProps {
  onNext: () => void;
  onBack: () => void;
}

interface SocialCreator {
  id: string;
  handle: string;
  platform: string;
  followers?: string;
}

interface EmailCompetitor {
  id: string;
  name: string;
  email: string;
  website?: string;
}

export default function IntelligencePage({ onNext, onBack }: IntelligencePageProps) {
  const [socialCreators, setSocialCreators] = useState<SocialCreator[]>([]);
  const [emailCompetitors, setEmailCompetitors] = useState<EmailCompetitor[]>([]);
  const [newCreatorHandle, setNewCreatorHandle] = useState('');
  const [newCreatorPlatform, setNewCreatorPlatform] = useState('Instagram');
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorWebsite, setNewCompetitorWebsite] = useState('');

  const handleAddCreator = () => {
    if (newCreatorHandle.trim()) {
      const newCreator: SocialCreator = {
        id: Math.random().toString(36).substr(2, 9),
        handle: newCreatorHandle,
        platform: newCreatorPlatform,
      };
      setSocialCreators([...socialCreators, newCreator]);
      setNewCreatorHandle('');
    }
  };

  const handleRemoveCreator = (id: string) => {
    setSocialCreators(socialCreators.filter(creator => creator.id !== id));
  };

  const handleAddCompetitor = () => {
    if (newCompetitorName.trim() && newCompetitorWebsite.trim()) {
      const domain = new URL(newCompetitorWebsite.startsWith('http') 
        ? newCompetitorWebsite 
        : `https://${newCompetitorWebsite}`).hostname;
      
      const monitoringEmail = `${domain.replace(/\./g, '-')}@revven.email`;
      
      const newCompetitor: EmailCompetitor = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCompetitorName,
        email: monitoringEmail,
        website: newCompetitorWebsite,
      };
      setEmailCompetitors([...emailCompetitors, newCompetitor]);
      setNewCompetitorName('');
      setNewCompetitorWebsite('');
    }
  };

  const handleRemoveCompetitor = (id: string) => {
    setEmailCompetitors(emailCompetitors.filter(comp => comp.id !== id));
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Instagram: 'bg-pink-500',
      Twitter: 'bg-blue-400',
      LinkedIn: 'bg-blue-600',
      TikTok: 'bg-black',
      YouTube: 'bg-red-500',
    };
    return colors[platform] || 'bg-gray-500';
  };

  const totalIntelligenceSources = socialCreators.length + emailCompetitors.length;

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      {/* Left Column - Input Forms */}
      <div className="space-y-6 overflow-y-auto pr-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Intelligence</h2>
          <p className="text-gray-400">
            Track competitors and industry leaders
          </p>
        </div>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="social">Social Creators</TabsTrigger>
            <TabsTrigger value="email">Email & Web</TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-4">
            <Card className="p-4 bg-slate-800 border-slate-700">
              <Label className="text-white mb-3 block">
                Add Social Media Creator
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="platform" className="text-gray-300 text-sm">
                    Platform
                  </Label>
                  <select
                    id="platform"
                    value={newCreatorPlatform}
                    onChange={(e) => setNewCreatorPlatform(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="handle" className="text-gray-300 text-sm">
                    Username/Handle
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="handle"
                      placeholder="@username"
                      value={newCreatorHandle}
                      onChange={(e) => setNewCreatorHandle(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    <Button onClick={handleAddCreator} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {socialCreators.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white">Tracked Creators</Label>
                {socialCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getPlatformColor(creator.platform)}`} />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {creator.handle}
                        </p>
                        <p className="text-gray-400 text-xs">{creator.platform}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCreator(creator.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {socialCreators.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Add social media creators to track their content strategies
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card className="p-4 bg-slate-800 border-slate-700">
              <Label className="text-white mb-3 block">
                Add Email/Website Competitor
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="competitor-name" className="text-gray-300 text-sm">
                    Company Name
                  </Label>
                  <Input
                    id="competitor-name"
                    placeholder="Competitor Inc."
                    value={newCompetitorName}
                    onChange={(e) => setNewCompetitorName(e.target.value)}
                    className="mt-1 bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="competitor-website" className="text-gray-300 text-sm">
                    Website URL
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="competitor-website"
                      placeholder="competitor.com"
                      value={newCompetitorWebsite}
                      onChange={(e) => setNewCompetitorWebsite(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    <Button onClick={handleAddCompetitor} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {emailCompetitors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white">Tracked Competitors</Label>
                {emailCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {competitor.name}
                          </p>
                          <p className="text-gray-400 text-xs">{competitor.website}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCompetitor(competitor.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                      <div className="flex items-start gap-2 mb-2">
                        <Mail className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-1">
                            Auto-generated monitoring email:
                          </p>
                          <code className="text-xs text-blue-300 break-all">
                            {competitor.email}
                          </code>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Subscribe to their newsletter using this email to track campaigns
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {emailCompetitors.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Add competitors to track their email and web strategies
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Continue to Characters
          </Button>
        </div>
      </div>

      {/* Right Column - Live Preview */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Intelligence Overview
        </h3>

        <div className="space-y-6">
          {/* Total Sources Count */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {totalIntelligenceSources}
              </div>
              <div className="text-sm text-gray-400">
                Intelligence Sources
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white mb-1">
                {socialCreators.length}
              </div>
              <div className="text-xs text-gray-400">Social Creators</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 text-center">
              <Mail className="h-6 w-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white mb-1">
                {emailCompetitors.length}
              </div>
              <div className="text-xs text-gray-400">Email/Web Competitors</div>
            </div>
          </div>

          {/* Social Platforms Breakdown */}
          {socialCreators.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Platform Distribution
              </h4>
              <div className="space-y-2">
                {Array.from(new Set(socialCreators.map(c => c.platform))).map(platform => {
                  const count = socialCreators.filter(c => c.platform === platform).length;
                  return (
                    <div key={platform} className="flex items-center justify-between bg-slate-900/50 rounded p-3 border border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPlatformColor(platform)}`} />
                        <span className="text-sm text-white">{platform}</span>
                      </div>
                      <Badge variant="secondary" className="bg-slate-800">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracked Creators List */}
          {socialCreators.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                Social Creators ({socialCreators.length})
              </h4>
              <div className="space-y-2">
                {socialCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="bg-slate-900/50 rounded p-3 border border-slate-700 flex items-center gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full ${getPlatformColor(creator.platform)} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">
                        {creator.handle}
                      </div>
                      <div className="text-xs text-gray-400">{creator.platform}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Tracking */}
          {emailCompetitors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                Competitors ({emailCompetitors.length})
              </h4>
              <div className="space-y-2">
                {emailCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="bg-slate-900/50 rounded p-3 border border-slate-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <div className="text-sm text-white font-medium truncate">
                        {competitor.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {competitor.website}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-blue-400 flex-shrink-0" />
                        <code className="text-xs text-blue-300 truncate">
                          {competitor.email}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalIntelligenceSources === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Add intelligence sources to track competitor strategies
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
