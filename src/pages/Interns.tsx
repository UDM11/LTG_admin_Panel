import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Download,
  Upload,
  Trash2,
  Send,
  FileText,
  Settings,
  UserPlus,
  X
} from 'lucide-react';

interface Intern {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'paused';
  progress: number;
  avatar?: string;
  location: string;
  supervisor: string;
  tasksCompleted: number;
  totalTasks: number;
  rating: number;
}

const mockInterns: Intern[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@ltg.com',
    phone: '+1 (555) 123-4567',
    position: 'Frontend Developer',
    department: 'Engineering',
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    status: 'active',
    progress: 75,
    location: 'New York, NY',
    supervisor: 'John Smith',
    tasksCompleted: 15,
    totalTasks: 20,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@ltg.com',
    phone: '+1 (555) 234-5678',
    position: 'Data Analyst',
    department: 'Analytics',
    startDate: '2024-02-01',
    endDate: '2024-07-01',
    status: 'active',
    progress: 60,
    location: 'San Francisco, CA',
    supervisor: 'Emily Davis',
    tasksCompleted: 12,
    totalTasks: 18,
    rating: 4.6
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.wilson@ltg.com',
    phone: '+1 (555) 345-6789',
    position: 'UX Designer',
    department: 'Design',
    startDate: '2023-12-01',
    endDate: '2024-05-01',
    status: 'completed',
    progress: 100,
    location: 'Austin, TX',
    supervisor: 'Alex Rodriguez',
    tasksCompleted: 25,
    totalTasks: 25,
    rating: 4.9
  },
  {
    id: '4',
    name: 'David Kumar',
    email: 'david.kumar@ltg.com',
    phone: '+1 (555) 456-7890',
    position: 'Backend Developer',
    department: 'Engineering',
    startDate: '2024-03-01',
    endDate: '2024-08-01',
    status: 'pending',
    progress: 25,
    location: 'Seattle, WA',
    supervisor: 'Lisa Thompson',
    tasksCompleted: 5,
    totalTasks: 22,
    rating: 4.2
  }
];

