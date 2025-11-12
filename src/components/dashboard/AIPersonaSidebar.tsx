import { useState } from 'react';
import { 
  GripVertical, Plus, MessageCircle, Mic, Mail, ChevronDown, X
} from 'lucide-react';

interface AIPersonaSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIPersonaSidebar = ({ isOpen, onClose }: AIPersonaSidebarProps) => {
  const [agentName, setAgentName] = useState('Luna');
  const [agentRole, setAgentRole] = useState('');
  const [selectedRoleChip, setSelectedRoleChip] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [toneOfVoice, setToneOfVoice] = useState('Friendly');
  const [conversationStyle, setConversationStyle] = useState('Chat');
  const [responseLength, setResponseLength] = useState(33);
  const [guidelines, setGuidelines] = useState([
    "Your main goal is to engage users in friendly social interactions.",
    "Always be polite, warm, and supportive in conversations.",
    "Recommend communication and active listening strategies.",
    "Incorporate social topics naturally to make chats engaging.",
    "Use simple and clear language to be easily understood.",
    "Adapt your responses to the user's social context and mood."
  ]);

  const roleOptions = [
    'Social Companion',
    'Conversation Facilitator',
    'Friendship Builder',
    'Engagement Specialist'
  ];

  const toneOptions = [
    { value: 'Friendly', emoji: '😊' },
    { value: 'Professional', emoji: '💼' },
    { value: 'Casual', emoji: '😎' },
    { value: 'Enthusiastic', emoji: '🎉' },
    { value: 'Empathetic', emoji: '🤗' }
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'];

  const conversationStyles = [
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={18} /> },
    { id: 'voice', label: 'Voice', icon: <Mic size={18} /> },
    { id: 'email', label: 'Email', icon: <Mail size={18} /> }
  ];

  const handleAddGuideline = () => {
    setGuidelines([...guidelines, 'New guideline...']);
  };

  const handleRemoveGuideline = (index: number) => {
    setGuidelines(guidelines.filter((_, i) => i !== index));
  };

  const getResponseLengthLabel = () => {
    if (responseLength < 25) return 'Minimal';
    if (responseLength < 50) return 'Short';
    if (responseLength < 75) return 'Long';
    return 'Open';
  };

  return (
    <div className="w-96 bg-background border-l border-border flex flex-col h-full overflow-y-auto flex-shrink-0">
      
      {/* Header */}
      <div className="p-6 border-b border-border relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition"
        >
          <X size={18} className="text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AI PERSONA</h2>
            <p className="text-xs text-muted-foreground">Write and customise how the AI feels and acts</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 space-y-6">
        
        {/* Agent Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Agent Name
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Give a name to your Agent that will be displayed in the conversation
          </p>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-background text-foreground"
            placeholder="Enter agent name"
          />
        </div>

        {/* Agent Role */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Agent Role
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Define what your Agent's job title
          </p>
          <input
            type="text"
            value={agentRole}
            onChange={(e) => setAgentRole(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-background text-foreground mb-3"
            placeholder="e.g., Social Companion"
          />
          
          {/* Role Chips */}
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRoleChip(role);
                  setAgentRole(role);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  selectedRoleChip === role
                    ? 'bg-brand-blue/10 text-brand-blue border-2 border-brand-blue'
                    : 'bg-muted text-foreground hover:bg-muted/80 border-2 border-transparent'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Default Language */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Default Language
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Select the language in which your Agents greet users
          </p>
          <select
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none bg-background text-foreground"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Tone of Voice */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Tone of Voice
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Select how you want your Agent to communicate
          </p>
          <div className="relative">
            <select
              value={toneOfVoice}
              onChange={(e) => setToneOfVoice(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none bg-background text-foreground"
            >
              {toneOptions.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.emoji} {tone.value}
                </option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Conversation Style */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Conversation Style
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Choose how your Agent will talk during the conversation
          </p>
          <div className="grid grid-cols-3 gap-2">
            {conversationStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setConversationStyle(style.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  conversationStyle === style.id
                    ? 'bg-brand-blue text-primary shadow-lg'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {style.icon}
                <span className="text-sm">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Response Length */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Chat Response Length
          </label>
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="100"
              value={responseLength}
              onChange={(e) => setResponseLength(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--brand-blue)) 0%, hsl(var(--brand-green)) ${responseLength}%, hsl(var(--muted)) ${responseLength}%, hsl(var(--muted)) 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimal</span>
            <span className="font-semibold text-brand-blue">{getResponseLengthLabel()}</span>
            <span>Open</span>
          </div>
        </div>

        {/* Chat Guidelines */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Chat Guidelines
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Set clear rules for how your agent should respond in chat channels
          </p>
          
          {/* Guidelines List */}
          <div className="space-y-2 mb-3">
            {guidelines.map((guideline, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-border group hover:bg-muted/80 transition-colors"
              >
                <GripVertical size={18} className="text-muted-foreground cursor-move shrink-0 mt-0.5" />
                <p className="flex-1 text-sm text-foreground">{guideline}</p>
                <button
                  onClick={() => handleRemoveGuideline(index)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add Rule Button */}
          <button
            onClick={handleAddGuideline}
            className="w-full py-3 bg-brand-blue hover:opacity-90 text-primary font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span>Add rule</span>
          </button>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(var(--background));
          cursor: pointer;
          border: 3px solid hsl(var(--brand-blue));
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(var(--background));
          cursor: pointer;
          border: 3px solid hsl(var(--brand-blue));
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default AIPersonaSidebar;
