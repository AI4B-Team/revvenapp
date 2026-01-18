import { useState, useEffect } from 'react';
import { Bot, Save, Mic, Volume2, MessageSquare, Sparkles, Globe, Mail, Phone, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const voiceOptions = [
  { value: 'aiva-default', label: 'AIVA Default' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'calm', label: 'Calm & Soothing' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

const personalityOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
];

export default function AgentTab() {
  const [isSaving, setIsSaving] = useState(false);
  
  // Agent Identity
  const [agentName, setAgentName] = useState('AIVA');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentAvatar, setAgentAvatar] = useState('');
  const [agentRole, setAgentRole] = useState('AI Assistant');
  
  // Personality & Behavior
  const [personality, setPersonality] = useState('professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('Hello! How can I help you today?');
  
  // Voice Settings
  const [selectedVoice, setSelectedVoice] = useState('aiva-default');
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [voicePitch, setVoicePitch] = useState([1.0]);
  const [enableVoice, setEnableVoice] = useState(true);
  
  // Language & Localization
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  
  // Capabilities
  const [enableLearning, setEnableLearning] = useState(true);
  const [enableMemory, setEnableMemory] = useState(true);
  const [enableProactiveMessages, setEnableProactiveMessages] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save agent settings to local storage or backend
      const agentSettings = {
        identity: {
          name: agentName,
          email: agentEmail,
          phone: agentPhone,
          avatar: agentAvatar,
          role: agentRole,
        },
        personality: {
          type: personality,
          customPrompt,
          greetingMessage,
        },
        voice: {
          enabled: enableVoice,
          voiceId: selectedVoice,
          speed: voiceSpeed[0],
          pitch: voicePitch[0],
        },
        language: {
          primary: primaryLanguage,
          autoDetect: autoDetectLanguage,
        },
        capabilities: {
          learning: enableLearning,
          memory: enableMemory,
          proactiveMessages: enableProactiveMessages,
        },
      };
      
      localStorage.setItem('agentSettings', JSON.stringify(agentSettings));
      
      toast.success('Agent settings saved successfully');
    } catch (error) {
      toast.error('Failed to save agent settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('agentSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        
        // Identity
        if (settings.identity) {
          setAgentName(settings.identity.name || 'AIVA');
          setAgentEmail(settings.identity.email || '');
          setAgentPhone(settings.identity.phone || '');
          setAgentAvatar(settings.identity.avatar || '');
          setAgentRole(settings.identity.role || 'AI Assistant');
        }
        
        // Personality
        if (settings.personality) {
          setPersonality(settings.personality.type || 'professional');
          setCustomPrompt(settings.personality.customPrompt || '');
          setGreetingMessage(settings.personality.greetingMessage || 'Hello! How can I help you today?');
        }
        
        // Voice
        if (settings.voice) {
          setEnableVoice(settings.voice.enabled ?? true);
          setSelectedVoice(settings.voice.voiceId || 'aiva-default');
          setVoiceSpeed([settings.voice.speed || 1.0]);
          setVoicePitch([settings.voice.pitch || 1.0]);
        }
        
        // Language
        if (settings.language) {
          setPrimaryLanguage(settings.language.primary || 'en');
          setAutoDetectLanguage(settings.language.autoDetect ?? true);
        }
        
        // Capabilities
        if (settings.capabilities) {
          setEnableLearning(settings.capabilities.learning ?? true);
          setEnableMemory(settings.capabilities.memory ?? true);
          setEnableProactiveMessages(settings.capabilities.proactiveMessages ?? false);
        }
      } catch (error) {
        console.error('Failed to parse saved agent settings:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">AI Agent</h2>
        <p className="text-sm text-gray-500">
          Customize your AI agent's identity, personality, and capabilities.
        </p>
      </div>

      {/* Agent Identity Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Agent Identity</h3>
        </div>
        
        <div className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-16 h-16 border-2 border-brand-green">
              <AvatarImage src={agentAvatar} alt={agentName} />
              <AvatarFallback className="bg-brand-green/20 text-brand-green text-xl">
                {agentName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{agentName}</p>
              <p className="text-sm text-gray-500">{agentRole}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Avatar
            </Button>
          </div>
          
          {/* Agent Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="bg-white border-gray-200"
              />
              <p className="text-xs text-gray-500">This is how your AI will identify itself.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentRole">Role / Title</Label>
              <Input
                id="agentRole"
                value={agentRole}
                onChange={(e) => setAgentRole(e.target.value)}
                placeholder="e.g., AI Assistant, Sales Agent"
                className="bg-white border-gray-200"
              />
            </div>
          </div>
          
          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Agent Email
              </Label>
              <Input
                id="agentEmail"
                type="email"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                placeholder="agent@yourcompany.com"
                className="bg-white border-gray-200"
              />
              <p className="text-xs text-gray-500">Email for agent communications and notifications.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentPhone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Agent Phone
              </Label>
              <Input
                id="agentPhone"
                type="tel"
                value={agentPhone}
                onChange={(e) => setAgentPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-white border-gray-200"
              />
              <p className="text-xs text-gray-500">Phone number for voice calls and SMS.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personality & Behavior Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Personality & Behavior</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personality">Personality Type</Label>
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {personalityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="greetingMessage">Greeting Message</Label>
            <Input
              id="greetingMessage"
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              placeholder="Hello! How can I help you today?"
              className="bg-white border-gray-200"
            />
            <p className="text-xs text-gray-500">The first message your agent sends when starting a conversation.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific instructions for how your agent should behave, respond, or handle certain situations..."
              className="bg-white border-gray-200 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500">Provide additional context or rules for your agent to follow.</p>
          </div>
        </div>
      </div>

      {/* Voice Settings Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mic className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Voice Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Enable Voice</p>
                <p className="text-sm text-gray-500">Allow agent to speak using text-to-speech</p>
              </div>
            </div>
            <Switch
              checked={enableVoice}
              onCheckedChange={setEnableVoice}
            />
          </div>
          
          {enableVoice && (
            <>
              <div className="space-y-2">
                <Label htmlFor="voiceSelect">Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {voiceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Speed</Label>
                    <span className="text-sm text-gray-500">{voiceSpeed[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={voiceSpeed}
                    onValueChange={setVoiceSpeed}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Pitch</Label>
                    <span className="text-sm text-gray-500">{voicePitch[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={voicePitch}
                    onValueChange={setVoicePitch}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Language & Localization Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Language & Localization</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Primary Language</Label>
            <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Auto-detect Language</p>
                <p className="text-sm text-gray-500">Automatically respond in the user's language</p>
              </div>
            </div>
            <Switch
              checked={autoDetectLanguage}
              onCheckedChange={setAutoDetectLanguage}
            />
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Capabilities</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Continuous Learning</p>
              <p className="text-sm text-gray-500">Agent learns from conversations to improve responses</p>
            </div>
            <Switch
              checked={enableLearning}
              onCheckedChange={setEnableLearning}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Conversation Memory</p>
              <p className="text-sm text-gray-500">Remember context from previous conversations</p>
            </div>
            <Switch
              checked={enableMemory}
              onCheckedChange={setEnableMemory}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Proactive Messages</p>
              <p className="text-sm text-gray-500">Agent can initiate conversations based on triggers</p>
            </div>
            <Switch
              checked={enableProactiveMessages}
              onCheckedChange={setEnableProactiveMessages}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-300">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-green text-primary hover:bg-brand-green/90"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Agent Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
