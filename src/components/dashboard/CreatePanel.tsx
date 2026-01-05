import { useState } from 'react';
import { 
  Image, Video, Music, Palette, FileText, Code, MoreHorizontal, 
  Shuffle, Sparkles, ChevronDown, Pencil, Mic, Users, 
  FolderOpen, LayoutGrid, Search, Calendar, LayoutList, Filter, Zap, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ContentType = 'image' | 'video' | 'audio' | 'design' | 'content' | 'apps';
type SecondaryTab = 'apps' | 'creations' | 'templates' | 'community' | 'collections';

const contentTypes = [
  { id: 'image', label: 'Image', icon: Image, color: 'text-blue-500' },
  { id: 'video', label: 'Video', icon: Video, color: 'text-red-500' },
  { id: 'audio', label: 'Audio', icon: Music, color: 'text-purple-500' },
  { id: 'design', label: 'Design', icon: Palette, color: 'text-yellow-500' },
  { id: 'content', label: 'Content', icon: FileText, color: 'text-cyan-500' },
  { id: 'apps', label: 'Apps', icon: Code, color: 'text-green-500' },
];

const secondaryTabs = [
  { id: 'apps', label: 'Apps', icon: FolderOpen },
  { id: 'creations', label: 'Creations', icon: Sparkles },
  { id: 'templates', label: 'Templates', icon: LayoutGrid },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'collections', label: 'Collections', icon: FolderOpen },
];

