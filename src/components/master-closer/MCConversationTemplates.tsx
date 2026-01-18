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
  ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  { id: 'sales', name: 'Sales & Revenue', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'business', name: 'Business & Capital', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'recruiting', name: 'Recruiting & Career', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'leadership', name: 'Leadership & Internal', icon: <Award className="w-4 h-4" /> },
  { id: 'coaching', name: 'Coaching & Advisory', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'personal', name: 'Personal & Connection', icon: <Heart className="w-4 h-4" /> },
];

const templates: ConversationTemplate[] = [
  // Sales & Revenue
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
    name: 'Renewal / Retention',
    category: 'sales',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Retain and upsell existing customers',
    objective: 'Secure renewal and expand relationship',
    keyPhases: ['Review Success', 'Identify New Goals', 'Present Options', 'Handle Concerns', 'Commit'],
    commonObjections: ['Budget cuts', 'Not using it enough', 'Switching to competitor'],
    recommendedTone: 'Appreciative, strategic, value-focused'
  },

  // Business & Capital
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
    name: 'Partner / JV Call',
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
    name: 'Vendor Negotiation',
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
    name: 'Real Estate Deal Call',
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
    name: 'Client Onboarding',
    category: 'business',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'Welcome and activate new clients',
    objective: 'Set up for success and quick wins',
    keyPhases: ['Welcome', 'Expectations', 'Setup', 'First Win', 'Support Plan'],
    commonObjections: ['Overwhelmed', 'Different expectations', 'Resource constraints'],
    recommendedTone: 'Warm, organized, supportive'
  },

  // Recruiting & Career
  {
    id: 'hiring-interview',
    name: 'Hiring Interview',
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
    name: 'Job Candidate Interview',
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
    name: 'Executive Screening',
    category: 'recruiting',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'High-level leadership evaluation',
    objective: 'Assess executive capabilities and vision',
    keyPhases: ['Track Record', 'Leadership Style', 'Strategic Thinking', 'Culture', 'Expectations'],
    commonObjections: ['Company stability', 'Board dynamics', 'Equity package'],
    recommendedTone: 'Strategic, peer-level, direct'
  },

  // Leadership & Internal
  {
    id: 'difficult-conversation',
    name: 'Difficult Conversation',
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
    name: 'Performance Review',
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
    name: 'Conflict Resolution',
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
    name: 'Team Leadership Call',
    category: 'leadership',
    icon: <Users className="w-5 h-5" />,
    description: 'Lead team meetings and 1:1s',
    objective: 'Align, motivate, and support team',
    keyPhases: ['Check-in', 'Updates', 'Challenges', 'Support Needed', 'Action Items'],
    commonObjections: ['Overwhelmed', 'Resource needs', 'Direction unclear'],
    recommendedTone: 'Supportive, clear, empowering'
  },

  // Coaching & Advisory
  {
    id: 'coaching-session',
    name: 'Coaching Session',
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
    name: 'Consulting Diagnostic Call',
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
    name: 'Financial Advisory Call',
    category: 'coaching',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Provide financial guidance',
    objective: 'Help clients make sound financial decisions',
    keyPhases: ['Goals Review', 'Current Situation', 'Options', 'Recommendations', 'Action Plan'],
    commonObjections: ['Risk concerns', 'Market timing', 'Fee sensitivity'],
    recommendedTone: 'Trustworthy, educational, reassuring'
  },

  // Personal & Connection
  {
    id: 'dating-first-call',
    name: 'Dating / First Call',
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
    name: 'Boundary or Clarity Conversation',
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
    name: 'Personal Negotiation',
    category: 'personal',
    icon: <Handshake className="w-5 h-5" />,
    description: 'Negotiate personal matters (salary, purchases, etc.)',
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
  const [hoveredTemplate, setHoveredTemplate] = useState<ConversationTemplate | null>(null);

  const filteredTemplates = templates.filter(t => t.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold">Choose Conversation Template</DialogTitle>
          <DialogDescription>
            Select a template that matches your conversation type for optimized AI guidance
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[60vh]">
          {/* Category Sidebar */}
          <div className="w-56 border-r border-border p-4">
            <div className="space-y-1">
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-4">
            <ScrollArea className="h-full pr-4">
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onSelect(template)}
                    onMouseEnter={() => setHoveredTemplate(template)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    className={`relative p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                        : 'border-border bg-card hover:border-emerald-300'
                    }`}
                  >
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedTemplate?.id === template.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {template.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded-full">{template.keyPhases.length} phases</span>
                      <span className="px-2 py-0.5 bg-muted rounded-full">{template.commonObjections.length} objections</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Panel */}
          {hoveredTemplate && (
            <div className="w-72 border-l border-border p-4 bg-muted/30">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {hoveredTemplate.icon}
                  <h4 className="font-bold text-foreground">{hoveredTemplate.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{hoveredTemplate.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Objective</h5>
                  <p className="text-sm text-foreground">{hoveredTemplate.objective}</p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Key Phases</h5>
                  <div className="flex flex-wrap gap-1">
                    {hoveredTemplate.keyPhases.map((phase, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recommended Tone</h5>
                  <p className="text-sm text-foreground italic">{hoveredTemplate.recommendedTone}</p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Common Objections</h5>
                  <ul className="space-y-1">
                    {hoveredTemplate.commonObjections.map((objection, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <ChevronRight className="w-3 h-3" />
                        {objection}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MCConversationTemplates;
export { templates };
