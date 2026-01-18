import React, { useState } from 'react';
import {
  Phone,
  DollarSign,
  Briefcase,
  Users,
  Heart,
  MessageSquare,
  Target,
  Handshake,
  UserCheck,
  Award,
  Lightbulb,
  Shield,
  TrendingUp,
  Building,
  Search,
  Check,
  Sparkles,
  X,
  ArrowRight
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export interface ConversationTemplate {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  objective: string;
  keyPhases: string[];
  commonObjections: string[];
  recommendedTone: string;
}

interface MCConversationTemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: ConversationTemplate) => void;
  selectedTemplate?: ConversationTemplate | null;
}

const templateCategories = [
  { id: 'sales', name: 'Sales', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'business', name: 'Business', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'recruiting', name: 'Recruiting', icon: <UserCheck className="w-5 h-5" /> },
  { id: 'leadership', name: 'Leadership', icon: <Award className="w-5 h-5" /> },
  { id: 'coaching', name: 'Coaching', icon: <Lightbulb className="w-5 h-5" /> },
  { id: 'personal', name: 'Personal', icon: <Heart className="w-5 h-5" /> },
];

const templates: ConversationTemplate[] = [
  // Sales
  {
    id: 'discovery-call',
    name: 'Discovery Call',
    category: 'sales',
    icon: <Search className="w-5 h-5" />,
    description: 'Uncover prospect needs and qualify opportunities',
    objective: 'Identify pain points and determine fit',
    keyPhases: ['Rapport', 'Situation', 'Problem', 'Implication', 'Need-Payoff'],
    commonObjections: ['Not the right time', 'Happy with current solution', 'Need to think about it'],
    recommendedTone: 'Curious, consultative, patient'
  },
  {
    id: 'inbound-sales',
    name: 'Inbound Sales',
    category: 'sales',
    icon: <Phone className="w-5 h-5" />,
    description: 'Convert warm leads who reached out',
    objective: 'Qualify and close interested prospects',
    keyPhases: ['Acknowledge Interest', 'Discovery', 'Present Solution', 'Handle Objections', 'Close'],
    commonObjections: ['Just gathering info', 'Comparing options', 'Budget concerns'],
    recommendedTone: 'Enthusiastic, helpful, efficient'
  },
  {
    id: 'outbound-sales',
    name: 'Outbound Sales',
    category: 'sales',
    icon: <Target className="w-5 h-5" />,
    description: 'Cold outreach and prospecting calls',
    objective: 'Generate interest and book next steps',
    keyPhases: ['Pattern Interrupt', 'Permission', 'Value Prop', 'Qualification', 'Close for Next Step'],
    commonObjections: ['Not interested', 'Send an email', 'Already have a vendor'],
    recommendedTone: 'Confident, concise, respectful'
  },
  {
    id: 'high-ticket-sales',
    name: 'High-Ticket Sales',
    category: 'sales',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Premium offers and enterprise deals',
    objective: 'Close high-value opportunities',
    keyPhases: ['Build Trust', 'Deep Discovery', 'Present Transformation', 'Justify Investment', 'Decision'],
    commonObjections: ['Too expensive', 'Need board approval', 'ROI concerns'],
    recommendedTone: 'Premium, confident, transformational'
  },
  {
    id: 'objection-handling',
    name: 'Objection Handling',
    category: 'sales',
    icon: <Shield className="w-5 h-5" />,
    description: 'Navigate and resolve resistance',
    objective: 'Turn objections into opportunities',
    keyPhases: ['Listen', 'Acknowledge', 'Explore', 'Reframe', 'Confirm'],
    commonObjections: ['Price', 'Timing', 'Competition', 'Authority', 'Need'],
    recommendedTone: 'Empathetic, calm, curious'
  },
  {
    id: 'renewal-retention',
    name: 'Retention',
    category: 'sales',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Retain and upsell existing customers',
    objective: 'Secure renewal and expand relationship',
    keyPhases: ['Review Success', 'Identify New Goals', 'Present Options', 'Handle Concerns', 'Commit'],
    commonObjections: ['Budget cuts', 'Not using it enough', 'Switching to competitor'],
    recommendedTone: 'Appreciative, strategic, value-focused'
  },

  // Business
  {
    id: 'investor-pitch',
    name: 'Investor Pitch',
    category: 'business',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Raise capital from investors',
    objective: 'Secure investment commitment',
    keyPhases: ['Hook', 'Problem', 'Solution', 'Traction', 'Ask'],
    commonObjections: ['Market size', 'Competition', 'Team experience', 'Valuation'],
    recommendedTone: 'Visionary, confident, data-driven'
  },
  {
    id: 'partner-jv-call',
    name: 'Partnership',
    category: 'business',
    icon: <Handshake className="w-5 h-5" />,
    description: 'Establish strategic partnerships',
    objective: 'Align on mutual value and next steps',
    keyPhases: ['Introduction', 'Mutual Discovery', 'Synergy Exploration', 'Terms Discussion', 'Commitment'],
    commonObjections: ['Resource constraints', 'Competing priorities', 'Trust concerns'],
    recommendedTone: 'Collaborative, strategic, win-win focused'
  },
  {
    id: 'vendor-negotiation',
    name: 'Negotiation',
    category: 'business',
    icon: <Building className="w-5 h-5" />,
    description: 'Negotiate contracts and pricing',
    objective: 'Secure favorable terms',
    keyPhases: ['Requirements', 'Options', 'Leverage', 'Negotiate', 'Agreement'],
    commonObjections: ['Best price already', 'Standard terms', 'Competitors offering more'],
    recommendedTone: 'Firm, fair, prepared'
  },
  {
    id: 'real-estate-deal',
    name: 'Real Estate',
    category: 'business',
    icon: <Building className="w-5 h-5" />,
    description: 'Close property transactions',
    objective: 'Move deal toward closing',
    keyPhases: ['Rapport', 'Motivation', 'Terms', 'Objections', 'Agreement'],
    commonObjections: ['Price too high', 'Need to see more options', 'Market timing'],
    recommendedTone: 'Professional, knowledgeable, patient'
  },
  {
    id: 'client-onboarding',
    name: 'Onboarding',
    category: 'business',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'Welcome and activate new clients',
    objective: 'Set up for success and quick wins',
    keyPhases: ['Welcome', 'Expectations', 'Setup', 'First Win', 'Support Plan'],
    commonObjections: ['Overwhelmed', 'Different expectations', 'Resource constraints'],
    recommendedTone: 'Warm, organized, supportive'
  },

  // Recruiting
  {
    id: 'hiring-interview',
    name: 'Hiring',
    category: 'recruiting',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'Evaluate and attract top talent',
    objective: 'Assess fit and sell the opportunity',
    keyPhases: ['Introduction', 'Background', 'Competency', 'Culture Fit', 'Close'],
    commonObjections: ['Salary expectations', 'Remote work', 'Growth concerns'],
    recommendedTone: 'Professional, curious, authentic'
  },
  {
    id: 'job-candidate-interview',
    name: 'Job Interview',
    category: 'recruiting',
    icon: <Award className="w-5 h-5" />,
    description: 'Navigate your job interviews',
    objective: 'Present yourself effectively and land the role',
    keyPhases: ['Introduction', 'Experience', 'Skills Demo', 'Questions', 'Close Strong'],
    commonObjections: ['Overqualified', 'Gaps in resume', 'Salary mismatch'],
    recommendedTone: 'Confident, authentic, prepared'
  },
  {
    id: 'executive-screening',
    name: 'Executive',
    category: 'recruiting',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'High-level leadership evaluation',
    objective: 'Assess executive capabilities and vision',
    keyPhases: ['Track Record', 'Leadership Style', 'Strategic Thinking', 'Culture', 'Expectations'],
    commonObjections: ['Company stability', 'Board dynamics', 'Equity package'],
    recommendedTone: 'Strategic, peer-level, direct'
  },

  // Leadership
  {
    id: 'difficult-conversation',
    name: 'Difficult Talk',
    category: 'leadership',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Navigate sensitive workplace discussions',
    objective: 'Address issues while preserving relationship',
    keyPhases: ['Set Context', 'Share Observation', 'Listen', 'Problem-Solve', 'Commit'],
    commonObjections: ['Defensive response', 'Blame shifting', 'Denial'],
    recommendedTone: 'Direct, compassionate, solution-focused'
  },
  {
    id: 'performance-review',
    name: 'Performance',
    category: 'leadership',
    icon: <Award className="w-5 h-5" />,
    description: 'Conduct effective performance discussions',
    objective: 'Provide feedback and set goals',
    keyPhases: ['Celebrate Wins', 'Review Performance', 'Development Areas', 'Goal Setting', 'Support Plan'],
    commonObjections: ['Unfair rating', 'Lack of resources', 'Unclear expectations'],
    recommendedTone: 'Balanced, supportive, forward-looking'
  },
  {
    id: 'conflict-resolution',
    name: 'Conflict',
    category: 'leadership',
    icon: <Shield className="w-5 h-5" />,
    description: 'Mediate and resolve team conflicts',
    objective: 'Find resolution and restore collaboration',
    keyPhases: ['Set Ground Rules', 'Hear Both Sides', 'Find Common Ground', 'Solution', 'Agreement'],
    commonObjections: ['Unwillingness to compromise', 'Historical grievances', 'Power dynamics'],
    recommendedTone: 'Neutral, fair, patient'
  },
  {
    id: 'team-leadership-call',
    name: 'Team Lead',
    category: 'leadership',
    icon: <Users className="w-5 h-5" />,
    description: 'Lead team meetings and 1:1s',
    objective: 'Align, motivate, and support team',
    keyPhases: ['Check-in', 'Updates', 'Challenges', 'Support Needed', 'Action Items'],
    commonObjections: ['Overwhelmed', 'Resource needs', 'Direction unclear'],
    recommendedTone: 'Supportive, clear, empowering'
  },

  // Coaching
  {
    id: 'coaching-session',
    name: 'Coaching',
    category: 'coaching',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Guide clients to breakthroughs',
    objective: 'Facilitate insight and action',
    keyPhases: ['Check-in', 'Topic', 'Exploration', 'Insight', 'Commitment'],
    commonObjections: ['Stuck in patterns', 'Fear of change', 'Lack of clarity'],
    recommendedTone: 'Curious, empowering, patient'
  },
  {
    id: 'consulting-diagnostic',
    name: 'Consulting',
    category: 'coaching',
    icon: <Search className="w-5 h-5" />,
    description: 'Assess client situation and needs',
    objective: 'Diagnose problems and prescribe solutions',
    keyPhases: ['Current State', 'Desired State', 'Gap Analysis', 'Recommendations', 'Engagement'],
    commonObjections: ['We already tried that', 'Budget limitations', 'Internal resistance'],
    recommendedTone: 'Expert, analytical, prescriptive'
  },
  {
    id: 'financial-advisory',
    name: 'Financial',
    category: 'coaching',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Provide financial guidance',
    objective: 'Help clients make sound financial decisions',
    keyPhases: ['Goals Review', 'Current Situation', 'Options', 'Recommendations', 'Action Plan'],
    commonObjections: ['Risk concerns', 'Market timing', 'Fee sensitivity'],
    recommendedTone: 'Trustworthy, educational, reassuring'
  },

  // Personal
  {
    id: 'dating-first-call',
    name: 'Dating',
    category: 'personal',
    icon: <Heart className="w-5 h-5" />,
    description: 'Navigate romantic first conversations',
    objective: 'Build connection and assess compatibility',
    keyPhases: ['Warm Opening', 'Share Stories', 'Find Common Ground', 'Gauge Interest', 'Plan Next Step'],
    commonObjections: ['Nervousness', 'Awkward silences', 'Mixed signals'],
    recommendedTone: 'Authentic, curious, playful'
  },
  {
    id: 'boundary-conversation',
    name: 'Boundaries',
    category: 'personal',
    icon: <Shield className="w-5 h-5" />,
    description: 'Set boundaries in personal relationships',
    objective: 'Communicate needs clearly and respectfully',
    keyPhases: ['State Intent', 'Express Need', 'Listen', 'Find Middle Ground', 'Confirm'],
    commonObjections: ['Defensiveness', 'Guilt-tripping', 'Dismissal'],
    recommendedTone: 'Calm, firm, compassionate'
  },
  {
    id: 'personal-negotiation',
    name: 'Negotiate',
    category: 'personal',
    icon: <Handshake className="w-5 h-5" />,
    description: 'Negotiate personal matters (salary, purchases)',
    objective: 'Achieve favorable outcome while maintaining relationship',
    keyPhases: ['Research', 'Opening Position', 'Exchange', 'Concessions', 'Agreement'],
    commonObjections: ['Final offer', 'Policy limitations', 'Take it or leave it'],
    recommendedTone: 'Prepared, confident, flexible'
  },
];

