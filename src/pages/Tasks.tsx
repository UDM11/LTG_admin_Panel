import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Upload,
  Star,
  Flag,
  Users,
  Target,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  RefreshCw,
  X,
  Send,
  MessageSquare,
  Paperclip,
  Calendar as CalendarIcon,
  Timer,
  BarChart3,
  PieChart,
  Zap,
  Award,
  Building,
  Mail,
  Phone
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedEmail: string;
  assignedPhone: string;
  assignedBy: string;
  department: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  attachments: string[];
  comments: Comment[];
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  assignedEmail: string;
  assignedPhone: string;
  department: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  estimatedHours: number;
  tags: string[];
  attachments: File[];
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design System Implementation',
    description: 'Create a comprehensive design system for the admin panel with reusable components',
    assignedTo: 'John Doe',
    assignedEmail: 'john.doe@company.com',
    assignedPhone: '+1-555-0123',
    assignedBy: 'Sarah Manager',
    department: 'Design',
    category: 'Development',
    priority: 'high',
    status: 'in-progress',
    progress: 75,
    startDate: '2024-01-10',
    dueDate: '2024-01-25',
    estimatedHours: 40,
    actualHours: 30,
    tags: ['design', 'frontend', 'components'],
    attachments: ['design-specs.pdf', 'mockups.fig'],
    comments: [
      { id: '1', author: 'Sarah Manager', content: 'Great progress so far!', timestamp: '2024-01-15T10:30:00Z' },
      { id: '2', author: 'John Doe', content: 'Working on the final components', timestamp: '2024-01-16T14:20:00Z' }
    ],
    subtasks: [
      { id: '1', title: 'Create button components', completed: true },
      { id: '2', title: 'Design form elements', completed: true },
      { id: '3', title: 'Build navigation components', completed: false }
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '2',
    title: 'API Integration Testing',
    description: 'Comprehensive testing of all API endpoints and error handling',
    assignedTo: 'Jane Smith',
    assignedEmail: 'jane.smith@company.com',
    assignedPhone: '+1-555-0124',
    assignedBy: 'Mike Lead',
    department: 'Engineering',
    category: 'Testing',
    priority: 'medium',
    status: 'review',
    progress: 90,
    startDate: '2024-01-12',
    dueDate: '2024-01-20',
    estimatedHours: 25,
    actualHours: 22,
    tags: ['api', 'testing', 'backend'],
    attachments: ['test-results.xlsx'],
    comments: [],
    subtasks: [
      { id: '1', title: 'Test authentication endpoints', completed: true },
      { id: '2', title: 'Test CRUD operations', completed: true },
      { id: '3', title: 'Document test cases', completed: false }
    ],
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    title: 'Database Optimization',
    description: 'Optimize database queries and improve performance',
    assignedTo: 'Mike Johnson',
    assignedEmail: 'mike.johnson@company.com',
    assignedPhone: '+1-555-0125',
    assignedBy: 'Tech Lead',
    department: 'Engineering',
    category: 'Database',
    priority: 'urgent',
    status: 'todo',
    progress: 0,
    startDate: '2024-01-20',
    dueDate: '2024-01-30',
    estimatedHours: 35,
    actualHours: 0,
    tags: ['database', 'performance', 'optimization'],
    attachments: [],
    comments: [],
    subtasks: [],
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z'
  }
];

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
const CATEGORIES = ['Development', 'Testing', 'Design', 'Research', 'Documentation', 'Database', 'Security'];
const ASSIGNEES = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Alex Brown', 'Emily Davis'];

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'progress' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: '',
    description: '',
    assignedTo: '',
    assignedEmail: '',
    assignedPhone: '',
    department: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 0,
    tags: [],
    attachments: []
  });

  // Modal management
  useEffect(() => {
    const hasModal = showCreateModal || showEditModal || showViewModal || showDeleteModal;
    document.body.style.overflow = hasModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showCreateModal, showEditModal, showViewModal, showDeleteModal]);

  // Advanced filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = [task.title, task.description, task.assignedTo, task.category]
        .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesDepartment = departmentFilter === 'all' || task.department === departmentFilter;
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesCategory;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, departmentFilter, categoryFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
    const avgProgress = tasks.reduce((sum, t) => sum + t.progress, 0) / total || 0;
    const highPriority = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;

    return { total, completed, inProgress, overdue, avgProgress, highPriority };
  }, [tasks]);

  // Event handlers
  const handleCreateTask = useCallback(() => {
    if (!newTask.title || !newTask.assignedTo) return;

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      assignedBy: 'Current User',
      status: 'todo',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      actualHours: 0,
      attachments: newTask.attachments.map(f => f.name),
      comments: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '', description: '', assignedTo: '', assignedEmail: '', assignedPhone: '',
      department: '', category: '', priority: 'medium', dueDate: '', estimatedHours: 0,
      tags: [], attachments: []
    });
    setShowCreateModal(false);
  }, [newTask]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  }, []);

  const handleViewTask = useCallback((task: Task) => {
    setViewingTask(task);
    setShowViewModal(true);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingTask) {
      setTasks(prev => prev.filter(t => t.id !== deletingTask.id));
      setShowDeleteModal(false);
      setDeletingTask(null);
    }
  }, [deletingTask]);

  const handleStatusChange = useCallback((id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            status: newStatus, 
            progress: newStatus === 'completed' ? 100 : task.progress,
            completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          }
        : task
    ));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setCategoryFilter('all');
  }, []);

  // UI Helper functions
  const getStatusIcon = (status: Task['status']) => {
    const icons = {
      'todo': <Clock className="h-4 w-4" />,
      'in-progress': <Activity className="h-4 w-4" />,
      'review': <Eye className="h-4 w-4" />,
      'completed': <CheckCircle className="h-4 w-4" />,
      'cancelled': <XCircle className="h-4 w-4" />
    };
    return icons[status];
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority];
  };

  const isOverdue = (dueDate: string, status: Task['status']) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Task Management System
            </h1>
            <p className="text-muted-foreground">Advanced task tracking and project management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Advanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { title: 'Total Tasks', value: stats.total, icon: FileText, color: 'text-blue-600', trend: '+12%' },
            { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', trend: '+8%' },
            { title: 'In Progress', value: stats.inProgress, icon: Activity, color: 'text-blue-600', trend: '+5%' },
            { title: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', trend: '-2%' },
            { title: 'Avg Progress', value: `${stats.avgProgress.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-600', trend: '+3%' },
            { title: 'High Priority', value: stats.highPriority, icon: Flag, color: 'text-orange-600', trend: '+1%' }
          ].map((stat, index) => (
            <Card key={stat.title} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Advanced Filters and View Controls */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, assignees, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select 
                  value={departmentFilter} 
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                {['dueDate', 'priority', 'progress', 'title'].map(sort => (
                  <Button
                    key={sort}
                    variant={sortBy === sort ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (sortBy === sort) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(sort as any);
                        setSortOrder('asc');
                      }
                    }}
                    className="capitalize text-xs sm:text-sm"
                  >
                    {sort.replace(/([A-Z])/g, ' $1')} {sortBy === sort && (sortOrder === 'desc' ? '↓' : '↑')}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAndSortedTasks.map((task) => (
              <Card key={task.id} className="p-4 sm:p-6 hover:shadow-xl transition-all group">
                <div className="space-y-4">
                  {/* Task Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{task.title}</h3>
                        {isOverdue(task.dueDate, task.status) && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewTask(task)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStatusColor(task.status)} flex items-center gap-1`}>
                        {getStatusIcon(task.status)}
                        {task.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={`${getPriorityColor(task.priority)} text-xs capitalize`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Task Info */}
                    <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{task.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{task.actualHours}h / {task.estimatedHours}h</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    {task.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => handleStatusChange(task.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button size="sm" className="flex-1" onClick={() => handleViewTask(task)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Task</th>
                    <th className="text-left p-4 font-medium">Assignee</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Priority</th>
                    <th className="text-left p-4 font-medium">Progress</th>
                    <th className="text-left p-4 font-medium">Due Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTasks.map((task) => (
                    <tr key={task.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{task.assignedTo}</p>
                          <p className="text-sm text-muted-foreground">{task.department}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(task.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(task.status)}
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getPriorityColor(task.priority)} capitalize w-fit`}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`${isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate, task.status) && (
                            <Badge className="bg-red-100 text-red-800 text-xs ml-2">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewTask(task)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {filteredAndSortedTasks.length === 0 && (
          <Card className="p-12 text-center">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tasks match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first task for the team.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-slate-900 dark:to-slate-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 mb-6 relative">
                <div className="flex items-center space-x-4 pr-12">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Create New Task</h2>
                    <p className="text-blue-100 text-sm">Assign and track new tasks for your team</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowCreateModal(false)} 
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="overflow-y-auto max-h-[70vh] px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Task Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Title *</label>
                        <Input
                          placeholder="Enter task title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                          placeholder="Enter task description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select 
                          value={newTask.category} 
                          onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Information */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-purple-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Assignment</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assign To *</label>
                        <select 
                          value={newTask.assignedTo} 
                          onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select Assignee</option>
                          {ASSIGNEES.map(assignee => (
                            <option key={assignee} value={assignee}>{assignee}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={newTask.assignedEmail}
                          onChange={(e) => setNewTask({...newTask, assignedEmail: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <Input
                          placeholder="Enter phone number"
                          value={newTask.assignedPhone}
                          onChange={(e) => setNewTask({...newTask, assignedPhone: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                        <select 
                          value={newTask.department} 
                          onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority and Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-orange-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Flag className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Priority & Timeline</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority Level</label>
                        <select 
                          value={newTask.priority} 
                          onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date *</label>
                        <Input
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                          className="border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Hours</label>
                        <Input
                          type="number"
                          placeholder="Enter estimated hours"
                          min="0"
                          value={newTask.estimatedHours || ''}
                          onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})}
                          className="border-gray-200 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-green-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Additional Info</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                        <Input
                          placeholder="Enter tags separated by commas"
                          value={newTask.tags.join(', ')}
                          onChange={(e) => setNewTask({...newTask, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                          className="border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                          <input
                            type="file"
                            id="task-attachments"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setNewTask({...newTask, attachments: files});
                            }}
                            className="hidden"
                          />
                          <label htmlFor="task-attachments" className="cursor-pointer">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Files</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Click to select files
                            </p>
                          </label>
                          {newTask.attachments.length > 0 && (
                            <div className="mt-2 text-sm text-green-600">
                              {newTask.attachments.length} file(s) selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/50 -m-6 mt-6 p-6 rounded-b-lg">
                <div className="flex justify-between w-full">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateModal(false)} 
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateTask} 
                      className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Task Modal */}
      {showViewModal && viewingTask && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowViewModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Task Details</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowViewModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{viewingTask.title}</h3>
                    <p className="text-muted-foreground">{viewingTask.description}</p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold">{viewingTask.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${viewingTask.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtasks */}
                  {viewingTask.subtasks.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Subtasks</h4>
                      <div className="space-y-2">
                        {viewingTask.subtasks.map((subtask) => (
                          <div key={subtask.id} className="flex items-center gap-2">
                            <CheckCircle className={`h-4 w-4 ${subtask.completed ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {viewingTask.comments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Comments</h4>
                      <div className="space-y-3">
                        {viewingTask.comments.map((comment) => (
                          <div key={comment.id} className="bg-muted p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge className={`${getStatusColor(viewingTask.status)} flex items-center gap-1 w-fit mt-1`}>
                        {getStatusIcon(viewingTask.status)}
                        {viewingTask.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Priority</label>
                      <Badge className={`${getPriorityColor(viewingTask.priority)} capitalize w-fit mt-1`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {viewingTask.priority}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                      <p className="font-medium">{viewingTask.assignedTo}</p>
                      <p className="text-sm text-muted-foreground">{viewingTask.assignedEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="font-medium">{viewingTask.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                      <p className={`font-medium ${isOverdue(viewingTask.dueDate, viewingTask.status) ? 'text-red-600' : ''}`}>
                        {new Date(viewingTask.dueDate).toLocaleDateString()}
                        {isOverdue(viewingTask.dueDate, viewingTask.status) && (
                          <Badge className="bg-red-100 text-red-800 text-xs ml-2">
                            Overdue
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Time Tracking</label>
                      <p className="font-medium">{viewingTask.actualHours}h / {viewingTask.estimatedHours}h</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {viewingTask.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {viewingTask.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {viewingTask.attachments.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Attachments</label>
                      <div className="space-y-2 mt-2">
                        {viewingTask.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-4 w-4" />
                            <span>{attachment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <Button onClick={() => handleEditTask(viewingTask)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
                <Button variant="outline" onClick={() => setShowViewModal(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTask && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Delete Task</h3>
                  <p className="text-muted-foreground">
                    Are you sure you want to delete "<strong>{deletingTask.title}</strong>"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingTask(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmDelete}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}