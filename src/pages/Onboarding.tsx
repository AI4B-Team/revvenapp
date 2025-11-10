import { useState } from 'react';
import { 
  ChevronUp, ChevronDown, Check, Play, Image as ImageIcon, 
  Layout, Users, Sparkles
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const Onboarding = () => {
  const [completedTasks, setCompletedTasks] = useState(new Set(['create-community']));
  const [expandedSections, setExpandedSections] = useState(new Set(['getting-started']));
  const [activeTab, setActiveTab] = useState('Content');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting started',
      tasks: [
        {
          id: 'create-community',
          icon: <Sparkles size={20} />,
          title: 'Create your community',
          description: 'The best way to get started is to quit talking and begin doing',
          completed: true
        },
        {
          id: 'watch-video',
          icon: <Play size={20} />,
          title: 'Get to know Tribe Platform',
          description: 'See what you\'ll be able to do with Tribe',
          actionLabel: 'Play Video',
          actionColor: 'indigo'
        },
        {
          id: 'upload-logo',
          icon: <ImageIcon size={20} />,
          title: 'Upload your logo',
          description: 'Select an image and and upload your logo',
          actionLabel: 'Upload logo',
          actionColor: 'indigo'
        },
        {
          id: 'create-space',
          icon: <Layout size={20} />,
          title: 'Create a space',
          description: 'Create multiple spaces for your usecase',
          actionLabel: 'Create a space',
          actionColor: 'indigo'
        },
        {
          id: 'invite-teammates',
          icon: <Users size={20} />,
          title: 'Invite your teammates',
          description: 'Invite other admins and moderators',
          actionLabel: 'Invite',
          actionColor: 'indigo'
        }
      ]
    },
    {
      id: 'join-movement',
      title: 'Join the movement',
      tasks: []
    },
    {
      id: 'prepare-launch',
      title: 'Prepare for the launch',
      tasks: []
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
    if (!section.tasks.length) return section.id === 'join-movement' ? 4 : 6;
    return section.tasks.filter(task => !completedTasks.has(task.id)).length;
  };

  // Calculate overall progress percentage (matching the sidebar)
  const totalTasks = 7; // Total tasks as shown in sidebar
  const completedCount = completedTasks.size;
  const progressPercentage = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-background p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Congrats on the new community 🔥
                </h1>
                <p className="text-muted-foreground">
                  Complete these simple steps to get your community up and running.
                </p>
                
                {/* Overall Progress Bar */}
                <div className="mt-6 max-w-md mx-auto">
                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-green h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progressPercentage}% Completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const stepsLeft = getStepsLeft(section);

                  return (
                    <div
                      key={section.id}
                      className="bg-card rounded-xl shadow-sm overflow-hidden border border-border"
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {section.title}
                          </h3>
                          {isExpanded && stepsLeft === 0 && (
                            <div className="w-6 h-6 bg-brand-green rounded flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {stepsLeft} {stepsLeft === 1 ? 'step' : 'steps'} left
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-muted-foreground" />
                          ) : (
                            <ChevronDown size={20} className="text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Tasks List */}
                      {isExpanded && section.tasks.length > 0 && (
                        <div className="border-t border-border">
                          {section.tasks.map((task, index) => {
                            const isCompleted = completedTasks.has(task.id);

                            return (
                              <div
                                key={task.id}
                                className={`px-6 py-4 flex items-start gap-4 ${
                                  index !== section.tasks.length - 1 ? 'border-b border-border/50' : ''
                                }`}
                              >
                                {/* Icon or Completion Status */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                  isCompleted 
                                    ? 'bg-brand-green' 
                                    : 'bg-secondary'
                                }`}>
                                  {isCompleted ? (
                                    <Check size={20} className="text-white" />
                                  ) : (
                                    <span className="text-muted-foreground">{task.icon}</span>
                                  )}
                                </div>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-base font-medium mb-1 ${
                                    isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                                  }`}>
                                    {task.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {task.description}
                                  </p>
                                </div>

                                {/* Action Button */}
                                {!isCompleted && task.actionLabel && (
                                  <button
                                    onClick={() => completeTask(task.id)}
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors shrink-0"
                                  >
                                    {task.actionLabel}
                                  </button>
                                )}

                                {/* Completed Checkmark */}
                                {isCompleted && (
                                  <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center shrink-0">
                                    <Check size={16} className="text-white" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Onboarding;
