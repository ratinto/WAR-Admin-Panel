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
import { Plus, Search, Edit, Trash2, RefreshCw, UserPlus } from 'lucide-react';
import { api } from '@/services/api';
import type { Student } from '@/types';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bagNo: '',
    email: '',
    enrollmentNo: '',
    phoneNo: '',
    residencyNo: '',
    password: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.bagNo.toLowerCase().includes(query) ||
          student.phoneNo.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.enrollmentNo.toLowerCase().includes(query) ||
          student.residencyNo.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      bagNo: '',
      email: '',
      enrollmentNo: '',
      phoneNo: '',
      residencyNo: '',
      password: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      bagNo: student.bagNo,
      email: student.email,
      enrollmentNo: student.enrollmentNo,
      phoneNo: student.phoneNo,
      residencyNo: student.residencyNo,
      password: '', // Don't show existing password
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      // Basic validation
      if (!formData.bagNo || !formData.name || !formData.email || !formData.password) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Validate bag number format
      if (!/^[BG]-\d+$/.test(formData.bagNo)) {
        alert('Bag number must be in format B-001 or G-001 (uppercase B or G, hyphen, then numbers)');
        return;
      }

      await api.createStudent(formData);
      setIsAddDialogOpen(false);
      // Reset form
      setFormData({
        name: '',
        bagNo: '',
        email: '',
        enrollmentNo: '',
        phoneNo: '',
        residencyNo: '',
        password: '',
      });
      // Show success message
      alert('Student created successfully!');
      fetchStudents();
    } catch (error: any) {
      console.error('Error creating student:', error);
      // Extract detailed error message from backend
      let errorMessage = 'Failed to create student';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errorMessage = errors.map((e: any) => e.msg).join('\n');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedStudent) return;
    try {
      await api.updateStudent(selectedStudent.bagNo, formData);
      setIsEditDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      console.error('Error updating student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update student';
      alert(errorMessage);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      await api.deleteStudent(selectedStudent.bagNo);
      setIsDeleteDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete student';
      alert(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full w-full space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Students</h2>
            <p className="text-muted-foreground">Manage student accounts and information</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchStudents} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStudents.length}</div>
              <p className="text-xs text-muted-foreground">Matching records</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Students List</CardTitle>
                <CardDescription>View and manage all student records</CardDescription>
              </div>
              <div className="w-80">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, bag no, phone, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                {searchQuery ? 'No students found matching your search' : 'No students found'}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bag No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Enrollment No</TableHead>
                      <TableHead>Residency No</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.bagNo}>
                        <TableCell className="font-medium">{student.bagNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phoneNo}</TableCell>
                        <TableCell>{student.enrollmentNo}</TableCell>
                        <TableCell>{student.residencyNo}</TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(student)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(student)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Student Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter student details to create a new account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="bagNo">Bag Number</Label>
                <Input
                  id="bagNo"
                  placeholder="B-001"
                  value={formData.bagNo}
                  onChange={(e) => setFormData({ ...formData, bagNo: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-muted-foreground">Format: B-001 or G-001 (uppercase)</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  placeholder="+91 9876543210"
                  value={formData.phoneNo}
                  onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="enrollmentNo">Enrollment Number</Label>
                <Input
                  id="enrollmentNo"
                  placeholder="2024001"
                  value={formData.enrollmentNo}
                  onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="residencyNo">Residency Number</Label>
                <Input
                  id="residencyNo"
                  placeholder="H1-101"
                  value={formData.residencyNo}
                  onChange={(e) => setFormData({ ...formData, residencyNo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubmit}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-bagNo">Bag Number</Label>
                <Input
                  id="edit-bagNo"
                  value={formData.bagNo}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phoneNo">Phone Number</Label>
                <Input
                  id="edit-phoneNo"
                  value={formData.phoneNo}
                  onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-enrollmentNo">Enrollment Number</Label>
                <Input
                  id="edit-enrollmentNo"
                  value={formData.enrollmentNo}
                  onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-residencyNo">Residency Number</Label>
                <Input
                  id="edit-residencyNo"
                  value={formData.residencyNo}
                  onChange={(e) => setFormData({ ...formData, residencyNo: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this student? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="rounded-lg border bg-muted p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Student Details:</p>
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {selectedStudent.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Bag No:</span> {selectedStudent.bagNo}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {selectedStudent.phoneNo}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