const imageApps = [
  { id: 'art-blocks', name: 'Art Blocks', emoji: '🎨', bgColor: 'bg-blue-100' },
  { id: 'edit', name: 'Edit', emoji: '✏️', bgColor: 'bg-yellow-100' },
  { id: 'background-remover', name: 'Background Remover', emoji: '✂️', bgColor: 'bg-orange-100' },
  { id: 'image-eraser', name: 'Image Eraser', emoji: '🖼️', bgColor: 'bg-green-100' },
  { id: 'image-upscaler', name: 'Image Upscaler', emoji: '📷', bgColor: 'bg-purple-100' },
  { id: 'image-enhancer', name: 'Image Enhancer', emoji: '❤️', bgColor: 'bg-yellow-50' },
];

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'threads', name: 'Threads', color: '#000000' },
  { id: 'x', name: 'X', color: '#000000' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'reddit', name: 'Reddit', color: '#FF4500' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023' },
  { id: 'snapchat', name: 'Snapchat', color: '#FFFC00' },
  { id: 'tumblr', name: 'Tumblr', color: '#36465D' },
  { id: 'bluesky', name: 'Bluesky', color: '#0085FF' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
];

const CreatePanel = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('image');
  const [selectedSecondaryTab, setSelectedSecondaryTab] = useState<SecondaryTab>('apps');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');

  const getPromptIcon = () => {
    switch (selectedType) {
      case 'image': return <Pencil className="w-5 h-5 text-muted-foreground" />;
      case 'video': return <Video className="w-5 h-5 text-muted-foreground" />;
      case 'audio': return <Mic className="w-5 h-5 text-muted-foreground" />;
      case 'content': return <FileText className="w-5 h-5 text-muted-foreground" />;
      default: return <Pencil className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const selectAllPlatforms = () => {
    if (selectedPlatforms.length === socialPlatforms.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(socialPlatforms.map(p => p.id));
    }
  };

  const renderPromptOptions = () => {
    if (selectedType === 'content') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full h-8">
                <span className="text-muted-foreground text-xs">
                  Type: Social <ChevronDown className="w-3 h-3 ml-1 inline" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Social</DropdownMenuItem>
              <DropdownMenuItem>Blog</DropdownMenuItem>
              <DropdownMenuItem>Email</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full h-8">
                <span className="text-muted-foreground text-xs">
                  Goal: Engagement <ChevronDown className="w-3 h-3 ml-1 inline" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Engagement</DropdownMenuItem>
              <DropdownMenuItem>Awareness</DropdownMenuItem>
              <DropdownMenuItem>Conversion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full h-8">
                <span className="text-muted-foreground text-xs">
                  Language: English <ChevronDown className="w-3 h-3 ml-1 inline" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Spanish</DropdownMenuItem>
              <DropdownMenuItem>French</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-8 bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100">
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Create <ChevronDown className="w-3 h-3 ml-1" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Create</DropdownMenuItem>
            <DropdownMenuItem>Batch</DropdownMenuItem>
            <DropdownMenuItem>Draw</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="rounded-full h-8">
          Style
        </Button>

        <Button variant="outline" size="sm" className="rounded-full h-8">
          <Users className="w-4 h-4 mr-1.5" />
          Character
        </Button>

        <Button variant="outline" size="sm" className="rounded-full h-8">
          <Image className="w-4 h-4 mr-1.5" />
          Reference
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-8">
              <span className="text-muted-foreground text-xs">
                1:1 <ChevronDown className="w-3 h-3 ml-1 inline" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>1:1</DropdownMenuItem>
            <DropdownMenuItem>16:9</DropdownMenuItem>
            <DropdownMenuItem>9:16</DropdownMenuItem>
            <DropdownMenuItem>4:3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-8">
              <span className="text-muted-foreground text-xs">
                1 Image <ChevronDown className="w-3 h-3 ml-1 inline" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>1 Image</DropdownMenuItem>
            <DropdownMenuItem>2 Images</DropdownMenuItem>
            <DropdownMenuItem>4 Images</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-foreground">What Would You Like To Create Today?</h1>

        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {contentTypes.map(type => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                variant="outline"
                onClick={() => setSelectedType(type.id as ContentType)}
                className={`rounded-full px-5 h-10 border-border ${
                  selectedType === type.id 
                    ? 'bg-foreground text-background hover:bg-foreground/90' 
                    : 'bg-card hover:bg-muted'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${selectedType === type.id ? '' : type.color}`} />
                {type.label}
              </Button>
            );
          })}
          <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              {getPromptIcon()}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[60px] text-base"
                rows={2}
              />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-primary p-1 h-8 w-8">
                  <Shuffle className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200 rounded-full px-4 h-8">
                      <Zap className="w-4 h-4 mr-1.5 text-yellow-500" />
                      Auto <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Auto</DropdownMenuItem>
                    <DropdownMenuItem>Manual</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-nowrap">
              {renderPromptOptions()}
              
              <div className="flex items-center ml-auto gap-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground h-9">
                      <Sparkles className="w-4 h-4 mr-1" /> AI <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>GPT-4</DropdownMenuItem>
                    <DropdownMenuItem>Claude</DropdownMenuItem>
                    <DropdownMenuItem>Gemini</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-10 font-medium">
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {selectedType === 'content' && (
          <div className="max-w-4xl mx-auto mb-8 bg-card rounded-xl p-6 border">
            <h3 className="text-center font-medium mb-6">Choose Your Platforms To Generate 30 Days Of Content For Each One</h3>
            
            <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAllPlatforms}
                className="rounded-full"
              >
                Select All
              </Button>
              {socialPlatforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    selectedPlatforms.includes(platform.id) 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: platform.color === '#000000' ? '#1a1a1a' : platform.color + '20' }}
                >
                  {platform.id === 'facebook' && '📘'}
                  {platform.id === 'instagram' && '📸'}
                  {platform.id === 'threads' && '🧵'}
                  {platform.id === 'x' && '✖️'}
                  {platform.id === 'tiktok' && '🎵'}
                  {platform.id === 'reddit' && '🤖'}
                  {platform.id === 'youtube' && '▶️'}
                  {platform.id === 'pinterest' && '📌'}
                  {platform.id === 'snapchat' && '👻'}
                  {platform.id === 'tumblr' && '📝'}
                  {platform.id === 'bluesky' && '🦋'}
                  {platform.id === 'linkedin' && '💼'}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                <Calendar className="w-4 h-4 mr-2" /> Calendar
              </Button>
              <Button variant="outline" className="rounded-full px-6">
                <LayoutList className="w-4 h-4 mr-2" /> Plan
              </Button>
            </div>
          </div>
        )}

        {selectedType === 'content' && (
          <div className="max-w-6xl mx-auto mb-8 bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex rounded-full border overflow-hidden">
                  <Button variant="ghost" size="sm" className="rounded-none px-4">Schedule</Button>
                  <Button variant="ghost" size="sm" className="rounded-none px-4">Plan</Button>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4">
                  <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium">Dec 14 - Jan 25</span>
                <Button variant="outline" size="sm" className="rounded-full bg-primary text-primary-foreground">
                  {'<'}
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">Month</Button>
                <Button variant="outline" size="sm" className="rounded-full bg-primary text-primary-foreground">
                  {'>'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex rounded-full border overflow-hidden bg-primary/10">
                <Button variant="ghost" size="sm" className="rounded-none px-4 text-primary">Weekly</Button>
                <Button variant="ghost" size="sm" className="rounded-none px-4 text-primary">Monthly</Button>
                <Button variant="ghost" size="sm" className="rounded-none px-4 bg-primary text-primary-foreground">Calendar</Button>
                <Button variant="ghost" size="sm" className="rounded-none px-4 text-primary">Kanban</Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{'<'} December 2025 {'>'}</span>
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4 mr-1" /> Search
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-1" /> Filter
                </Button>
              </div>
            </div>

            <div className="text-center text-primary font-medium mb-2">December 2025</div>
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-muted-foreground text-sm py-2">{day}</div>
              ))}
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div key={day} className="aspect-square border rounded-lg p-2 text-sm">
                  {day}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedType !== 'content' && (
          <>
            <div className="flex items-center gap-2 mb-8">
              {secondaryTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSecondaryTab(tab.id as SecondaryTab)}
                    className={`rounded-full px-4 h-9 ${
                      selectedSecondaryTab === tab.id 
                        ? 'bg-foreground text-background hover:bg-foreground/90 border-foreground' 
                        : 'bg-card border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold uppercase tracking-wide">IMAGE APPS</h2>
                <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
                  See All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {imageApps.map(app => (
                  <div 
                    key={app.id} 
                    className={`relative rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${app.bgColor}`}
                  >
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
                      AI
                    </div>
                    
                    <div className="flex items-center justify-center h-40">
                      <span className="text-5xl">{app.emoji}</span>
                    </div>
                    
                    <div className="pb-4 px-4">
                      <p className="font-medium text-foreground">{app.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreatePanel;
