import React, { useState } from 'react';
import { Team } from '@/lib/marketplace/types';
import { Search, Check, Users } from 'lucide-react';
import { MarketplaceInput } from './MarketplaceInput';
import { cn } from '@/lib/utils';

interface TeamSelectorProps {
  teams: Team[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TeamSelector({ teams, selectedIds, onChange }: TeamSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTeam = (teamId: string) => {
    if (selectedIds.includes(teamId)) {
      onChange(selectedIds.filter(id => id !== teamId));
    } else {
      onChange([...selectedIds, teamId]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === teams.length) {
      onChange([]);
    } else {
      onChange(teams.map(t => t.id));
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <MarketplaceInput
          type="text"
          placeholder="Search Teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Select All */}
      <button
        type="button"
        onClick={toggleAll}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
      >
        <div
          className={cn(
            'h-4 w-4 rounded border-2 flex items-center justify-center',
            selectedIds.length === teams.length
              ? 'bg-primary border-primary'
              : 'border-border'
          )}
        >
          {selectedIds.length === teams.length && (
            <Check className="h-3 w-3 text-primary-foreground" />
          )}
        </div>
        Select All ({teams.length})
      </button>

      {/* Team List */}
      <div className="max-h-64 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-background">
        {filteredTeams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => toggleTeam(team.id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {/* Checkbox */}
            <div
              className={cn(
                'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                selectedIds.includes(team.id)
                  ? 'bg-primary border-primary'
                  : 'border-border'
              )}
            >
              {selectedIds.includes(team.id) && (
                <Check className="h-4 w-4 text-primary-foreground" />
              )}
            </div>

            {/* Icon */}
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-secondary-foreground" />
            </div>

            {/* Info */}
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-foreground">{team.name}</div>
              <div className="text-xs text-muted-foreground">
                {team.memberIds.length} members
              </div>
            </div>
          </button>
        ))}

        {filteredTeams.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No teams found
          </div>
        )}
      </div>

      {/* Selected Count */}
      <div className="text-sm text-muted-foreground">
        {selectedIds.length} Teams Selected
      </div>
    </div>
  );
}