const MCConversationTemplates: React.FC<MCConversationTemplatesProps> = ({
  open,
  onClose,
  onSelect,
  selectedTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('sales');
  const [previewTemplate, setPreviewTemplate] = useState<ConversationTemplate | null>(null);

  const filteredTemplates = templates.filter(t => t.category === selectedCategory);
  const currentCategory = templateCategories.find(c => c.id === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden bg-card border-0 shadow-2xl">
        {/* Header */}
        <div className="relative bg-primary p-6 text-primary-foreground">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-primary-foreground/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Choose Your Template</h2>
              <p className="text-primary-foreground/80 text-sm">Select a conversation type for optimized AI guidance</p>
            </div>
          </div>
        </div>

        <div className="flex h-[65vh]">
          {/* Category Tabs - Horizontal */}
          <div className="w-44 bg-muted/30 border-r border-border p-3 flex flex-col gap-1">
            {templateCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className={`${selectedCategory === category.id ? '' : 'opacity-70'}`}>
                  {category.icon}
                </div>
                <span className="font-semibold text-sm">{category.name}</span>
              </button>
            ))}

            {/* Skip button at bottom */}
            <div className="mt-auto pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                Skip For Now
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                {currentCategory?.icon}
              </div>
              <h3 className="font-bold text-lg text-foreground">{currentCategory?.name} Templates</h3>
              <span className="text-xs text-muted-foreground ml-2">({filteredTemplates.length} templates)</span>
            </div>

            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="grid grid-cols-3 gap-3 pr-4">
                {filteredTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  const isHovered = previewTemplate?.id === template.id;
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => onSelect(template)}
                      onMouseEnter={() => setPreviewTemplate(template)}
                      onMouseLeave={() => setPreviewTemplate(null)}
                      className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                          : isHovered
                          ? 'border-emerald-300 bg-card shadow-md'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }`}>
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">{template.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{template.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground font-medium">
                          {template.keyPhases.length} Phases
                        </span>
                        {isHovered && (
                          <ArrowRight className="w-4 h-4 text-primary ml-auto animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Panel */}
          <div className={`w-80 border-l border-border bg-muted/20 transition-all duration-300 ${previewTemplate ? 'opacity-100' : 'opacity-50'}`}>
            {previewTemplate ? (
              <div className="p-5 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                    {previewTemplate.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{previewTemplate.name}</h4>
                    <p className="text-xs text-muted-foreground">{previewTemplate.description}</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Objective</h5>
                    <p className="text-sm text-foreground bg-card p-3 rounded-lg border border-border">{previewTemplate.objective}</p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Call Phases</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {previewTemplate.keyPhases.map((phase, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                          {phase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Tone</h5>
                    <p className="text-sm text-foreground italic">{previewTemplate.recommendedTone}</p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Common Objections</h5>
                    <ul className="space-y-1.5">
                      {previewTemplate.commonObjections.slice(0, 3).map((objection, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2 bg-card p-2 rounded-md border border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          {objection}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button 
                  onClick={() => onSelect(previewTemplate)}
                  className="w-full mt-4"
                >
                  Use This Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-5">
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className="text-sm">Hover Over Template For Preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MCConversationTemplates;
export { templates };
