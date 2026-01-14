import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Copy,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'sonner';

const MCObjectionLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Objections', count: 10247, icon: MessageSquare },
    { id: 'price', name: 'Price/Budget', count: 2341, icon: DollarSign },
    { id: 'timing', name: 'Timing', count: 1523, icon: Clock },
    { id: 'authority', name: 'Authority', count: 987, icon: Users },
    { id: 'competition', name: 'Competition', count: 1876, icon: TrendingUp },
    { id: 'need', name: 'Need/Interest', count: 2134, icon: Star },
    { id: 'trust', name: 'Trust', count: 1386, icon: ThumbsUp }
  ];

  const objections = [
    {
      id: '1',
      objection: "We're happy with our current solution",
      category: 'competition',
      variations: 23,
      successRate: 78,
      responses: [
        {
          id: 'r1',
          text: "I completely understand, and that's actually what many of our happiest clients said initially. What I've found is that even when things are working well, there's often 1-2 pain points lurking beneath the surface. Mind if I ask you just 2-3 quick questions to see if we're even a fit?",
          context: 'Permission-based discovery approach',
          rating: 4.8,
          usedCount: 1243
        },
        {
          id: 'r2',
          text: "That's great to hear you have something that works! Out of curiosity, what made you agree to this call in the first place? There must have been something you were curious about or wanted to explore.",
          context: 'Uncover hidden pain points',
          rating: 4.6,
          usedCount: 987
        }
      ]
    },
    {
      id: '2',
      objection: "It's too expensive / We don't have the budget",
      category: 'price',
      variations: 34,
      successRate: 82,
      responses: [
        {
          id: 'r3',
          text: "I appreciate you being upfront about that. Just so I understand - when you say 'too expensive,' are you saying the price is higher than what you budgeted for this type of solution, or that you don't see enough value to justify the investment?",
          context: 'Clarify if price or value objection',
          rating: 4.9,
          usedCount: 2156
        },
        {
          id: 'r4',
          text: "That makes sense - budget is always a consideration. Let me ask you this: if I could show you that our solution would pay for itself within [timeframe] through [specific value], would that change the conversation?",
          context: 'ROI-focused reframe',
          rating: 4.7,
          usedCount: 1834
        }
      ]
    },
    {
      id: '3',
      objection: "I need to think about it / Can you send me some information?",
      category: 'timing',
      variations: 28,
      successRate: 71,
      responses: [
        {
          id: 'r5',
          text: "Absolutely, and I respect that this is an important decision. Before I do that, can I ask - what specifically do you need to think about? Is it the timing, the investment, how it fits with your team, or something else?",
          context: 'Uncover the real objection',
          rating: 4.5,
          usedCount: 1456
        },
        {
          id: 'r6',
          text: "Of course. In my experience, when someone says they need to think about it, there's usually one specific thing holding them back. What's that one thing for you?",
          context: 'Direct but respectful approach',
          rating: 4.4,
          usedCount: 1123
        }
      ]
    }
  ];

  const filteredObjections = objections.filter(obj => {
    const matchesCategory = selectedCategory === 'all' || obj.category === selectedCategory;
    const matchesSearch = obj.objection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Response copied to clipboard!');
  };

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Objection Library</h1>
        <p className="text-muted-foreground">
          10,000+ battle-tested responses to every objection you'll encounter
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search objections... (e.g., 'too expensive', 'not interested', 'need to think')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-colors text-lg text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-100 border-2 border-emerald-400'
                  : 'bg-card border border-border hover:border-emerald-300'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
              <div className={`text-sm font-medium mb-1 ${isActive ? 'text-emerald-700' : 'text-foreground'}`}>
                {category.name}
              </div>
              <div className="text-xs text-muted-foreground">{category.count.toLocaleString()}</div>
            </button>
          );
        })}
      </div>

      {/* Objections List */}
      <div className="space-y-6">
        {filteredObjections.map((objection) => (
          <div
            key={objection.id}
            className="bg-card border border-border rounded-xl p-6 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            {/* Objection Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-emerald-600">
                  "{objection.objection}"
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {objection.variations} variations
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    {objection.successRate}% success rate
                  </span>
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                Battle-Tested Responses
              </h4>
              {objection.responses.map((response) => (
                <div
                  key={response.id}
                  className="p-4 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-foreground">{response.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Used {response.usedCount.toLocaleString()} times
                      </span>
                    </div>
                    <button 
                      onClick={() => handleCopy(response.text)}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-medium transition-colors text-white"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>

                  <p className="text-sm leading-relaxed mb-3 text-foreground">{response.text}</p>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      💡 {response.context}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* View More */}
            <button className="mt-4 w-full py-3 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm font-medium transition-colors text-foreground">
              View All {objection.variations} Variations →
            </button>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-3xl font-bold mb-1 text-foreground">10,247</div>
          <div className="text-sm text-muted-foreground">Total Objections Covered</div>
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-3xl font-bold mb-1 text-emerald-600">+89%</div>
          <div className="text-sm text-muted-foreground">Objection Handling Improvement</div>
        </div>
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-3xl font-bold mb-1 text-foreground">2.1M+</div>
          <div className="text-sm text-muted-foreground">Successful Implementations</div>
        </div>
      </div>
    </div>
  );
};

export default MCObjectionLibrary;