// Permission helpers for marketplace

import { AppInstall, WorkspaceMember, MarketplaceWorkspace } from './types';

export function canAccessApp(
  install: AppInstall,
  userId: string,
  member: WorkspaceMember
): boolean {
  if (install.accessMode === 'all_members') {
    return true;
  }

  if (install.accessMode === 'select_users') {
    return install.allowedUserIds.includes(userId);
  }

  if (install.accessMode === 'select_teams') {
    return install.allowedTeamIds.length > 0;
  }

  return false;
}

export function canActivateLicense(workspace: MarketplaceWorkspace): boolean {
  return workspace.plan === 'apps_license';
}

export function hasAppLicense(workspace: MarketplaceWorkspace): boolean {
  return workspace.plan === 'apps_license';
}

export function canManageApps(member: WorkspaceMember): boolean {
  return member.role === 'owner' || member.role === 'admin';
}
