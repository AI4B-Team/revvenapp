// Sample data for marketplace

import { MarketplaceApp, MarketplaceWorkspace, MarketplaceUser, WorkspaceMember, Team } from './types';

export const sampleMarketplaceApps: MarketplaceApp[] = [
  {
    id: 'app-1',
    name: 'AI Image Generator',
    description: 'Create stunning AI art from text prompts with advanced models',
    icon: '🎨',
    category: 'creative',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Text-to-image', 'Multiple styles', 'HD exports']
  },
  {
    id: 'app-2',
    name: 'Video Editor Pro',
    description: 'Professional video editing with AI-powered features',
    icon: '🎬',
    category: 'creative',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Timeline editing', 'Effects', 'Export formats']
  },
  {
    id: 'app-3',
    name: 'Form Builder',
    description: 'Build custom forms with conditional logic',
    icon: '📋',
    category: 'productivity',
    isInstallable: true,
    isWhitelabelEligible: false,
    features: ['Drag-and-drop', 'Logic rules', 'Integrations']
  },
  {
    id: 'app-4',
    name: 'Invoice Manager',
    description: 'Create and manage professional invoices',
    icon: '💰',
    category: 'business',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Templates', 'Payment tracking', 'Reports']
  },
  {
    id: 'app-5',
    name: 'Email Campaigns',
    description: 'Send beautiful email campaigns to your audience',
    icon: '📧',
    category: 'marketing',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Templates', 'Analytics', 'A/B testing']
  },
  {
    id: 'app-6',
    name: 'CRM Suite',
    description: 'Manage customer relationships and sales pipeline',
    icon: '👥',
    category: 'business',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Contact management', 'Pipeline', 'Reports']
  },
  {
    id: 'app-7',
    name: 'Social Media Manager',
    description: 'Schedule and analyze social media posts',
    icon: '📱',
    category: 'marketing',
    isInstallable: true,
    isWhitelabelEligible: true,
    features: ['Multi-platform', 'Scheduling', 'Analytics']
  },
  {
    id: 'app-8',
    name: 'Project Manager',
    description: 'Track tasks, sprints, and team progress',
    icon: '📊',
    category: 'productivity',
    isInstallable: true,
    isWhitelabelEligible: false,
    features: ['Kanban boards', 'Gantt charts', 'Time tracking']
  }
];

export const mockMarketplaceUser: MarketplaceUser = {
  id: 'user-1',
  email: 'founder@revven.com',
  name: 'Zaddy',
  plan: 'apps_license'
};

export const mockMarketplaceWorkspace: MarketplaceWorkspace = {
  id: 'workspace-1',
  name: 'REVVEN HQ',
  ownerId: 'user-1',
  plan: 'apps_license'
};

export const mockMembers: WorkspaceMember[] = [
  {
    id: 'member-1',
    workspaceId: 'workspace-1',
    userId: 'user-1',
    role: 'owner',
    user: mockMarketplaceUser
  },
  {
    id: 'member-2',
    workspaceId: 'workspace-1',
    userId: 'user-2',
    role: 'admin',
    user: {
      id: 'user-2',
      email: 'admin@revven.com',
      name: 'Alex Chen',
      plan: 'pro'
    }
  },
  {
    id: 'member-3',
    workspaceId: 'workspace-1',
    userId: 'user-3',
    role: 'member',
    user: {
      id: 'user-3',
      email: 'sarah@revven.com',
      name: 'Sarah Johnson',
      plan: 'free'
    }
  }
];

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    workspaceId: 'workspace-1',
    name: 'Engineering',
    memberIds: ['user-1', 'user-2']
  },
  {
    id: 'team-2',
    workspaceId: 'workspace-1',
    name: 'Marketing',
    memberIds: ['user-2', 'user-3']
  }
];
