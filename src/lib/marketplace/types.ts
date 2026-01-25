// Marketplace types for REVVEN APPS

export interface MarketplaceUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'apps_license';
}

export interface MarketplaceWorkspace {
  id: string;
  name: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'apps_license';
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  user: MarketplaceUser;
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  memberIds: string[];
}

export interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isInstallable: boolean;
  isWhitelabelEligible: boolean;
  features: string[];
}

export interface AppInstall {
  id: string;
  appId: string;
  workspaceId: string;
  installedAt: Date;
  installedBy: string;
  accessMode: 'all_members' | 'select_users' | 'select_teams';
  allowedUserIds: string[];
  allowedTeamIds: string[];
}

export interface AppLicense {
  id: string;
  appInstallId: string;
  workspaceId: string;
  status: 'inactive' | 'active';
  brandSettings: {
    logo?: string;
    icon?: string;
    appName?: string;
    primaryColor?: string;
    favicon?: string;
    tagline?: string;
    description?: string;
  };
  domainSettings: {
    subdomain: string;
    customDomain?: string;
  };
  pricingSettings: {
    pricingModel: 'monthly' | 'one-time' | 'both';
    monthlyPrice: number;
    setupFee?: number;
    oneTimePrice?: number;
  };
  publishStatus: 'draft' | 'live';
  activatedAt?: Date;
}

export interface Client {
  id: string;
  appLicenseId: string;
  email: string;
  name: string;
  status: 'active' | 'suspended';
  createdAt: Date;
}
