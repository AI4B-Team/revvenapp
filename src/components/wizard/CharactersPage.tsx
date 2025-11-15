import React, { useState } from 'react';
import { User, Plus, Trash2, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CharactersPageProps {
  onNext: () => void;
  onBack: () => void;
}

interface Character {
  id: string;
  emoji: string;
  name: string;
  role: string;
  expertise: string;
  description: string;
}

const DEFAULT_CHARACTERS: Omit<Character, 'id'>[] = [
  {
    emoji: '✍️',
    name: 'The Copywriter',
    role: 'Ad Copy Specialist',
    expertise: 'Persuasive messaging, hooks, CTAs',
    description: 'Crafts compelling ad copy that converts browsers into buyers with data-driven persuasion techniques.'
  },
  {
    emoji: '🎨',
    name: 'The Creator',
    role: 'Content Designer',
    expertise: 'Visual storytelling, brand narratives',
    description: 'Develops engaging content strategies and creative concepts that resonate with your target audience.'
  },
  {
    emoji: '📱',
    name: 'The Social Manager',
    role: 'Community Strategist',
    expertise: 'Engagement, community building, trends',
    description: 'Manages social presence, builds communities, and keeps your brand trending across all platforms.'
  },
  {
    emoji: '🎯',
    name: 'The Media Buyer',
    role: 'Campaign Optimizer',
    expertise: 'Ad targeting, budget optimization, ROI',
    description: 'Optimizes ad campaigns for maximum ROI through strategic targeting and continuous performance analysis.'
  }
];

export default function CharactersPage({ onNext, onBack }: CharactersPageProps) {
  const [characters, setCharacters] = useState<Character[]>(
    DEFAULT_CHARACTERS.map(char => ({
      ...char,
      id: Math.random().toString(36).substr(2, 9)
    }))
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    emoji: '👤',
    name: '',
    role: '',
    expertise: '',
    description: ''
  });

  const handleCreateCharacter = () => {
    if (newCharacter.name.trim() && newCharacter.role.trim()) {
      const character: Character = {
        id: Math.random().toString(36).substr(2, 9),
        ...newCharacter
      };
      setCharacters([...characters, character]);
      setNewCharacter({
        emoji: '👤',
        name: '',
        role: '',
        expertise: '',
        description: ''
      });
      setIsCreating(false);
    }
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const handleUpdateCharacter = (id: string, field: keyof Character, value: string) => {
    setCharacters(characters.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      {/* Left Column - Character Management */}
      <div className="space-y-6 overflow-y-auto pr-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Characters</h2>
          <p className="text-gray-400">
            Your brand's AI team members
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-white">Your Characters ({characters.length})</Label>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Character
            </Button>
          )}
        </div>

        {/* New Character Form */}
        {isCreating && (
          <Card className="p-4 bg-slate-800 border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Create New Character</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Emoji Avatar</Label>
              <Input
                value={newCharacter.emoji}
                onChange={(e) => setNewCharacter({ ...newCharacter, emoji: e.target.value })}
                placeholder="👤"
                maxLength={2}
                className="mt-1 bg-slate-900 border-slate-600 text-white text-2xl text-center"
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Name</Label>
              <Input
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                placeholder="Character name"
                className="mt-1 bg-slate-900 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Role</Label>
              <Input
                value={newCharacter.role}
                onChange={(e) => setNewCharacter({ ...newCharacter, role: e.target.value })}
                placeholder="e.g., Email Marketing Specialist"
                className="mt-1 bg-slate-900 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Expertise</Label>
              <Input
                value={newCharacter.expertise}
                onChange={(e) => setNewCharacter({ ...newCharacter, expertise: e.target.value })}
                placeholder="e.g., Email campaigns, automation, nurture sequences"
                className="mt-1 bg-slate-900 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Description</Label>
              <Textarea
                value={newCharacter.description}
                onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                placeholder="What does this character do?"
                className="mt-1 bg-slate-900 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <Button
              onClick={handleCreateCharacter}
              className="w-full"
              disabled={!newCharacter.name.trim() || !newCharacter.role.trim()}
            >
              Create Character
            </Button>
          </Card>
        )}

        {/* Character List */}
        <div className="space-y-3">
          {characters.map((character) => (
            <Card key={character.id} className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{character.emoji}</div>
                  <div>
                    <h4 className="text-white font-semibold">{character.name}</h4>
                    <p className="text-gray-400 text-sm">{character.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCharacter(character.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {character.expertise && (
                <div className="mb-3">
                  <Label className="text-gray-400 text-xs">Expertise</Label>
                  <p className="text-gray-300 text-sm">{character.expertise}</p>
                </div>
              )}

              {character.description && (
                <div>
                  <Label className="text-gray-400 text-xs">Description</Label>
                  <p className="text-gray-300 text-sm">{character.description}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {characters.length === 0 && !isCreating && (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-4">
              No characters yet. Add your first AI character to get started.
            </p>
            <Button onClick={() => setIsCreating(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Character
            </Button>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Complete Setup
          </Button>
        </div>
      </div>

      {/* Right Column - Character Preview */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          AI Team Preview
        </h3>

        <div className="space-y-6">
          {/* Team Stats */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {characters.length}
              </div>
              <div className="text-sm text-gray-400">
                AI Team Members
              </div>
            </div>
          </div>

          {/* Character Cards */}
          {characters.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">Your AI Team</h4>
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="text-4xl flex-shrink-0">{character.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-semibold mb-1">
                        {character.name}
                      </h5>
                      <Badge variant="secondary" className="bg-slate-800 text-xs mb-2">
                        {character.role}
                      </Badge>
                      {character.expertise && (
                        <p className="text-xs text-gray-400 mb-2">
                          <span className="text-gray-500">Expertise:</span> {character.expertise}
                        </p>
                      )}
                      {character.description && (
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {character.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Your AI team members will appear here
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Add characters to build your custom AI team
              </p>
            </div>
          )}

          {/* Team Capabilities Summary */}
          {characters.length > 0 && (
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <h4 className="text-sm font-semibold text-white">Team Capabilities</h4>
              </div>
              <div className="space-y-2">
                {characters.map((character) => (
                  <div key={character.id} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{character.emoji}</span>
                    <span className="text-gray-300">{character.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
