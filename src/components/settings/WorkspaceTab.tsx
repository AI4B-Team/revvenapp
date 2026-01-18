import { useState, useEffect } from 'react';
import { Bell, MessageSquare, Phone, Save, Mail, Settings, Palette, Trash2, Plus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSpace } from '@/contexts/SpaceContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const bgColorOptions = [
  { value: 'bg-brand-green', label: 'Green', color: '#57C785' },
  { value: 'bg-brand-blue', label: 'Blue', color: '#3B82F6' },
  { value: 'bg-brand-yellow', label: 'Yellow', color: '#EAB308' },
  { value: 'bg-brand-pink', label: 'Pink', color: '#EC4899' },
  { value: 'bg-brand-red', label: 'Red', color: '#EF4444' },
];

export default function WorkspaceTab() {
  const navigate = useNavigate();
  const { selectedSpace, updateSpace, deleteSpace, spaces, addSpace, setSelectedSpace } = useSpace();
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bgColor: 'bg-brand-green',
  });
  const [newSpaceData, setNewSpaceData] = useState({
    name: '',
    description: '',
    bgColor: 'bg-brand-green',
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data from selected space
  useEffect(() => {
    if (selectedSpace && !isCreatingNew) {
      setFormData({
        name: selectedSpace.name,
        description: selectedSpace.description || '',
        bgColor: selectedSpace.bgColor,
      });
    }
  }, [selectedSpace, isCreatingNew]);

  const handleCreateSpace = async () => {
    if (!newSpaceData.name.trim()) {
      toast.error('Please enter a space name');
      return;
    }

    setIsSaving(true);
    
    try {
      const newSpace = addSpace({
        id: crypto.randomUUID(),
        name: newSpaceData.name.trim(),
        initial: newSpaceData.name.trim().charAt(0).toUpperCase(),
        description: newSpaceData.description.trim(),
        bgColor: newSpaceData.bgColor,
        createdAt: new Date().toISOString(),
      });
      
      setSelectedSpace(newSpace);
      setIsCreatingNew(false);
      setNewSpaceData({ name: '', description: '', bgColor: 'bg-brand-green' });
      toast.success('New space created');
    } catch (error) {
      toast.error('Failed to create space');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a space name');
      return;
    }

    setIsSaving(true);
    
    try {
      if (selectedSpace) {
        updateSpace(selectedSpace.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          bgColor: formData.bgColor,
        });
      }
      toast.success('Workspace settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!selectedSpace) return;
    
    if (spaces.length <= 1) {
      toast.error('Cannot delete the only space');
      return;
    }

    if (confirm(`Are you sure you want to delete "${selectedSpace.name}"?`)) {
      deleteSpace(selectedSpace.id);
      toast.success('Space deleted');
      navigate('/dashboard');
    }
  };

  const handleCancelCreate = () => {
    setIsCreatingNew(false);
    setNewSpaceData({ name: '', description: '', bgColor: 'bg-brand-green' });
  };

  // Show create new space form
  if (isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-gray-300 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create New Space</h2>
            <p className="text-sm text-gray-500">
              Set up your new workspace
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleCancelCreate}
            className="gap-2"
          >
            Cancel
          </Button>
        </div>

        {/* Space Settings */}
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Space Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newSpaceName">Name</Label>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${newSpaceData.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <Input
                  id="newSpaceName"
                  value={newSpaceData.name}
                  onChange={(e) => setNewSpaceData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Workspace"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newSpaceDescription">Description (optional)</Label>
              <Textarea
                id="newSpaceDescription"
                value={newSpaceData.description}
                onChange={(e) => setNewSpaceData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What is this space for?"
                className="bg-white border-gray-200 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Appearance</h3>
          </div>
          
          <div className="space-y-2">
            <Label>Space Color</Label>
            <div className="flex gap-3">
              {bgColorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewSpaceData(prev => ({ ...prev, bgColor: option.value }))}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    newSpaceData.bgColor === option.value 
                      ? 'ring-2 ring-offset-2 ring-offset-white ring-brand-green scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: option.color }}
                  title={option.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-300">
          <Button
            onClick={handleCreateSpace}
            disabled={isSaving || !newSpaceData.name.trim()}
            className="bg-brand-green text-primary hover:bg-brand-green/90"
          >
            {isSaving ? (
              <>Creating...</>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Space
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-gray-300 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Workspace</h2>
          <p className="text-sm text-gray-500">
            Configure your workspace preferences.
          </p>
        </div>
        <Button
          onClick={() => setIsCreatingNew(true)}
          className="bg-brand-green hover:bg-brand-green/90 text-primary gap-2"
        >
          <Plus size={16} />
          Add New Space
        </Button>
      </div>

      {/* Space Settings */}
      {selectedSpace && (
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Space Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spaceName">Name</Label>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${formData.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <Input
                  id="spaceName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Workspace"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spaceDescription">Description (optional)</Label>
              <Textarea
                id="spaceDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What is this space for?"
                className="bg-white border-gray-200 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Appearance */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Appearance</h3>
        </div>
        
        <div className="space-y-2">
          <Label>Space Color</Label>
          <div className="flex gap-3">
            {bgColorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData(prev => ({ ...prev, bgColor: option.value }))}
                className={`w-10 h-10 rounded-lg transition-all ${
                  formData.bgColor === option.value 
                    ? 'ring-2 ring-offset-2 ring-offset-white ring-brand-green scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: option.color }}
                title={option.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
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
      <div className="bg-white rounded-lg border border-gray-300 p-6">
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-300">
        {selectedSpace && spaces.length > 1 && (
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Space
          </Button>
        )}
        
        <Button
          onClick={handleSave}
          disabled={isSaving || !formData.name.trim()}
          className="bg-brand-green text-primary hover:bg-brand-green/90 ml-auto"
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
