import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Camera, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import WhiteLabelTab from '@/components/settings/WhiteLabelTab';
import InvitesTab from '@/components/settings/InvitesTab';
import AccountSidebar from '@/components/settings/AccountSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');
  const [username, setUsername] = useState('olivia');
  const [website, setWebsite] = useState('www.untitledui.com');
  const [bio, setBio] = useState("I'm a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and Webflow development.");
  const [jobTitle, setJobTitle] = useState('Product Designer');
  const [showJobTitle, setShowJobTitle] = useState(false);
  const [alternativeEmail, setAlternativeEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] || '';
        setUserFullName(fullName);
        setProfilePhoto(user.user_metadata?.avatar_url || '');
        
        // Check profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          if (profile.full_name) setUserFullName(profile.full_name);
          if (profile.avatar_url) setProfilePhoto(profile.avatar_url);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload an avatar.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      setProfilePhoto(publicUrl + '?t=' + Date.now()); // Add timestamp to force refresh
      
      toast({
        title: "Success",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      setProfilePhoto('');
      
      toast({
        title: "Success",
        description: "Your profile picture has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove profile picture.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const bioCharLimit = 275;
  const remainingChars = bioCharLimit - bio.length;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <div className="flex-1 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-semibold text-gray-900">Account</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  className="pl-10 w-80 bg-white border-gray-200"
                />
              </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex gap-8">
              {/* Account Sidebar */}
              <div className="hidden lg:block flex-shrink-0">
                <AccountSidebar 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab}
                />
              </div>

              {/* Settings Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-w-0">
                {/* Hide tabs on lg screens where sidebar provides navigation */}
                <TabsList className="lg:hidden bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 space-x-4 overflow-x-auto flex-nowrap scrollbar-hide">
                  <TabsTrigger
                    value="my-details"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Password
                  </TabsTrigger>
                  <TabsTrigger
                    value="plan"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Plan
                  </TabsTrigger>
                  <TabsTrigger
                    value="billing"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Subscription
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Email
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="integrations"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger
                    value="api"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    API
                  </TabsTrigger>
                  <TabsTrigger
                    value="white-label"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    White Label
                  </TabsTrigger>
                  <TabsTrigger
                    value="invites"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3 whitespace-nowrap text-sm"
                  >
                    Invites
                  </TabsTrigger>
                </TabsList>

          <TabsContent value="profile" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Profile</h2>
                  <p className="text-sm text-gray-500">
                    Update your photo and personal details here.
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Username
                  </Label>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500">
                        untitledui.com/
                      </div>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex-1 bg-white border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Website
                  </Label>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500">
                        http://
                      </div>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="flex-1 bg-white border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 block mb-1">
                      Your photo
                    </Label>
                    <p className="text-sm text-gray-500">
                      This will be displayed on your profile.
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center gap-4">
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProfilePhoto('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop')}
                        className="text-gray-700 border-gray-200"
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700 border-gray-200"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        Update
                      </Button>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 block mb-1">
                      Your bio
                    </Label>
                    <p className="text-sm text-gray-500">
                      Write a short introduction.
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="border border-gray-200 rounded-lg">
                      {/* Formatting Toolbar */}
                      <div className="flex items-center gap-1 p-2 border-b border-gray-200">
                        <select className="text-sm border-none bg-transparent text-gray-700 focus:outline-none">
                          <option>Normal text</option>
                          <option>Heading 1</option>
                          <option>Heading 2</option>
                        </select>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="font-bold text-gray-700">B</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="italic text-gray-700">I</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="text-gray-700">🔗</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="text-gray-700">≡</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="text-gray-700">☰</span>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Text Area */}
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, bioCharLimit))}
                        className="border-none resize-none focus-visible:ring-0 min-h-[100px]"
                        placeholder="Write a short introduction..."
                      />
                      
                      {/* Character Count */}
                      <div className="px-3 py-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {remainingChars} characters left
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Title */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Job title
                  </Label>
                  <div className="col-span-2 space-y-3">
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="bg-white border-gray-200"
                      placeholder="Product Designer"
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-job-title"
                        checked={showJobTitle}
                        onCheckedChange={(checked) => setShowJobTitle(checked as boolean)}
                      />
                      <label
                        htmlFor="show-job-title"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        Show my job title in my profile
                      </label>
                    </div>
                  </div>
                </div>

                {/* Alternative Contact Email */}
                <div className="grid grid-cols-3 gap-4 items-start pb-6 border-b border-gray-200">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 block mb-1">
                      Alternative contact email
                    </Label>
                    <p className="text-sm text-gray-500">
                      Enter an alternative email if you'd like to
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ✉️
                      </span>
                      <Input
                        type="email"
                        value={alternativeEmail}
                        onChange={(e) => setAlternativeEmail(e.target.value)}
                        placeholder="example@example.com"
                        className="pl-10 bg-white border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" className="text-gray-700 border-gray-200">
                    Cancel
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* My Details Tab */}
          <TabsContent value="my-details" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h2>
                  <p className="text-sm text-gray-500">
                    Update your personal details and contact information.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Profile Picture
                  </Label>
                  <div className="col-span-2">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20 border-2 border-gray-200">
                          <AvatarImage src={profilePhoto} alt="Profile" />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xl">
                            {userFullName ? userFullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 rounded-full p-1.5 border-2 border-white transition-colors"
                          disabled={isUploadingAvatar}
                        >
                          <Camera className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="text-gray-700"
                        >
                          {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                        </Button>
                        {profilePhoto && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Full Name
                  </Label>
                  <div className="col-span-2">
                    <Input
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Email Address
                  </Label>
                  <div className="col-span-2">
                    <Input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Phone Number
                  </Label>
                  <div className="col-span-2">
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Company
                  </Label>
                  <div className="col-span-2">
                    <Input
                      placeholder="Company Name"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Location
                  </Label>
                  <div className="col-span-2 space-y-3">
                    <Input
                      placeholder="City"
                      className="bg-white border-gray-200"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="State"
                        className="bg-white border-gray-200"
                      />
                      <Input
                        placeholder="Country"
                        className="bg-white border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                  <Button variant="outline" className="text-gray-700 border-gray-200">
                    Cancel
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Password</h2>
                  <p className="text-sm text-gray-500">
                    Update your password to keep your account secure.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Current Password */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Current Password
                  </Label>
                  <div className="col-span-2">
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 block mb-1">
                      New Password
                    </Label>
                    <p className="text-sm text-gray-500">
                      Must be at least 8 characters
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="grid grid-cols-3 gap-4 items-start pb-6 border-b border-gray-200">
                  <Label className="text-sm font-medium text-gray-700 pt-2">
                    Confirm Password
                  </Label>
                  <div className="col-span-2">
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" className="text-gray-700 border-gray-200">
                    Cancel
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Update password
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Current Plan</h2>
                  <p className="text-sm text-gray-500">
                    Manage your subscription plan and billing.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Current Plan Card */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">Professional Plan</h3>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Current</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Perfect for growing businesses</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">$49</div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>100,000 monthly credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Unlimited AI generations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Advanced analytics</span>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Usage This Month</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700">Credits Used</span>
                        <span className="font-medium text-gray-900">10,000 / 100,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Cycle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Next billing date</p>
                    <p className="text-sm text-gray-500">January 1, 2025</p>
                  </div>
                  <Button variant="outline" className="text-gray-700 border-gray-200">
                    View billing history
                  </Button>
                </div>

                {/* Upgrade Options */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Available Plans</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                      <div className="text-lg font-semibold text-gray-900 mb-1">Basic</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">$19<span className="text-sm font-normal text-gray-500">/mo</span></div>
                      <p className="text-sm text-gray-500 mb-4">50,000 credits/month</p>
                      <Button variant="outline" className="w-full">Downgrade</Button>
                    </div>
                    <div className="border border-purple-300 rounded-lg p-4 bg-purple-50">
                      <div className="text-lg font-semibold text-gray-900 mb-1">Enterprise</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">$199<span className="text-sm font-normal text-gray-500">/mo</span></div>
                      <p className="text-sm text-gray-500 mb-4">Unlimited credits</p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">Upgrade</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Subscription Tab with Cancel Section */}
          <TabsContent value="billing" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Subscription & Billing</h2>
                  <p className="text-sm text-gray-500">
                    Manage your subscription, payment methods, and billing history.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Subscription Status */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Active Subscription</h3>
                      <p className="text-sm text-gray-500">Professional Plan - Billed monthly</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">$49.00 / month</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Next Payment</p>
                      <p className="text-lg font-semibold text-gray-900">Jan 1, 2025</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Payment Method</h3>
                    <Button variant="outline" size="sm" className="text-gray-700 border-gray-200">
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-900 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-xs text-gray-500">Expires 12/2025</p>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">December 2024</p>
                        <p className="text-xs text-gray-500">Paid on Dec 1, 2024</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">$49.00</span>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">November 2024</p>
                        <p className="text-xs text-gray-500">Paid on Nov 1, 2024</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">$49.00</span>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 text-gray-700 border-gray-200">
                    View all invoices
                  </Button>
                </div>

                {/* Cancel Subscription Section */}
                <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Cancel Subscription</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you cancel your subscription, you'll lose access to all premium features at the end of your current billing period. Your account will be downgraded to the free plan.
                  </p>
                  
                  <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">What you'll lose:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span>100,000 monthly credits (reduced to 10,000)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span>White-label options</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      variant="destructive" 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Cancel Subscription
                    </Button>
                    <p className="text-xs text-gray-600">
                      Access continues until Jan 1, 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Preferences</h2>
                  <p className="text-sm text-gray-500">
                    Manage how you receive emails from us.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Primary Email */}
                <div className="grid grid-cols-3 gap-4 items-start pb-6 border-b border-gray-200">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 block mb-1">
                      Primary Email
                    </Label>
                    <p className="text-sm text-gray-500">
                      This is where you'll receive important notifications
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="email"
                      value="john.doe@example.com"
                      className="bg-white border-gray-200"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      To change your primary email, contact support
                    </p>
                  </div>
                </div>

                {/* Email Notifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Product Updates</p>
                        <p className="text-xs text-gray-500">News about product features and updates</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Weekly Reports</p>
                        <p className="text-xs text-gray-500">Weekly summary of your account activity</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Marketing Emails</p>
                        <p className="text-xs text-gray-500">Tips, tutorials, and promotional content</p>
                      </div>
                      <Checkbox />
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Account Activity</p>
                        <p className="text-xs text-gray-500">Security alerts and account changes</p>
                      </div>
                      <Checkbox defaultChecked disabled />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" className="text-gray-700 border-gray-200">
                    Cancel
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Save preferences
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Settings</h2>
                  <p className="text-sm text-gray-500">
                    Choose how you want to be notified about activity in your account.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Push Notifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Generation Complete</p>
                        <p className="text-xs text-gray-500">Get notified when your content generation is complete</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Credit Alerts</p>
                        <p className="text-xs text-gray-500">Alert when you're running low on credits</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Team Updates</p>
                        <p className="text-xs text-gray-500">Notifications about team activity and mentions</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                </div>

                {/* In-App Notifications */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">In-App Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Comments & Mentions</p>
                        <p className="text-xs text-gray-500">When someone comments or mentions you</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Workspace Invites</p>
                        <p className="text-xs text-gray-500">When you're invited to join a workspace</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">System Updates</p>
                        <p className="text-xs text-gray-500">Important system announcements and updates</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" className="text-gray-700 border-gray-200">
                    Cancel
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Save preferences
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Integrations</h2>
                  <p className="text-sm text-gray-500">
                    Connect your account with third-party services and apps.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Connected Integrations */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Connected</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🔵</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Google Drive</p>
                          <p className="text-xs text-gray-500">Connected to john.doe@gmail.com</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Disconnect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📱</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Slack</p>
                          <p className="text-xs text-gray-500">Connected to workspace: Team</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Available Integrations */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Available Integrations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📧</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Mailchimp</p>
                          <p className="text-xs text-gray-500">Email marketing</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-200">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📊</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Zapier</p>
                          <p className="text-xs text-gray-500">Automation</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-200">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">💳</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Stripe</p>
                          <p className="text-xs text-gray-500">Payments</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-200">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📝</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Notion</p>
                          <p className="text-xs text-gray-500">Notes & docs</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-200">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">API Keys</h2>
                  <p className="text-sm text-gray-500">
                    Manage your API keys to integrate with external applications.
                  </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Create New Key
                </Button>
              </div>

              <div className="space-y-6">
                {/* API Keys List */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Active API Keys</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">Production API Key</p>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">sk_live_••••••••••••••••4242</code>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-purple-600">
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Created on Dec 15, 2024 • Last used 2 hours ago</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Revoke
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">Development API Key</p>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Testing</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">sk_test_••••••••••••••••8888</code>
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-purple-600">
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Created on Nov 1, 2024 • Last used 1 day ago</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>

                {/* API Documentation */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">API Documentation</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-4">
                      Learn how to integrate REVVEN's API into your applications.
                    </p>
                    <div className="space-y-2">
                      <Button variant="link" className="text-purple-600 p-0 h-auto text-sm">
                        → Quick Start Guide
                      </Button>
                      <Button variant="link" className="text-purple-600 p-0 h-auto text-sm block">
                        → API Reference
                      </Button>
                      <Button variant="link" className="text-purple-600 p-0 h-auto text-sm block">
                        → Code Examples
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Rate Limits */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Rate Limits</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Requests per minute</p>
                        <p className="text-2xl font-bold text-gray-900">1,000</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Requests per day</p>
                        <p className="text-2xl font-bold text-gray-900">100,000</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Need higher limits? <Button variant="link" className="text-purple-600 p-0 h-auto text-xs">Contact sales</Button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="white-label" className="mt-8">
            <WhiteLabelTab />
          </TabsContent>

          <TabsContent value="invites" className="mt-8">
            <InvitesTab />
          </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
