import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, MoreVertical, Shield, User as UserIcon, Eye, Ban, Power, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role?: string;
  account_status?: string;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('user');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles with account_status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError && rolesError.code !== 'PGRST116') {
        console.error('Error fetching roles:', rolesError);
      }

      // Merge profiles with roles
      const usersWithRoles = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user',
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAccountStatus = async (userId: string, status: 'active' | 'suspended' | 'disabled') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: status })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `User account has been ${status}.`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Delete user's profile (this should cascade delete related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'User Deleted',
        description: `${selectedUser.full_name || selectedUser.email} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    try {
      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', selectedUser.id)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: selectedRole as 'admin' | 'moderator' | 'user' })
          .eq('user_id', selectedUser.id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: selectedUser.id, role: selectedRole as 'admin' | 'moderator' | 'user' }]);

        if (error) throw error;
      }

      toast({
        title: 'Role Updated',
        description: `${selectedUser.full_name || selectedUser.email}'s role has been updated to ${selectedRole}.`,
      });

      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'suspended':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Suspended</Badge>;
      case 'disabled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Disabled</Badge>;
      default:
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Moderator</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">User</Badge>;
    }
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Users</h1>
              <p className="text-muted-foreground">Manage user accounts and permissions.</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-medium">{user.full_name || 'No name'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email || '—'}</TableCell>
                        <TableCell>{getRoleBadge(user.role || 'user')}</TableCell>
                        <TableCell>{getStatusBadge(user.account_status || 'active')}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user);
                                setIsDetailsModalOpen(true);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole(user.role || 'user');
                                setIsRoleModalOpen(true);
                              }}>
                                <Shield className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.account_status !== 'suspended' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateAccountStatus(user.id, 'suspended')}
                                  className="text-yellow-600"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {user.account_status !== 'disabled' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateAccountStatus(user.id, 'disabled')}
                                  className="text-orange-600"
                                >
                                  <Power className="w-4 h-4 mr-2" />
                                  Disable
                                </DropdownMenuItem>
                              )}
                              {user.account_status !== 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateAccountStatus(user.id, 'active')}
                                  className="text-green-600"
                                >
                                  <Power className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Change Role Modal */}
          <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change User Role</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Update the role for <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
                </p>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangeRole}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* User Details Modal */}
          <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {selectedUser.avatar_url ? (
                        <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedUser.full_name || 'No name'}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 pt-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">User ID</span>
                      <span className="font-mono text-xs">{selectedUser.id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Role</span>
                      {getRoleBadge(selectedUser.role || 'user')}
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge(selectedUser.account_status || 'active')}
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Joined</span>
                      <span>{format(new Date(selectedUser.created_at), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Join Time</span>
                      <span>{format(new Date(selectedUser.created_at), 'h:mm a')}</span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedRole(selectedUser?.role || 'user');
                  setIsRoleModalOpen(true);
                }}>
                  <Shield className="w-4 h-4 mr-2" />
                  Change Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{selectedUser?.full_name || selectedUser?.email}</strong>? 
                  This action cannot be undone and will remove all their data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteUser}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminUsers;
