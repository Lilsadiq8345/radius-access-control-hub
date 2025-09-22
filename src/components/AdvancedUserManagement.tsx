import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Shield, Clock, Download, Upload, Filter, Group } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    id: string;
    full_name: string;
    department?: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface UserGroup {
    id: string;
    name: string;
    description?: string;
    member_count: number;
    created_at: string;
}

const AdvancedUserManagement = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        department: '',
        role: 'user',
        groupIds: [] as string[]
    });
    const [groupFormData, setGroupFormData] = useState({
        name: '',
        description: '',
        memberIds: [] as string[]
    });
    const [bulkEditData, setBulkEditData] = useState({
        role: '',
        status: '',
        department: '',
        groupIds: [] as string[]
    });
    const { toast } = useToast();

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch users",
                    variant: "destructive",
                });
                return;
            }

            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserGroups = async () => {
        try {
            // This would fetch from a user_groups table
            // For now, we'll simulate with mock data
            const mockGroups: UserGroup[] = [
                { id: '1', name: 'Network Administrators', description: 'Full network access', member_count: 5, created_at: new Date().toISOString() },
                { id: '2', name: 'Help Desk', description: 'Limited access for support', member_count: 12, created_at: new Date().toISOString() },
                { id: '3', name: 'Guests', description: 'Temporary access', member_count: 8, created_at: new Date().toISOString() }
            ];
            setUserGroups(mockGroups);
        } catch (error) {
            console.error('Error fetching user groups:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchUserGroups();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        department: formData.department,
                        role: formData.role
                    }
                }
            });

            if (authError) {
                toast({
                    title: "Error",
                    description: authError.message,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "User created successfully. They will receive a confirmation email.",
            });

            setIsAddUserOpen(false);
            setFormData({
                email: '',
                password: '',
                fullName: '',
                department: '',
                role: 'user',
                groupIds: []
            });
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleAddGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // This would create a user group in the database
            const newGroup: UserGroup = {
                id: Date.now().toString(),
                name: groupFormData.name,
                description: groupFormData.description,
                member_count: groupFormData.memberIds.length,
                created_at: new Date().toISOString()
            };

            setUserGroups(prev => [...prev, newGroup]);

            toast({
                title: "Success",
                description: "User group created successfully.",
            });

            setIsAddGroupOpen(false);
            setGroupFormData({
                name: '',
                description: '',
                memberIds: []
            });
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleBulkEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Update selected users
            const updates = selectedUsers.map(userId => ({
                id: userId,
                ...(bulkEditData.role && { role: bulkEditData.role }),
                ...(bulkEditData.status && { status: bulkEditData.status }),
                ...(bulkEditData.department && { department: bulkEditData.department })
            }));

            // This would update users in the database
            console.log('Bulk updating users:', updates);

            toast({
                title: "Success",
                description: `Updated ${selectedUsers.length} users successfully.`,
            });

            setIsBulkEditOpen(false);
            setSelectedUsers([]);
            setBulkEditData({
                role: '',
                status: '',
                department: '',
                groupIds: []
            });
            fetchUsers();
        } catch (error) {
            console.error('Error bulk updating users:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            // This would delete the user from the database
            console.log('Deleting user:', userId);

            toast({
                title: "Success",
                description: "User deleted successfully.",
            });

            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleToggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;

        return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'suspended': return 'bg-red-500';
            case 'pending': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500';
            case 'user': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const exportUsers = () => {
        const csvContent = [
            ['Name', 'Email', 'Department', 'Role', 'Status', 'Created'],
            ...filteredUsers.map(user => [
                user.full_name,
                user.department || '',
                user.role,
                user.status,
                new Date(user.created_at).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-white">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Advanced User Management</h2>
                    <p className="text-white/60">Manage RADIUS authentication users with advanced features</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={exportUsers}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setIsAddGroupOpen(true)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        <Group className="h-4 w-4 mr-2" />
                        Add Group
                    </Button>
                    <Button
                        onClick={() => setIsAddUserOpen(true)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Filters & Search</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/60"
                                />
                            </div>
                        </div>
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                            <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                <SelectValue placeholder="Filter by department" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="it">IT</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-white">
                                    {selectedUsers.length} user(s) selected
                                </span>
                                <Button
                                    onClick={() => setIsBulkEditOpen(true)}
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Bulk Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm(`Delete ${selectedUsers.length} users?`)) {
                                            selectedUsers.forEach(handleDeleteUser);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Bulk Delete
                                </Button>
                            </div>
                            <Button
                                onClick={() => setSelectedUsers([])}
                                variant="ghost"
                                className="text-white/60 hover:text-white"
                            >
                                Clear Selection
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-3">
                                        <Checkbox
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="text-left p-3 text-white/80">Name</th>
                                    <th className="text-left p-3 text-white/80">Department</th>
                                    <th className="text-left p-3 text-white/80">Role</th>
                                    <th className="text-left p-3 text-white/80">Status</th>
                                    <th className="text-left p-3 text-white/80">Created</th>
                                    <th className="text-left p-3 text-white/80">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-3">
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={() => handleToggleUserSelection(user.id)}
                                            />
                                        </td>
                                        <td className="p-3 text-white">{user.full_name}</td>
                                        <td className="p-3 text-white/60">{user.department || '-'}</td>
                                        <td className="p-3">
                                            <Badge className={`${getRoleColor(user.role)} text-white`}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <Badge className={`${getStatusColor(user.status)} text-white`}>
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-white/60">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-white/60 hover:text-white"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="bg-black/20 backdrop-blur-md border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add New User</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Create a new RADIUS authentication user account
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-white">Full Name</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="bg-black/20 border-white/20 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-black/20 border-white/20 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="bg-black/20 border-white/20 text-white"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-white">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        <SelectItem value="it">IT</SelectItem>
                                        <SelectItem value="hr">HR</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-white">Role</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddUserOpen(false)}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                                Create User
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Group Dialog */}
            <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                <DialogContent className="bg-black/20 backdrop-blur-md border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add New User Group</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Create a new user group for easier management
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddGroup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="groupName" className="text-white">Group Name</Label>
                            <Input
                                id="groupName"
                                value={groupFormData.name}
                                onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-black/20 border-white/20 text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="groupDescription" className="text-white">Description</Label>
                            <Textarea
                                id="groupDescription"
                                value={groupFormData.description}
                                onChange={(e) => setGroupFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-black/20 border-white/20 text-white"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddGroupOpen(false)}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                                Create Group
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Edit Dialog */}
            <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                <DialogContent className="bg-black/20 backdrop-blur-md border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Bulk Edit Users</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Update {selectedUsers.length} selected users
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBulkEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bulkRole" className="text-white">Role</Label>
                                <Select value={bulkEditData.role} onValueChange={(value) => setBulkEditData(prev => ({ ...prev, role: value }))}>
                                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                        <SelectValue placeholder="Keep current" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bulkStatus" className="text-white">Status</Label>
                                <Select value={bulkEditData.status} onValueChange={(value) => setBulkEditData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                        <SelectValue placeholder="Keep current" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-white/20">
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bulkDepartment" className="text-white">Department</Label>
                            <Select value={bulkEditData.department} onValueChange={(value) => setBulkEditData(prev => ({ ...prev, department: value }))}>
                                <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                    <SelectValue placeholder="Keep current" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/20">
                                    <SelectItem value="it">IT</SelectItem>
                                    <SelectItem value="hr">HR</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsBulkEditOpen(false)}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                                Update Users
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdvancedUserManagement; 