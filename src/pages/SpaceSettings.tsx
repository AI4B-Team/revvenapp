import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Users, Settings, Palette, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSpace } from '@/contexts/SpaceContext';
import { toast } from 'sonner';
import Sidebar from '@/components/dashboard/Sidebar';

const bgColorOptions = [
  { value: 'bg-brand-green', label: 'Green', color: '#57C785' },
  { value: 'bg-brand-blue', label: 'Blue', color: '#3B82F6' },
  { value: 'bg-brand-yellow', label: 'Yellow', color: '#EAB308' },
  { value: 'bg-brand-pink', label: 'Pink', color: '#EC4899' },
  { value: 'bg-brand-red', label: 'Red', color: '#EF4444' },
];

const SpaceSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewSpace = searchParams.get('new') === 'true';
  
  const { 
    selectedSpace, 
    addSpace, 
    updateSpace, 
    deleteSpace,
    isCreatingNewSpace,
    setIsCreatingNewSpace,
    setDraftSpace,
    spaces
  } = useSpace();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bgColor: 'bg-brand-green',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isNewSpace || isCreatingNewSpace) {
      setFormData({
        name: '',
        description: '',
        bgColor: 'bg-brand-green',
      });
      setIsCreatingNewSpace(true);
    } else if (selectedSpace) {
      setFormData({
        name: selectedSpace.name,
        description: selectedSpace.description || '',
        bgColor: selectedSpace.bgColor,
      });
    }
  }, [isNewSpace, isCreatingNewSpace, selectedSpace, setIsCreatingNewSpace]);

  // Update draft space when name changes (for sidebar display)
  useEffect(() => {
    if (isCreatingNewSpace && formData.name) {
      setDraftSpace({
        name: formData.name,
        initial: formData.name.charAt(0).toUpperCase(),
        bgColor: formData.bgColor,
      });
    }
  }, [formData.name, formData.bgColor, isCreatingNewSpace, setDraftSpace]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a space name');
      return;
    }

    setIsSaving(true);
    
    try {
      if (isNewSpace || isCreatingNewSpace) {
        // Create new space
        const newSpace = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          initial: formData.name.charAt(0).toUpperCase(),
          bgColor: formData.bgColor,
          description: formData.description.trim(),
          createdAt: new Date().toISOString(),
        };
        addSpace(newSpace);
        toast.success('Space created successfully!');
        setIsCreatingNewSpace(false);
        setDraftSpace(null);
        navigate('/space-settings');
      } else if (selectedSpace) {
        // Update existing space
        updateSpace(selectedSpace.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          bgColor: formData.bgColor,
        });
        toast.success('Space updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to save space');
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

  const handleCancel = () => {
    if (isNewSpace || isCreatingNewSpace) {
      setIsCreatingNewSpace(false);
      setDraftSpace(null);
    }
    navigate('/dashboard');
  };

  const isCreating = isNewSpace || isCreatingNewSpace;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="pb-6 border-b border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {isCreating ? 'Create New Space' : 'Workspace'}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {isCreating 
                      ? 'Set up your new workspace'
                      : 'Configure your workspace preferences and agent settings.'}
                  </p>
                </div>
              </div>
              {!isCreating && (
                <Button
                  onClick={() => {
                    setIsCreatingNewSpace(true);
                    navigate('/space-settings?new=true');
                  }}
                  className="bg-brand-green hover:bg-brand-green/90 text-primary gap-2"
                >
                  <Plus size={16} />
                  Add New Space
                </Button>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Space Settings Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Space Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${formData.bgColor} rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0`}>
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Workspace"
                      className="bg-white border-gray-200 flex-1"
                    />
                    {!isCreating && (
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0">
                        <MoreHorizontal size={20} />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What is this space for?"
                    className="bg-white border-gray-200 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Appearance Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                      className={`w-12 h-12 rounded-xl transition-all ${
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

            {/* Team Card (placeholder) */}
            {isCreating && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Team</h3>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-muted-foreground">
                    Team management coming soon. Invite collaborators to work together in this space.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              {!isCreating && selectedSpace && spaces.length > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Space
                </Button>
              )}
              
              <div className="flex gap-3 ml-auto">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name.trim()}
                  className="bg-brand-green text-primary hover:bg-brand-green/90"
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Saving...' : isCreating ? 'Create Space' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpaceSettings;
