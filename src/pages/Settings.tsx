import { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function Settings() {
  const [username, setUsername] = useState('olivia');
  const [website, setWebsite] = useState('www.untitledui.com');
  const [bio, setBio] = useState("I'm a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and Webflow development.");
  const [jobTitle, setJobTitle] = useState('Product Designer');
  const [showJobTitle, setShowJobTitle] = useState(false);
  const [alternativeEmail, setAlternativeEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop');

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
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 overflow-auto">
          <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              className="pl-10 w-80 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger
              value="my-details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              My details
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Password
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Team
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-100">
                48
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Plan
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Email
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent bg-transparent px-1 pb-3"
            >
              API
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

          {/* Placeholder for other tabs */}
          <TabsContent value="my-details" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Details</h2>
              <p className="text-gray-500">Content for My Details tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Password</h2>
              <p className="text-gray-500">Content for Password tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team</h2>
              <p className="text-gray-500">Content for Team tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan</h2>
              <p className="text-gray-500">Content for Plan tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing</h2>
              <p className="text-gray-500">Content for Billing tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email</h2>
              <p className="text-gray-500">Content for Email tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <p className="text-gray-500">Content for Notifications tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h2>
              <p className="text-gray-500">Content for Integrations tab...</p>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">API</h2>
              <p className="text-gray-500">Content for API tab...</p>
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
