import React, { useState } from 'react';
import { WorkspaceMember } from '@/lib/marketplace/types';
import { Search, Check } from 'lucide-react';
import { MarketplaceInput } from './MarketplaceInput';
import { cn } from '@/lib/utils';

interface MemberSelectorProps {
  members: WorkspaceMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function MemberSelector({ members, selectedIds, onChange }: MemberSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter(member =>
    member.user.name.toLowerCase().includes(search.toLowerCase()) ||
    member.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter(id => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === members.length) {
      onChange([]);
    } else {
      onChange(members.map(m => m.userId));
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <MarketplaceInput
          type="text"
          placeholder="Search members..."
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
            selectedIds.length === members.length
              ? 'bg-primary border-primary'
              : 'border-border'
          )}
        >
          {selectedIds.length === members.length && (
            <Check className="h-3 w-3 text-primary-foreground" />
          )}
        </div>
        Select all ({members.length})
      </button>

      {/* Member List */}
      <div className="max-h-64 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-background">
        {filteredMembers.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => toggleMember(member.userId)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {/* Checkbox */}
            <div
              className={cn(
                'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                selectedIds.includes(member.userId)
                  ? 'bg-primary border-primary'
                  : 'border-border'
              )}
            >
              {selectedIds.includes(member.userId) && (
                <Check className="h-4 w-4 text-primary-foreground" />
              )}
            </div>

            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary">
                {member.user.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-foreground">
                {member.user.name}
              </div>
              <div className="text-xs text-muted-foreground">{member.user.email}</div>
            </div>

            {/* Role Badge */}
            {member.role !== 'member' && (
              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                {member.role}
              </span>
            )}
          </button>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No members found
          </div>
        )}
      </div>

      {/* Selected Count */}
      <div className="text-sm text-muted-foreground">
        {selectedIds.length} of {members.length} members selected
      </div>
    </div>
  );
}
