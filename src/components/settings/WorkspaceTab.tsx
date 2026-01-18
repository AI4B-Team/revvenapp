import { useState } from 'react';
import { Bot, Bell, MessageSquare, Phone, Save, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSpace } from '@/contexts/SpaceContext';
import { toast } from 'sonner';

export default function WorkspaceTab() {
  const { selectedSpace, updateSpace } = useSpace();
  
  const [agentName, setAgentName] = useState('AIVA');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Workspace settings saved');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Workspace</h2>
        <p className="text-sm text-gray-500">
          Configure your workspace preferences and agent settings.
        </p>
      </div>

      {/* Current Workspace */}
      {selectedSpace && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 ${selectedSpace.bgColor} rounded-xl flex items-center justify-center text-xl font-bold text-white`}>
              {selectedSpace.initial}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{selectedSpace.name}</h3>
              <p className="text-sm text-gray-500">Current workspace</p>
            </div>
          </div>
        </div>
      )}

      {/* Your Agent Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Your Agent</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{agentName}</p>
                <p className="text-sm text-gray-500">AI Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name"
              className="bg-white border-gray-200"
            />
            <p className="text-xs text-gray-500">This is how your AI assistant will identify itself.</p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Get notified when tasks complete</p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>
      </div>

      {/* SMS Settings Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">SMS Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="bg-white border-gray-200"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Enable SMS with agent</p>
                <p className="text-sm text-gray-500">Text your agent for quick tasks</p>
              </div>
            </div>
            <Switch
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
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
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
