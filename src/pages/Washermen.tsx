import { useEffect, useState } from 'react';
import { Trash2, Edit, Plus, Search, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import type { Washerman } from '@/types';

export default function Washermen() {
  const [washermen, setWashermen] = useState<Washerman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWasherman, setSelectedWasherman] = useState<Washerman | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchWashermen();
  }, []);

  const fetchWashermen = async () => {
    try {
      setLoading(true);
      const data = await api.getAllWashermen();
      setWashermen(data);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to fetch washermen');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!isEditDialogOpen && !formData.password) {
      errors.password = 'Password is required';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddWasherman = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      await api.createWasherman(formData);
      showMessage('success', 'Washerman added successfully');
      setIsAddDialogOpen(false);
      setFormData({ username: '', password: '' });
      setFormErrors({});
      fetchWashermen();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create washerman';
      setFormErrors({ submit: errorMessage });
      showMessage('error', errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateWasherman = async () => {
    if (!selectedWasherman || !validateForm()) return;

    try {
      setActionLoading(true);
      const updateData: any = {
        username: formData.username,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      await api.updateWasherman(selectedWasherman.id, updateData);
      showMessage('success', 'Washerman updated successfully');
      setIsEditDialogOpen(false);
      setSelectedWasherman(null);
      setFormData({ username: '', password: '' });
      setFormErrors({});
      fetchWashermen();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update washerman';
      setFormErrors({ submit: errorMessage });
      showMessage('error', errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWasherman = async () => {
    if (!selectedWasherman) return;

    try {
      setActionLoading(true);
      await api.deleteWasherman(selectedWasherman.id);
      showMessage('success', 'Washerman deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedWasherman(null);
      fetchWashermen();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete washerman');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (washerman: Washerman) => {
    setSelectedWasherman(washerman);
    setFormData({
      username: washerman.username,
      password: '',
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (washerman: Washerman) => {
    setSelectedWasherman(washerman);
    setIsDeleteDialogOpen(true);
  };

  const openAddDialog = () => {
    setFormData({ username: '', password: '' });
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  const filteredWashermen = washermen.filter((washerman) =>
    washerman.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Washermen Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage washerman accounts and permissions
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Washerman
        </Button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Washermen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{washermen.length}</div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Washermen List</CardTitle>
              <CardDescription>View and manage all washerman accounts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search washermen..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading washermen...</div>
          ) : filteredWashermen.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No washermen found matching your search' : 'No washermen found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWashermen.map((washerman) => (
                  <TableRow key={washerman.id}>
                    <TableCell className="font-medium">{washerman.id}</TableCell>
                    <TableCell>{washerman.username}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(washerman.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(washerman)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(washerman)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Washerman Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Washerman</DialogTitle>
            <DialogDescription>Create a new washerman account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  setFormErrors({ ...formErrors, username: '' });
                }}
              />
              {formErrors.username && (
                <p className="text-sm text-red-500">{formErrors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFormErrors({ ...formErrors, password: '' });
                }}
              />
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>
            {formErrors.submit && (
              <p className="text-sm text-red-500">{formErrors.submit}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWasherman} disabled={actionLoading}>
              {actionLoading ? 'Adding...' : 'Add Washerman'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Washerman Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Washerman</DialogTitle>
            <DialogDescription>Update washerman account details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  setFormErrors({ ...formErrors, username: '' });
                }}
              />
              {formErrors.username && (
                <p className="text-sm text-red-500">{formErrors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFormErrors({ ...formErrors, password: '' });
                }}
              />
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>
            {formErrors.submit && (
              <p className="text-sm text-red-500">{formErrors.submit}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWasherman} disabled={actionLoading}>
              {actionLoading ? 'Updating...' : 'Update Washerman'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Washerman</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedWasherman?.username}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWasherman} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
}
