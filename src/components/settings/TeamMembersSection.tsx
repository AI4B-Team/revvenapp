import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Mail, Link2, Copy, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  role: 'admin' | 'editor' | 'viewer' | 'member';
  avatarUrl?: string;
  isOwner?: boolean;
}

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Dolmar Cross', email: 'dolmarcross@gmail.com', status: 'active', role: 'admin', isOwner: true },
  { id: '2', name: 'Javier Pons', email: 'javier@realadvisors.com', status: 'active', role: 'editor' },
  { id: '3', name: 'Jaypee Vestidas', email: 'jaypee@realadvisors.com', status: 'active', role: 'member' },
];

interface TeamMembersSectionProps {
  maxSeats: number;
}

export default function TeamMembersSection({ maxSeats }: TeamMembersSectionProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [inviteLink] = useState('https://app.revven.com/invite/abc123xyz');
  const { toast } = useToast();

  const usedSeats = mockTeamMembers.length;
  const hasAvailableSeats = usedSeats < maxSeats;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link copied!",
      description: "Invite link has been copied to clipboard.",
    });
  };

  const handleSendInvitation = () => {
    if (!emailInput.trim()) return;
    
    toast({
      title: "Invitation sent!",
      description: `Invitation has been sent to the provided email addresses.`,
    });
    setEmailInput('');
    setIsInviteOpen(false);
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-brand-green/20 text-brand-green hover:bg-brand-green/20 border-0">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Inactive</Badge>;
    }
  };

  const getRoleBadge = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">Admin</Badge>;
      case 'editor':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Editor</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Viewer</Badge>;
      case 'member':
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Member</Badge>;
    }
  };

  return (
    <>
      <div className="border border-gray-400 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Team Members</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Members
          </Button>
        </div>

        {/* Team Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Email address</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockTeamMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-gray-600">
                      {member.email}
                      {member.isOwner && <span className="text-gray-400 ml-1">(You)</span>}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="py-4 px-2">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="py-4 px-2 text-right">
                    {!member.isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Invite Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Invite via Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="w-4 h-4" />
                Invite via email
              </div>
              <Textarea
                placeholder="Enter email addresses (separate with commas, spaces, or new lines)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <Button 
                className="w-full bg-foreground hover:bg-foreground/90 text-background"
                onClick={handleSendInvitation}
                disabled={!emailInput.trim() || !hasAvailableSeats}
              >
                Send Invitation
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Invite via Link */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Link2 className="w-4 h-4" />
                Invite via link
              </div>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-muted/50 text-sm"
                />
                <Button variant="ghost" size="icon" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {!hasAvailableSeats && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    No available seats. Please add more seats in the subscription page.
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Anyone with this link can claim a seat until your available seats are filled.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}