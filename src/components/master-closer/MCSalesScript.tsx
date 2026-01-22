import React, { useState } from 'react';
import { FileText, Plus, Copy, Edit3, Trash2, Sparkles, Play, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Script {
  id: string;
  name: string;
  category: string;
  lastUsed: string;
  successRate: number;
  sections: { title: string; content: string }[];
}

const MCSalesScript = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const scripts: Script[] = [
    {
      id: '1',
      name: 'Discovery Call Script',
      category: 'Discovery',
      lastUsed: 'Today',
      successRate: 78,
      sections: [
        { title: 'Opening', content: "Hi [Name], thanks for taking the time to speak with me today. I know you're busy, so I'll keep this focused. Can you tell me a bit about what prompted you to take this call?" },
        { title: 'Pain Points', content: "What's the biggest challenge you're facing with [problem area] right now? How long has this been an issue? What have you tried so far to solve it?" },
        { title: 'Impact', content: "If you don't solve this in the next 6-12 months, what do you think that costs your business? Not just financially, but in terms of time, stress, and opportunity cost?" },
        { title: 'Vision', content: "If we could wave a magic wand and solve this perfectly, what would that look like for you? How would things be different?" },
      ]
    },
    {
      id: '2',
      name: 'Product Demo Script',
      category: 'Demo',
      lastUsed: 'Yesterday',
      successRate: 82,
      sections: [
        { title: 'Recap', content: "Before we dive in, let me quickly recap what we discussed. You mentioned [pain points]. Is there anything else you'd like me to address today?" },
        { title: 'Demo', content: "Let me show you exactly how we solve [problem]. I'm going to focus on the features most relevant to your situation..." },
      ]
    },
    {
      id: '3',
      name: 'Closing Script',
      category: 'Closing',
      lastUsed: '3 days ago',
      successRate: 65,
      sections: [
        { title: 'Summary', content: "So we've covered how [solution] addresses [pain points]. On a scale of 1-10, how confident are you that this would work for your team?" },
        { title: 'Objection Handling', content: "I understand [objection]. Many of our clients felt the same way initially. What helped them was..." },
      ]
    },
    {
      id: '4',
      name: 'Cold Call Script',
      category: 'Prospecting',
      lastUsed: '1 week ago',
      successRate: 45,
      sections: [
        { title: 'Hook', content: "Hi [Name], I'm calling because [relevant trigger]. I help companies like [similar company] solve [problem]. Does that resonate with you?" },
      ]
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Discovery': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Demo': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Closing': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Prospecting': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Scripts</h1>
          <p className="text-muted-foreground">Manage and use your sales scripts during calls</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditor(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowEditor(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Script
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search scripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scripts List */}
        <div className="lg:col-span-1 space-y-3">
          {scripts.map((script) => (
            <div
              key={script.id}
              onClick={() => setSelectedScript(script)}
              className={`p-4 bg-card border rounded-xl cursor-pointer transition-all hover:border-emerald-300 ${
                selectedScript?.id === script.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{script.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getCategoryColor(script.category)}>{script.category}</Badge>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span>Last used: {script.lastUsed}</span>
                <span className="text-emerald-600 font-medium">{script.successRate}% success</span>
              </div>
            </div>
          ))}
        </div>

        {/* Script Viewer */}
        <div className="lg:col-span-2">
          {selectedScript ? (
            <div className="bg-card border border-border rounded-xl">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedScript.name}</h2>
                    <Badge className={getCategoryColor(selectedScript.category)}>{selectedScript.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
                      <Play className="w-4 h-4 mr-2" />
                      Use in Call
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {selectedScript.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                    </div>
                    <div className="pl-6">
                      <p className="text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Select a Script</h3>
              <p className="text-muted-foreground">Choose a script from the list to view its contents</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Create New Script</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)}>×</Button>
            </div>
            <Input placeholder="Script name" />
            <Input placeholder="Category (e.g., Discovery, Demo, Closing)" />
            <Textarea placeholder="Script content..." rows={10} />
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600">Save Script</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCSalesScript;
