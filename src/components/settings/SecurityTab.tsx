import { useState } from 'react';
import { Eye, EyeOff, Shield, Users, Briefcase, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SecurityTab() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // 2FA states
  const [setup2FAEnabled, setSetup2FAEnabled] = useState(false);
  const [enforce2FAEnabled, setEnforce2FAEnabled] = useState(false);
  const [enforce2FATeamMembers, setEnforce2FATeamMembers] = useState(false);
  const [enforce2FAClients, setEnforce2FAClients] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been updated.",
      });
      
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSetup2FAToggle = (checked: boolean) => {
    setSetup2FAEnabled(checked);
    if (checked) {
      toast({
        title: "2FA Setup",
        description: "Two-factor authentication setup will be available soon.",
      });
    }
  };

  const handleEnforce2FAToggle = (checked: boolean) => {
    setEnforce2FAEnabled(checked);
    if (!checked) {
      setEnforce2FATeamMembers(false);
      setEnforce2FAClients(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">Password</h3>
            <div className="h-0.5 w-16 bg-blue-500 rounded-full" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-12 bg-gray-50 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded bg-red-500 hover:bg-red-600 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4 text-white" />
                  ) : (
                    <Eye className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-12 bg-gray-50 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded bg-red-500 hover:bg-red-600 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-white" />
                  ) : (
                    <Eye className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !newPassword.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </div>

      {/* Setup 2FA Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">Setup two factor authentication (2FA)</h3>
            <div className="h-0.5 w-16 bg-blue-500 rounded-full" />
          </div>
          <Switch
            checked={setup2FAEnabled}
            onCheckedChange={handleSetup2FAToggle}
          />
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Setup 2FA for My Account</h4>
              <p className="text-sm text-gray-500 mt-1">
                Protect your account with the additional layer of security by activating two-factor authentication{' '}
                <button className="text-blue-500 hover:text-blue-600 font-medium">
                  Learn More
                </button>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enforce 2FA Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">Enforce two factor authentication (2FA)</h3>
            <div className="h-0.5 w-16 bg-blue-500 rounded-full" />
          </div>
          <Switch
            checked={enforce2FAEnabled}
            onCheckedChange={handleEnforce2FAToggle}
          />
        </div>
        
        <div className="px-6 pb-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Enforce 2FA for</h4>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={enforce2FATeamMembers}
                  onCheckedChange={(checked) => setEnforce2FATeamMembers(checked as boolean)}
                  disabled={!enforce2FAEnabled}
                />
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${enforce2FAEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                    Team Members
                  </span>
                </div>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={enforce2FAClients}
                  onCheckedChange={(checked) => setEnforce2FAClients(checked as boolean)}
                  disabled={!enforce2FAEnabled}
                />
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${enforce2FAEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                    Clients
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}