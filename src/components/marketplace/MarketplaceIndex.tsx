import React, { useState } from 'react';
import { MarketplaceApp, AppInstall, WorkspaceMember, Team } from '@/lib/marketplace/types';
import { AppGrid } from './AppGrid';
import { InstallModal } from './InstallModal';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { MarketplaceInput } from './MarketplaceInput';

interface MarketplaceIndexProps {
  apps: MarketplaceApp[];
  installs: AppInstall[];
  members: WorkspaceMember[];
  teams: Team[];
  hasLicense: boolean;
  onInstall: (appId: string, accessMode: string, userIds: string[], teamIds: string[]) => void;
  onOpenApp: (appId: string) => void;
}

export function MarketplaceIndex({
  apps,
  installs,
  members,
  teams,
  hasLicense,
  onInstall,
  onOpenApp
}: MarketplaceIndexProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [installModalApp, setInstallModalApp] = useState<MarketplaceApp | null>(null);

  const categories = Array.from(new Set(apps.map(app => app.category)));

  const filteredApps = apps.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = async (
    accessMode: string,
    userIds: string[],
    teamIds: string[]
  ) => {
    if (installModalApp) {
      await onInstall(installModalApp.id, accessMode, userIds, teamIds);
      setInstallModalApp(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">APPS Marketplace</h1>
              <p className="text-muted-foreground mt-1">
                Install apps to extend your REVVEN workspace
              </p>
            </div>
            {!hasLicense && (
              <Button variant="outline">
                <span className="mr-2">🔓</span>
                Upgrade for White-Label
              </Button>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <MarketplaceInput
                type="text"
                placeholder="Search apps..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Apps
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredApps.length} apps {selectedCategory && `in ${selectedCategory}`}
          </p>
        </div>

        <AppGrid
          apps={filteredApps}
          installs={installs}
          onInstall={(app) => setInstallModalApp(app)}
          onOpen={(app) => onOpenApp(app.id)}
          hasLicense={hasLicense}
        />

        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No apps found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Install Modal */}
      {installModalApp && (
        <InstallModal
          isOpen={!!installModalApp}
          onClose={() => setInstallModalApp(null)}
          app={installModalApp}
          members={members}
          teams={teams}
          onInstall={handleInstall}
        />
      )}
    </div>
  );
}
