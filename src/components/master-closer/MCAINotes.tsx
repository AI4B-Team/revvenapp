import React, { useState } from 'react';
import { FileText, Sparkles, Clock, Search, Filter, Download, Share2, Tag, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Note {
  id: string;
  callId: string;
  contact: string;
  company: string;
  date: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  starred: boolean;
}

const MCAINotes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const notes: Note[] = [
    {
      id: '1',
      callId: 'call-123',
      contact: 'Sarah Johnson',
      company: 'TechCorp',
      date: 'Today, 2:30 PM',
      summary: 'Productive discovery call. Sarah expressed strong interest in our enterprise plan. Main concerns are implementation timeline and training requirements. Budget approved for Q1.',
      keyPoints: [
        'Current solution not meeting scale requirements',
        'Team of 50 sales reps needing onboarding',
        'Integration with Salesforce is critical',
        'Decision timeline: 2 weeks'
      ],
      actionItems: [
        'Send enterprise pricing proposal',
        'Schedule demo with IT team',
        'Prepare implementation timeline document',
        'Connect with their Salesforce admin'
      ],
      sentiment: 'positive',
      starred: true
    },
    {
      id: '2',
      callId: 'call-124',
      contact: 'Mike Chen',
      company: 'StartupXYZ',
      date: 'Today, 11:00 AM',
      summary: 'Initial exploration call. Mike is evaluating multiple solutions. Price sensitivity is high but interested in ROI case studies.',
      keyPoints: [
        'Early-stage startup with 10 sales reps',
        'Using spreadsheets currently',
        'Need quick implementation',
        'Budget constraints mentioned'
      ],
      actionItems: [
        'Share startup pricing tier info',
        'Send ROI calculator',
        'Schedule follow-up in 1 week'
      ],
      sentiment: 'neutral',
      starred: false
    },
    {
      id: '3',
      callId: 'call-125',
      contact: 'Lisa Park',
      company: 'EnterpriseCo',
      date: 'Yesterday',
      summary: 'Contract negotiation call. Close to signing but legal team has concerns about data security clauses.',
      keyPoints: [
        'Legal review in progress',
        'Security certification required',
        'Multi-year deal potential',
        'Executive sponsor confirmed'
      ],
      actionItems: [
        'Send SOC 2 certification',
        'Schedule call with their legal team',
        'Prepare contract amendments'
      ],
      sentiment: 'positive',
      starred: true
    },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'negative': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">AI Notes</h1>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Auto-generated
            </Badge>
          </div>
          <p className="text-muted-foreground">AI-generated summaries and action items from your calls</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Notes', value: '156', icon: FileText },
          { label: 'Action Items', value: '42', icon: CheckCircle2 },
          { label: 'This Week', value: '12', icon: Clock },
          { label: 'Starred', value: '8', icon: Star },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`p-4 bg-card border rounded-xl cursor-pointer transition-all hover:border-purple-300 ${
                selectedNote?.id === note.id ? 'border-purple-500 ring-1 ring-purple-500' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {note.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  <h3 className="font-medium text-foreground">{note.contact}</h3>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">{note.company}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{note.date}</span>
                <Badge className={getSentimentColor(note.sentiment)}>
                  {note.sentiment}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Note Viewer */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            <div className="bg-card border border-border rounded-xl">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{selectedNote.contact}</h2>
                      {selectedNote.starred && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <p className="text-muted-foreground">{selectedNote.company} • {selectedNote.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="p-6 space-y-6">
                  {/* Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold text-foreground">AI Summary</h3>
                    </div>
                    <p className="text-muted-foreground bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      {selectedNote.summary}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-foreground">Key Points</h3>
                    </div>
                    <ul className="space-y-2">
                      {selectedNote.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Items */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-semibold text-foreground">Action Items</h3>
                    </div>
                    <ul className="space-y-2">
                      {selectedNote.actionItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <input type="checkbox" className="w-4 h-4 accent-emerald-500" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Select a Note</h3>
              <p className="text-muted-foreground">Choose a call note from the list to view AI-generated insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCAINotes;