export default function Interns() {
  const [interns, setInterns] = useState<Intern[]>(mockInterns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [viewingIntern, setViewingIntern] = useState<Intern | null>(null);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [formData, setFormData] = useState<Partial<Intern>>({});
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [internToDelete, setInternToDelete] = useState<Intern | null>(null);
  const { toast } = useToast();

  const filteredInterns = useMemo(() => {
    return interns.filter(intern => {
      const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           intern.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || intern.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || intern.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, statusFilter, departmentFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'paused': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const stats = {
    total: interns.length,
    active: interns.filter(i => i.status === 'active').length,
    completed: interns.filter(i => i.status === 'completed').length,
    avgProgress: Math.round(interns.reduce((acc, i) => acc + i.progress, 0) / interns.length)
  };

  const handleAddIntern = () => {
    if (!formData.name || !formData.email || !formData.position) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const newIntern: Intern = {
      id: Date.now().toString(),
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone || '',
      position: formData.position!,
      department: formData.department || 'Engineering',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: formData.status as any || 'pending',
      progress: formData.progress || 0,
      location: formData.location || '',
      supervisor: formData.supervisor || '',
      tasksCompleted: 0,
      totalTasks: formData.totalTasks || 10,
      rating: 0
    };
    
    setInterns([...interns, newIntern]);
    setFormData({});
    setIsAddDialogOpen(false);
    toast({ title: "Success", description: "Intern added successfully" });
  };

  const handleEditIntern = () => {
    if (!editingIntern || !formData.name || !formData.email) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const updatedIntern = { ...editingIntern, ...formData };
    setInterns(interns.map(i => i.id === editingIntern.id ? updatedIntern : i));
    setEditingIntern(null);
    setFormData({});
    setIsEditDialogOpen(false);
    toast({ title: "Success", description: "Intern updated successfully" });
  };

  const handleDeleteIntern = (intern: Intern) => {
    setInternToDelete(intern);
    setDeleteDialogOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const confirmDeleteIntern = () => {
    if (internToDelete) {
      setInterns(prevInterns => prevInterns.filter(i => i.id !== internToDelete.id));
      setSelectedInterns(prevSelected => prevSelected.filter(id => id !== internToDelete.id));
      toast({ 
        title: "Success", 
        description: `${internToDelete.name} has been deleted successfully`,
        variant: "default"
      });
      setDeleteDialogOpen(false);
      setInternToDelete(null);
      document.body.style.overflow = 'unset';
    }
  };

  const handleBulkDelete = () => {
    const selectedInternsData = interns.filter(i => selectedInterns.includes(i.id));
    if (selectedInternsData.length === 1) {
      // Use single delete dialog for one intern
      setInternToDelete(selectedInternsData[0]);
      setDeleteDialogOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      // Use bulk delete dialog for multiple interns
      setBulkDeleteDialogOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const confirmBulkDelete = () => {
    const deletedCount = selectedInterns.length;
    setInterns(prevInterns => prevInterns.filter(i => !selectedInterns.includes(i.id)));
    setSelectedInterns([]);
    setBulkDeleteDialogOpen(false);
    document.body.style.overflow = 'unset';
    toast({ 
      title: "Success", 
      description: `${deletedCount} intern${deletedCount > 1 ? 's' : ''} deleted successfully`,
      variant: "default"
    });
  };

  const handleSelectAll = () => {
    if (selectedInterns.length === filteredInterns.length) {
      setSelectedInterns([]);
    } else {
      setSelectedInterns(filteredInterns.map(i => i.id));
    }
  };

  const openEditDialog = (intern: Intern) => {
    setEditingIntern(intern);
    setFormData(intern);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (intern: Intern) => {
    setViewingIntern(intern);
    setIsViewDialogOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewingIntern(null);
    document.body.style.overflow = 'unset';
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Position,Department,Status,Progress,Location,Supervisor\n" +
      interns.map(i => `${i.name},${i.email},${i.position},${i.department},${i.status},${i.progress}%,${i.location},${i.supervisor}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "interns.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Success", description: "Data exported successfully" });
  };

  const handleSendEmail = (intern: Intern) => {
    setViewingIntern(intern);
    setEmailData({
      subject: `Regarding Your Internship - ${intern.name}`,
      message: `Dear ${intern.name},\n\nI hope this email finds you well. I wanted to reach out regarding your internship progress.\n\nCurrent Status: ${intern.status}\nProgress: ${intern.progress}%\nTasks Completed: ${intern.tasksCompleted}/${intern.totalTasks}\n\nPlease let me know if you have any questions or need any assistance.\n\nBest regards,\n[Your Name]`
    });
    setIsEmailDialogOpen(true);
  };

  const sendEmail = () => {
    if (!viewingIntern || !emailData.subject || !emailData.message) {
      toast({ title: "Error", description: "Please fill in all email fields", variant: "destructive" });
      return;
    }
    
    // Create mailto link
    const mailtoLink = `mailto:${viewingIntern.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.message)}`;
    window.open(mailtoLink);
    
    setIsEmailDialogOpen(false);
    setEmailData({ subject: '', message: '' });
    toast({ title: "Success", description: "Email client opened successfully" });
  };

  const generateReport = (intern: Intern) => {
    const reportContent = `
# INTERN PERFORMANCE REPORT

## Personal Information
Name: ${intern.name}
Email: ${intern.email}
Phone: ${intern.phone || 'Not provided'}
Location: ${intern.location}

## Internship Details
Position: ${intern.position}
Department: ${intern.department}
Supervisor: ${intern.supervisor}
Start Date: ${new Date(intern.startDate).toLocaleDateString()}
End Date: ${new Date(intern.endDate).toLocaleDateString()}
Status: ${intern.status.toUpperCase()}

## Performance Metrics
Overall Progress: ${intern.progress}%
Tasks Completed: ${intern.tasksCompleted}
Total Tasks Assigned: ${intern.totalTasks}
Completion Rate: ${Math.round((intern.tasksCompleted / intern.totalTasks) * 100)}%
Performance Rating: ${intern.rating}/5.0

## Summary
${intern.name} is currently ${intern.status} in their ${intern.position} internship.
They have completed ${intern.tasksCompleted} out of ${intern.totalTasks} assigned tasks,
showing a ${intern.progress}% overall progress with a ${intern.rating}/5.0 performance rating.

---
Report generated on: ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${intern.name.replace(/\s+/g, '_')}_Intern_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "Success", description: "Report generated and downloaded successfully" });
  };



  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Intern Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track intern progress across all departments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Intern
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Intern</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Enter position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department || ''} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || ''} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input
                    id="supervisor"
                    value={formData.supervisor || ''}
                    onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                    placeholder="Enter supervisor name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddIntern}>Add Intern</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          {selectedInterns.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedInterns.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Interns</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search interns by name, email, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Checkbox
                checked={selectedInterns.length === filteredInterns.length && filteredInterns.length > 0}
                onCheckedChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm text-muted-foreground mr-4">
                {selectedInterns.length > 0 && `${selectedInterns.length} selected`}
              </span>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInterns.map((intern) => (
          <Card key={intern.id} className={`${selectedInterns.includes(intern.id) ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedInterns.includes(intern.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedInterns([...selectedInterns, intern.id]);
                      } else {
                        setSelectedInterns(selectedInterns.filter(id => id !== intern.id));
                      }
                    }}
                    className="mr-2"
                  />
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={intern.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {intern.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{intern.name}</h3>
                    <p className="text-sm text-muted-foreground">{intern.position}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(intern)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendEmail(intern)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => generateReport(intern)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                      onClick={() => handleDeleteIntern(intern)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(intern.status)} flex items-center gap-1`}>
                  {getStatusIcon(intern.status)}
                  {intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{intern.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{intern.progress}%</span>
                </div>
                <Progress value={intern.progress} className="h-2" />
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{intern.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{intern.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(intern.startDate).toLocaleDateString()} - {new Date(intern.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between text-sm">
                <span>Tasks: {intern.tasksCompleted}/{intern.totalTasks}</span>
                <span>Supervisor: {intern.supervisor}</span>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openViewDialog(intern)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => openEditDialog(intern)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInterns.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Users className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No interns found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or add new interns.</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Intern
            </Button>
          </div>
        </Card>
      )}
      
      {/* Advanced View Dialog */}
      {isViewDialogOpen && viewingIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300"
            onClick={closeViewDialog}
          />
          
          {/* Dialog Content */}
          <div className="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-4 border-white/20">
                      <AvatarImage src={viewingIntern.avatar} />
                      <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                        {viewingIntern.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{viewingIntern.name}</h2>
                      <p className="text-blue-100">{viewingIntern.position}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${getStatusColor(viewingIntern.status)} text-xs`}>
                          {getStatusIcon(viewingIntern.status)}
                          {viewingIntern.status.charAt(0).toUpperCase() + viewingIntern.status.slice(1)}
                        </Badge>
                        <div className="flex items-center space-x-1 text-yellow-300">
                          <Award className="w-4 h-4" />
                          <span className="text-sm font-medium">{viewingIntern.rating}/5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={closeViewDialog}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </CardHeader>
              
              {/* Content */}
              <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{viewingIntern.email}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{viewingIntern.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{viewingIntern.location}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Internship Details */}
                  <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-purple-600" />
                        Internship Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Department</p>
                          <p className="font-medium">{viewingIntern.department}</p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground">Supervisor</p>
                          <p className="font-medium">{viewingIntern.supervisor}</p>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="font-medium">
                              {new Date(viewingIntern.startDate).toLocaleDateString()} - {new Date(viewingIntern.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Progress & Performance */}
                  <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Progress & Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Overall Progress</span>
                            <span className="text-lg font-bold text-blue-600">{viewingIntern.progress}%</span>
                          </div>
                          <Progress value={viewingIntern.progress} className="h-3" />
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{viewingIntern.tasksCompleted}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{viewingIntern.totalTasks}</p>
                            <p className="text-xs text-muted-foreground">Total Tasks</p>
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <div className="flex items-center justify-center space-x-1">
                            <Award className="w-5 h-5 text-yellow-600" />
                            <p className="text-xl font-bold text-yellow-600">{viewingIntern.rating}</p>
                            <span className="text-sm text-muted-foreground">/5.0</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Performance Rating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <Button variant="outline" onClick={() => {
                    closeViewDialog();
                    openEditDialog(viewingIntern);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Intern
                  </Button>
                  <Button variant="outline" onClick={() => handleSendEmail(viewingIntern)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" onClick={() => generateReport(viewingIntern)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2 text-blue-600" />
              Send Email to {viewingIntern?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>To: {viewingIntern?.email}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="Enter email subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                placeholder="Enter your message"
                rows={8}
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>This will open your default email client with the pre-filled content.</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendEmail} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Delete Intern
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>
          
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400 mt-4">
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{internToDelete?.name}</span>? 
            This action cannot be undone and will permanently remove all intern data including:
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li>Personal information and contact details</li>
              <li>Progress tracking and task completion data</li>
              <li>Performance ratings and evaluations</li>
            </ul>
          </AlertDialogDescription>
          
          <AlertDialogFooter className="mt-6 space-x-2">
            <AlertDialogCancel 
              onClick={() => {
                setDeleteDialogOpen(false);
                setInternToDelete(null);
                document.body.style.overflow = 'unset';
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteIntern}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border-0 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Intern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Delete Multiple Interns
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>
          
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400 mt-4">
            <div className="space-y-4">
              <p className="text-base">
                Are you sure you want to delete <span className="font-bold text-red-600 dark:text-red-400">{selectedInterns.length}</span> selected intern{selectedInterns.length > 1 ? 's' : ''}?
              </p>
              
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200 text-sm">Warning: This action cannot be undone</p>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                      This will permanently remove all data for the selected interns including:
                    </p>
                  </div>
                </div>
              </div>
              
              <ul className="ml-6 space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>Personal information and contact details</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>Progress tracking and task completion data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>Performance ratings and evaluations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>All associated reports and documentation</span>
                </li>
              </ul>
              
              {selectedInterns.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected interns to be deleted:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {interns
                      .filter(intern => selectedInterns.includes(intern.id))
                      .map(intern => (
                        <div key={intern.id} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{intern.name}</span>
                          <span className="text-gray-500 dark:text-gray-400">({intern.position})</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
          
          <AlertDialogFooter className="mt-6 space-x-3">
            <AlertDialogCancel 
              onClick={() => {
                setBulkDeleteDialogOpen(false);
                document.body.style.overflow = 'unset';
              }}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white border-0 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedInterns.length} Intern{selectedInterns.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Intern - {editingIntern?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">Position *</Label>
              <Input
                id="edit-position"
                value={formData.position || ''}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Enter position"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select value={formData.department || ''} onValueChange={(value) => setFormData({...formData, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status || ''} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-progress">Progress (%)</Label>
              <Input
                id="edit-progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rating">Rating (1-5)</Label>
              <Input
                id="edit-rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating || 0}
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supervisor">Supervisor</Label>
              <Input
                id="edit-supervisor"
                value={formData.supervisor || ''}
                onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                placeholder="Enter supervisor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tasks-completed">Tasks Completed</Label>
              <Input
                id="edit-tasks-completed"
                type="number"
                min="0"
                value={formData.tasksCompleted || 0}
                onChange={(e) => setFormData({...formData, tasksCompleted: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-total-tasks">Total Tasks</Label>
              <Input
                id="edit-total-tasks"
                type="number"
                min="1"
                value={formData.totalTasks || 0}
                onChange={(e) => setFormData({...formData, totalTasks: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditIntern}>Update Intern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
