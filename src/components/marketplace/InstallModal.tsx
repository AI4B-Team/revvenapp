import React, { useState } from 'react';
import { MarketplaceApp, WorkspaceMember, Team } from '@/lib/marketplace/types';
import { MarketplaceModal } from './MarketplaceModal';
import { MarketplaceDropdown } from './MarketplaceDropdown';
import { MemberSelector } from './MemberSelector';
import { TeamSelector } from './TeamSelector';
import { Button } from '@/components/ui/button';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: MarketplaceApp;
  members: WorkspaceMember[];
  teams: Team[];
  onInstall: (accessMode: string, userIds: string[], teamIds: string[]) => void;
}

export function InstallModal({
  isOpen,
  onClose,
  app,
  members,
  teams,
  onInstall
}: InstallModalProps) {
  const [accessMode, setAccessMode] = useState('all_members');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInstall = async () => {
    setIsSubmitting(true);
    try {
      await onInstall(accessMode, selectedUserIds, selectedTeamIds);
      onClose();
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (accessMode === 'all_members') return true;
    if (accessMode === 'select_users' && selectedUserIds.length > 0) return true;
    if (accessMode === 'select_teams' && selectedTeamIds.length > 0) return true;
    return false;
  };

  return (
    <MarketplaceModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Install ${app.name}`}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleInstall}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? 'Installing...' : 'Proceed to Install'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* App Info */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-3xl">{app.icon}</div>
          <div>
            <h3 className="font-medium text-foreground">{app.name}</h3>
            <p className="text-sm text-muted-foreground">{app.description}</p>
          </div>
        </div>

        {/* Access Control */}
        <div className="space-y-4">
          <MarketplaceDropdown
            label="Members Who Can Access This App"
            options={[
              { value: 'all_members', label: 'All Members In This Workspace' },
              { value: 'select_users', label: 'Select Users' },
              { value: 'select_teams', label: 'Select Teams' }
            ]}
            value={accessMode}
            onChange={setAccessMode}
          />

          {/* Conditional Selectors */}
          {accessMode === 'select_users' && (
            <MemberSelector
              members={members}
              selectedIds={selectedUserIds}
              onChange={setSelectedUserIds}
            />
          )}

          {accessMode === 'select_teams' && (
            <TeamSelector
              teams={teams}
              selectedIds={selectedTeamIds}
              onChange={setSelectedTeamIds}
            />
          )}
        </div>

        {/* Helper Text */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>NOTE:</strong> You can change access permissions later from the app settings.
          </p>
        </div>
      </div>
    </MarketplaceModal>
  );
}
