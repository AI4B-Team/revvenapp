import { useState } from 'react';
import { 
  ChevronUp, ChevronDown, Check, Play, Image as ImageIcon, 
  Layout, Users, Sparkles, Video, DollarSign, Zap, FileText, 
  Music, CreditCard, TrendingUp, Package, Mail, Bot, MessageSquare,
  Tag, Mic, BookOpen, Ticket, X
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Onboarding = () => {
  const [completedTasks, setCompletedTasks] = useState(new Set(['create-project']));
  const [expandedSections, setExpandedSections] = useState(new Set(['getting-started']));
  const [activeTab, setActiveTab] = useState('Content');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const sections = [
    {
      id: 'getting-started',
      title: '1. Getting Started',
      subtitle: 'Set Up Your Brand DNA',
      icon: <Sparkles size={24} />,
      color: 'text-brand-green',
      tasks: [
        {
          id: 'create-project',
          icon: <Sparkles size={20} />,
          title: 'Create Your First Project',
          description: 'Kickstart your REVVEN journey by creating your first project',
          completed: true
        },
        {
          id: 'watch-video',
          icon: <Play size={20} />,
          title: 'Get To Know The REVVEN Platform',
          description: 'See what you\'ll be able to do with REVVEN',
          actionLabel: 'Play Video',
          actionColor: 'indigo'
        },
        {
          id: 'brand-profile',
          icon: <Tag size={20} />,
          title: 'Create Your Brand Profile',
          description: 'Build your complete brand profile by creating your identity, defining your voice, adding knowledge, conducting competitor analysis, and selecting your AI character to be the spokesperson for your brand',
          actionLabel: 'Build Profile',
          actionColor: 'indigo'
        },
        {
          id: 'invite-teammates',
          icon: <Users size={20} />,
          title: 'Invite Your Team Members',
          description: 'Invite other admins and moderators to collaborate',
          actionLabel: 'Invite',
          actionColor: 'indigo'
        },
        {
          id: 'workshop',
          icon: <Ticket size={20} />,
          title: 'Register For The FREE 3-Day Virtual AI Workshop',
          description: 'Connect with the community, learn automation strategies, and unlock bonus AI templates',
          actionLabel: 'Register Now',
          actionColor: 'indigo'
        }
      ]
    },
    {
      id: 'create',
      title: '2. Create',
      subtitle: 'Launch Your Creative Engine',
      icon: <Sparkles size={24} />,
      color: 'text-primary',
      tasks: [
        {
          id: 'create-task-1',
          icon: <ImageIcon size={20} />,
          title: 'Generate Your First Image',
          description: 'Use AI to create stunning visuals',
          actionLabel: 'Create Image',
          actionColor: 'indigo'
        },
        {
          id: 'create-task-2',
          icon: <Video size={20} />,
          title: 'Create Your First Video',
          description: 'Transform ideas into video content',
          actionLabel: 'Create Video',
          actionColor: 'indigo'
        },
        {
          id: 'create-task-3',
          icon: <FileText size={20} />,
          title: 'Write AI-Powered Content',
          description: 'Create a digital product with AI-powered content generation',
          actionLabel: 'Create Content',
          actionColor: 'indigo'
        }
      ]
    },
    {
      id: 'monetize',
      title: '3. Monetize',
      subtitle: 'Activate Your Profit System',
      icon: <DollarSign size={24} />,
      color: 'text-brand-green',
      tasks: [
        {
          id: 'monetize-task-1',
          icon: <Package size={20} />,
          title: 'Select A Product To Sell',
          description: 'Choose from ready-to-sell digital products or create your own',
          actionLabel: 'Select Product',
          actionColor: 'indigo'
        },
        {
          id: 'monetize-task-2',
          icon: <Layout size={20} />,
          title: 'Create Your First Funnel',
          description: 'Set up your sales funnel or use a pre-built template',
          actionLabel: 'Create Funnel',
          actionColor: 'indigo'
        }
      ]
    },
    {
      id: 'automate',
      title: '4. Automate',
      subtitle: 'Let Your AI Take Over',
      icon: <Zap size={24} />,
      color: 'text-purple-500',
      tasks: [
        {
          id: 'automate-task-1',
          icon: <Bot size={20} />,
          title: 'Deploy Content AI Agent',
          description: 'Automate content creation and manage your content calendar for all social platforms',
          actionLabel: 'Deploy Agent',
          actionColor: 'indigo'
        },
        {
          id: 'automate-task-2',
          icon: <MessageSquare size={20} />,
          title: 'Deploy Social AI Agent',
          description: 'Automate posting and handle replies to comments, DMs, and stories',
          actionLabel: 'Deploy Agent',
          actionColor: 'indigo'
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const completeTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      newSet.add(taskId);
      return newSet;
    });
  };

  const getStepsLeft = (section: typeof sections[0]) => {
    return section.tasks.filter(task => !completedTasks.has(task.id)).length;
  };

  // Calculate overall progress percentage
  const progressPercentage = 29;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-background p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              
              {/* Welcome Header */}
              <div className="bg-secondary/30 rounded-2xl p-6 mb-4">
                <h1 className="text-4xl font-bold text-foreground">
                  Welcome, Brian 👋
                </h1>
              </div>

              {/* AI Team Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
                      Your AI Team Is Ready To Work — But They Need To Learn Your Brand First
                    </h2>
                    <p className="text-gray-700 dark:text-muted-foreground leading-relaxed">
                      Complete your brand profile to activate Dolmar, Keisha, Francis, Rich, Brian, and Damoi. Once they know your voice, colors, and style, they'll start creating content, building campaigns, and automating your business 24/7.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Onboarding Sections */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Quick Start Card */}
                  <div className="bg-card rounded-2xl shadow-sm p-8 border border-border">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Quick Start</h2>
                    <p className="text-muted-foreground mb-6">
                      Get started with REVVEN by completing the following steps.
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-brand-green h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{progressPercentage}% Completed</p>
                  </div>

                  {/* Sections */}
                  {sections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const stepsLeft = getStepsLeft(section);

                    return (
                      <div
                        key={section.id}
                        className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border"
                      >
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-8 py-6 flex items-center justify-between bg-secondary/30 hover:bg-secondary transition-colors"
                        >
                          <div className="text-left">
                            <h3 className="text-2xl font-bold text-foreground mb-1">
                              {section.title}
                            </h3>
                            <p className="text-muted-foreground">{section.subtitle}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground font-medium">
                              {stepsLeft} {stepsLeft === 1 ? 'step' : 'steps'} left
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={24} className="text-muted-foreground" />
                            ) : (
                              <ChevronDown size={24} className="text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {/* Tasks List */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 bg-accent/50">
                            {section.tasks.map((task) => {
                              const isCompleted = completedTasks.has(task.id);

                              return (
                                <div
                                  key={task.id}
                                  className={`px-8 py-6 flex items-start gap-5 rounded-2xl transition-all duration-200 ${
                                    task.id === 'watch-video' && !isCompleted 
                                      ? 'border-2 border-green-600 bg-card' 
                                      : 'bg-card border border-border hover:border-green-600/40'
                                  }`}
                                >
                                  {/* Icon or Completion Status */}
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    isCompleted 
                                      ? 'bg-brand-green' 
                                      : 'bg-secondary'
                                  }`}>
                                    {isCompleted ? (
                                      <Check size={24} className="text-white" />
                                    ) : (
                                      <span className="text-muted-foreground">{task.icon}</span>
                                    )}
                                  </div>

                                  {/* Task Content */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`text-base font-semibold mb-1 ${
                                      isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                                    }`}>
                                      {task.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {task.description}
                                    </p>
                                  </div>

                                  {/* Action Button or Checkmark */}
                                  {!isCompleted && task.actionLabel ? (
                                    <button
                                      onClick={() => completeTask(task.id)}
                                      className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors shrink-0"
                                    >
                                      {task.actionLabel}
                                    </button>
                                  ) : isCompleted ? (
                                    <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center shrink-0">
                                      <Check size={20} className="text-white" />
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right Column - Video Tutorial */}
                <div className="lg:col-span-1">
                  <div className="bg-card rounded-2xl shadow-sm p-6 border border-border sticky top-6">
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      Watch This 3 Minute Overview
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Get started with REVVEN by watching this video.
                    </p>

                    {/* Video Thumbnail */}
                    <div 
                      onClick={() => setIsVideoModalOpen(true)}
                      className="relative aspect-video rounded-xl overflow-hidden bg-secondary group cursor-pointer mb-4"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"
                        alt="Tutorial video"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center transition-all transform group-hover:scale-110">
                          <Play size={28} className="text-foreground ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsVideoModalOpen(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      Play Overview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative w-full aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="REVVEN Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;
