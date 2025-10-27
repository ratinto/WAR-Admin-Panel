import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, Package, Clock, CheckCircle, AlertCircle, Plus, Check, ChevronsUpDown, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import type { Order, OrderStatus } from '@/types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state for editing order
  const [editFormData, setEditFormData] = useState({
    numberOfClothes: 5,
  });
  const [editFormErrors, setEditFormErrors] = useState<{ [key: string]: string }>({});
  
  // Form state for creating new order
  const [createFormData, setCreateFormData] = useState({
    bagNo: '',
    numberOfClothes: 5,
  });
  const [createFormErrors, setCreateFormErrors] = useState<{ [key: string]: string }>({});
  const [availableStudents, setAvailableStudents] = useState<Array<{ bagNo: string; name: string }>>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search query (bag number or student name)
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.bagNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      await api.updateOrderStatus(selectedOrder.id, newStatus);
      showMessage('success', 'Order status updated successfully');
      setIsUpdateDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const validateCreateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!createFormData.bagNo.trim()) {
      errors.bagNo = 'Bag number is required';
    } else if (!/^[BG]-\d+$/.test(createFormData.bagNo)) {
      errors.bagNo = 'Invalid format. Use B-001 or G-001';
    }

    if (createFormData.numberOfClothes < 1 || createFormData.numberOfClothes > 50) {
      errors.numberOfClothes = 'Number of clothes must be between 1 and 50';
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrder = async () => {
    if (!validateCreateForm()) return;

    try {
      setActionLoading(true);
      await api.createOrder({
        bagNo: createFormData.bagNo,
        noOfClothes: createFormData.numberOfClothes,
      });
      showMessage('success', 'Order created successfully');
      setIsCreateDialogOpen(false);
      setCreateFormData({ bagNo: '', numberOfClothes: 5 });
      setCreateFormErrors({});
      fetchOrders();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create order';
      setCreateFormErrors({ submit: errorMessage });
      showMessage('error', errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateDialog = () => {
    setCreateFormData({ bagNo: '', numberOfClothes: 5 });
    setCreateFormErrors({});
    setIsCreateDialogOpen(true);
    // Fetch available students when dialog opens
    fetchAvailableStudents();
  };

  const fetchAvailableStudents = async () => {
    try {
      const students = await api.getAllStudents();
      setAvailableStudents(students.map(s => ({ bagNo: s.bagNo, name: s.name })));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    // Set default new status based on current status
    if (order.status === 'PENDING') {
      setNewStatus('INPROGRESS');
    } else if (order.status === 'INPROGRESS') {
      setNewStatus('COMPLETE');
    } else {
      setNewStatus(order.status); // Already complete
    }
    setIsUpdateDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setEditFormData({ numberOfClothes: order.numberOfClothes || order.noOfClothes || 5 });
    setEditFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleEditOrder = async () => {
    if (!selectedOrder) return;

    // Validate
    if (editFormData.numberOfClothes < 1 || editFormData.numberOfClothes > 50) {
      setEditFormErrors({ numberOfClothes: 'Number of clothes must be between 1 and 50' });
      return;
    }

    try {
      setActionLoading(true);
      await api.updateOrderCount(selectedOrder.id, editFormData.numberOfClothes);
      showMessage('success', 'Order updated successfully');
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update order');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      await api.deleteOrder(selectedOrder.id);
      showMessage('success', 'Order deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete order');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { variant: any; icon: any }> = {
      PENDING: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      INPROGRESS: { variant: 'default', icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      COMPLETE: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    };

    const config = variants[status];
    const colors: Record<OrderStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      INPROGRESS: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      COMPLETE: 'bg-green-100 text-green-800 hover:bg-green-200',
    };

    return (
      <Badge variant={config.variant} className={colors[status]}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    inProgress: orders.filter((o) => o.status === 'INPROGRESS').length,
    complete: orders.filter((o) => o.status === 'COMPLETE').length,
  };

  return (
    <DashboardLayout>
      <div className="h-full w-full space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
            <p className="text-muted-foreground">Track and manage all laundry orders</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complete</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.complete}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Orders List</CardTitle>
                <CardDescription>View and manage all laundry orders</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by bag number or name..."
                    className="pl-8 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)} className="mt-4">
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="PENDING">Pending</TabsTrigger>
                <TabsTrigger value="INPROGRESS">In Progress</TabsTrigger>
                <TabsTrigger value="COMPLETE">Complete</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No orders found matching your filters'
                  : 'No orders found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Bag Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>No. of Clothes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.bagNo}</TableCell>
                      <TableCell>{order.studentName || 'N/A'}</TableCell>
                      <TableCell>{order.numberOfClothes || order.noOfClothes}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateDialog(order)}
                            disabled={order.status === 'COMPLETE'}
                          >
                            Update Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(order)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Update Status Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Change the status of order #{selectedOrder?.id} for {selectedOrder?.studentName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Only show valid status transitions */}
                    {selectedOrder?.status === 'PENDING' && (
                      <>
                        <SelectItem value="PENDING">Pending (Current)</SelectItem>
                        <SelectItem value="INPROGRESS">In Progress</SelectItem>
                      </>
                    )}
                    {selectedOrder?.status === 'INPROGRESS' && (
                      <>
                        <SelectItem value="INPROGRESS">In Progress (Current)</SelectItem>
                        <SelectItem value="COMPLETE">Complete</SelectItem>
                      </>
                    )}
                    {selectedOrder?.status === 'COMPLETE' && (
                      <SelectItem value="COMPLETE">Complete (Final)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Bag Number:</strong> {selectedOrder?.bagNo}</p>
                <p><strong>No. of Clothes:</strong> {selectedOrder?.numberOfClothes || selectedOrder?.noOfClothes}</p>
                <p><strong>Current Status:</strong> {selectedOrder?.status}</p>
                {selectedOrder?.status === 'PENDING' && (
                  <p className="text-blue-600 mt-2">
                    <strong>Note:</strong> This will move the order to In Progress
                  </p>
                )}
                {selectedOrder?.status === 'INPROGRESS' && (
                  <p className="text-green-600 mt-2">
                    <strong>Note:</strong> This will mark the order as Complete
                  </p>
                )}
                {selectedOrder?.status === 'COMPLETE' && (
                  <p className="text-orange-600 mt-2">
                    <strong>Note:</strong> Completed orders cannot be changed
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={actionLoading || selectedOrder?.status === newStatus}
              >
                {actionLoading ? 'Updating...' : 
                 selectedOrder?.status === 'PENDING' && newStatus === 'INPROGRESS' ? 'Mark as In Progress' :
                 selectedOrder?.status === 'INPROGRESS' && newStatus === 'COMPLETE' ? 'Mark as Complete' :
                 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Order Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Create a new laundry order for a student
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bagNo">Select Student *</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                      disabled={availableStudents.length === 0}
                    >
                      {createFormData.bagNo
                        ? availableStudents.find((student) => student.bagNo === createFormData.bagNo)?.name + ' - ' + createFormData.bagNo
                        : availableStudents.length === 0 
                          ? "Loading students..." 
                          : "Select a student..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search student by name or bag number..." />
                      <CommandList>
                        <CommandEmpty>No student found.</CommandEmpty>
                        <CommandGroup>
                          {availableStudents.map((student) => (
                            <CommandItem
                              key={student.bagNo}
                              value={`${student.name} ${student.bagNo}`}
                              onSelect={() => {
                                setCreateFormData({ ...createFormData, bagNo: student.bagNo });
                                setCreateFormErrors({ ...createFormErrors, bagNo: '' });
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  createFormData.bagNo === student.bagNo ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {student.name} - {student.bagNo}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {createFormErrors.bagNo && (
                  <p className="text-sm text-red-500">{createFormErrors.bagNo}</p>
                )}
                <p className="text-xs text-gray-500">
                  {availableStudents.length === 0 ? 'Loading available students...' : `${availableStudents.length} student(s) available`}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfClothes">Number of Clothes *</Label>
                <Input
                  id="numberOfClothes"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Enter number of clothes"
                  value={createFormData.numberOfClothes}
                  onChange={(e) => {
                    setCreateFormData({ ...createFormData, numberOfClothes: parseInt(e.target.value) || 0 });
                    setCreateFormErrors({ ...createFormErrors, numberOfClothes: '' });
                  }}
                />
                {createFormErrors.numberOfClothes && (
                  <p className="text-sm text-red-500">{createFormErrors.numberOfClothes}</p>
                )}
                <p className="text-xs text-gray-500">
                  Must be between 1 and 50
                </p>
              </div>
              {createFormErrors.submit && (
                <p className="text-sm text-red-500">{createFormErrors.submit}</p>
              )}
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                <p><strong>Note:</strong> The order will be created with status <strong>PENDING</strong></p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder} disabled={actionLoading}>
                {actionLoading ? 'Creating...' : 'Create Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
              <DialogDescription>
                Update the number of clothes for order #{selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <p className="text-sm text-gray-600">
                  {selectedOrder?.studentName} - {selectedOrder?.bagNo}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Current Status</Label>
                <p className="text-sm">{getStatusBadge(selectedOrder?.status || 'PENDING')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNumberOfClothes">Number of Clothes *</Label>
                <Input
                  id="editNumberOfClothes"
                  type="number"
                  min="1"
                  max="50"
                  value={editFormData.numberOfClothes}
                  onChange={(e) => {
                    setEditFormData({ numberOfClothes: parseInt(e.target.value) || 0 });
                    setEditFormErrors({});
                  }}
                />
                {editFormErrors.numberOfClothes && (
                  <p className="text-sm text-red-500">{editFormErrors.numberOfClothes}</p>
                )}
                <p className="text-xs text-gray-500">Must be between 1 and 50</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditOrder} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Update Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Order Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this order? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-red-50 p-4 space-y-2">
                <p className="text-sm font-medium text-red-900">Order Details:</p>
                <div className="text-sm text-red-800 space-y-1">
                  <p><strong>Order ID:</strong> #{selectedOrder?.id}</p>
                  <p><strong>Student:</strong> {selectedOrder?.studentName} ({selectedOrder?.bagNo})</p>
                  <p><strong>Clothes:</strong> {selectedOrder?.numberOfClothes || selectedOrder?.noOfClothes}</p>
                  <p><strong>Status:</strong> {selectedOrder?.status}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This will permanently delete the order from the system.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteOrder} 
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? 'Deleting...' : 'Delete Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
