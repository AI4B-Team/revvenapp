import React, { useState } from 'react';
import { 
  Upload, 
  Mic, 
  Bot, 
  Headphones, 
  Play, 
  Settings,
  Volume2,
  Radio,
  Eye,
  Bell,
  Shield,
  Sliders
} from 'lucide-react';

type SettingsTab = 'general' | 'start-call' | 'voice-agent' | 'listen';

const MCSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'general', label: 'General', icon: Settings, color: 'text-gray-600' },
    { id: 'start-call', label: 'Start Call', icon: Play, color: 'text-emerald-600' },
    { id: 'voice-agent', label: 'Voice Agent', icon: Bot, color: 'text-purple-600' },
    { id: 'listen', label: 'Listen Mode', icon: Headphones, color: 'text-blue-600' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Settings</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <>
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Upload className="w-5 h-5 text-emerald-600" />
                Custom Scripts & Frameworks
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your sales scripts, playbooks, and methodologies to train AI on your approach
              </p>
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors">
                Upload Files
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Bell className="w-5 h-5 text-emerald-600" />
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Call summaries</p>
                    <p className="text-xs text-muted-foreground">Get email after each call</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly reports</p>
                    <p className="text-xs text-muted-foreground">Performance digest every Monday</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-emerald-600" />
                Privacy & Data
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage how your call data is stored and used
              </p>
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors">
                Manage Data
              </button>
            </div>
          </>
        )}

        {/* Start Call Settings */}
        {activeTab === 'start-call' && (
          <>
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Mic className="w-5 h-5 text-emerald-600" />
                Microphone Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Input Device</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                    <option>Default Microphone</option>
                    <option>MacBook Pro Microphone</option>
                    <option>External USB Microphone</option>
                  </select>
                </div>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Noise cancellation</p>
                    <p className="text-xs text-muted-foreground">Reduce background noise</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Echo cancellation</p>
                    <p className="text-xs text-muted-foreground">Prevent audio feedback</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Sliders className="w-5 h-5 text-emerald-600" />
                AI Suggestions
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Real-time suggestions</p>
                    <p className="text-xs text-muted-foreground">Show AI tips during calls</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Objection alerts</p>
                    <p className="text-xs text-muted-foreground">Highlight detected objections</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Quick handoff button</p>
                    <p className="text-xs text-muted-foreground">Show "Hand to Agent" option</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" defaultChecked />
                </label>
              </div>
            </div>
          </>
        )}

        {/* Voice Agent Settings */}
        {activeTab === 'voice-agent' && (
          <>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
              <p className="text-sm text-purple-700">
                <strong>Tip:</strong> For detailed agent personality and behavior settings, visit the{' '}
                <span className="font-semibold">Agent Settings</span> page in the sidebar.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Volume2 className="w-5 h-5 text-purple-600" />
                Audio Output
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Output Device</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                    <option>Default Speakers</option>
                    <option>MacBook Pro Speakers</option>
                    <option>External Headphones</option>
                  </select>
                </div>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Play agent audio locally</p>
                    <p className="text-xs text-muted-foreground">Hear what agent is saying</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-purple-500" defaultChecked />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Eye className="w-5 h-5 text-purple-600" />
                Monitoring
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Live transcript</p>
                    <p className="text-xs text-muted-foreground">Show real-time conversation</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-purple-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Takeover alerts</p>
                    <p className="text-xs text-muted-foreground">Notify when agent needs help</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-purple-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sentiment warnings</p>
                    <p className="text-xs text-muted-foreground">Alert on negative sentiment</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-purple-500" defaultChecked />
                </label>
              </div>
            </div>
          </>
        )}

        {/* Listen Mode Settings */}
        {activeTab === 'listen' && (
          <>
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Radio className="w-5 h-5 text-blue-600" />
                Audio Source
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Capture From</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                    <option>Browser Tab Audio</option>
                    <option>System Audio (All)</option>
                    <option>Specific Application</option>
                  </select>
                </div>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-detect calls</p>
                    <p className="text-xs text-muted-foreground">Start capturing when call detected</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-blue-500" />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Eye className="w-5 h-5 text-blue-600" />
                Coach Mode
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Silent prompts and suggestions during external calls
              </p>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Coach Mode</p>
                    <p className="text-xs text-muted-foreground">Show silent suggestions overlay</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-blue-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Whisper notifications</p>
                    <p className="text-xs text-muted-foreground">Subtle audio cues for tips</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-blue-500" />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Highlight key moments</p>
                    <p className="text-xs text-muted-foreground">Mark objections and buying signals</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-blue-500" defaultChecked />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Sliders className="w-5 h-5 text-blue-600" />
                Analysis Settings
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Speaker diarization</p>
                    <p className="text-xs text-muted-foreground">Identify different speakers</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-blue-500" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sentiment tracking</p>
                    <p className="text-xs text-muted-foreground">Monitor prospect engagement</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-blue-500" defaultChecked />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MCSettings;
