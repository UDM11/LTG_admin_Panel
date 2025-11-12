import { useState, useEffect, useMemo, useCallback } from 'react';
import { taskService, Task, Comment, SubTask } from '@/services/backendless';
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



const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
const CATEGORIES = ['Development', 'Testing', 'Design', 'Research', 'Documentation', 'Database', 'Security'];
const ASSIGNEES = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Alex Brown', 'Emily Davis'];

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);

  
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

  // Load tasks from Backendless
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await taskService.getAllTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Modal management
  useEffect(() => {
    const hasModal = showCreateModal || showEditModal || showViewModal || showDeleteModal || showBulkActions || showUpdateConfirmModal;
    document.body.style.overflow = hasModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showCreateModal, showEditModal, showViewModal, showDeleteModal, showBulkActions, showUpdateConfirmModal]);

  // Auto-hide bulk actions when no tasks selected
  useEffect(() => {
    if (selectedTasks.length === 0) {
      setShowBulkActions(false);
    }
  }, [selectedTasks]);

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
  const handleCreateTask = useCallback(async () => {
    if (!newTask.title || !newTask.assignedTo) return;

    try {
      setIsCreating(true);
      const task = {
        ...newTask,
        assignedBy: 'Current User',
        status: 'todo' as const,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        actualHours: 0,
        attachmentUrls: [],
        comments: [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedTask = await taskService.createTask(task, newTask.attachments);
      setTasks(prev => [...prev, savedTask]);
      setNewTask({
        title: '', description: '', assignedTo: '', assignedEmail: '', assignedPhone: '',
        department: '', category: '', priority: 'medium', dueDate: '', estimatedHours: 0,
        tags: [], attachments: []
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreating(false);
    }
  }, [newTask]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  }, []);

  const handleUpdateTask = useCallback(() => {
    setShowUpdateConfirmModal(true);
  }, []);

  const confirmUpdateTask = useCallback(async () => {
    if (!editingTask) return;
    
    try {
      const updatedTask = { ...editingTask, updatedAt: new Date().toISOString() };
      await taskService.updateTask(updatedTask);
      setTasks(prev => prev.map(task => 
        task.objectId === editingTask.objectId ? updatedTask : task
      ));
      setShowEditModal(false);
      setEditingTask(null);
      setShowUpdateConfirmModal(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [editingTask]);

  const handleViewTask = useCallback((task: Task) => {
    setViewingTask(task);
    setShowViewModal(true);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deletingTask && deletingTask.objectId) {
      try {
        await taskService.deleteTask(deletingTask.objectId);
        setTasks(prev => prev.filter(t => t.objectId !== deletingTask.objectId));
        setSelectedTasks(prev => prev.filter(id => id !== deletingTask.objectId));
        setShowDeleteModal(false);
        setDeletingTask(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  }, [deletingTask]);

  // Bulk Actions
  const handleSelectTask = useCallback((taskId: string, selected: boolean) => {
    setSelectedTasks(prev => 
      selected 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allTaskIds = filteredAndSortedTasks.map(t => t.objectId!);
    setSelectedTasks(prev => 
      prev.length === allTaskIds.length ? [] : allTaskIds
    );
  }, [filteredAndSortedTasks]);

  const handleBulkStatusChange = useCallback(async (newStatus: Task['status']) => {
    setIsBulkLoading(true);
    try {
      const tasksToUpdate = tasks.filter(task => selectedTasks.includes(task.objectId!));
      const updatePromises = tasksToUpdate.map(task => {
        const updatedTask = {
          ...task,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : task.progress,
          completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString()
        };
        return taskService.updateTask(updatedTask);
      });
      
      await Promise.all(updatePromises);
      setTasks(prev => prev.map(task => 
        selectedTasks.includes(task.objectId!)
          ? { 
              ...task, 
              status: newStatus,
              progress: newStatus === 'completed' ? 100 : task.progress,
              completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString()
            }
          : task
      ));
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to update tasks:', error);
    } finally {
      setIsBulkLoading(false);
    }
  }, [selectedTasks, tasks]);

  const handleBulkDelete = useCallback(async () => {
    setIsBulkLoading(true);
    try {
      await Promise.all(selectedTasks.map(id => taskService.deleteTask(id)));
      setTasks(prev => prev.filter(t => !selectedTasks.includes(t.objectId!)));
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    } finally {
      setIsBulkLoading(false);
    }
  }, [selectedTasks]);

  const handleBulkAssign = useCallback(async (assignee: string) => {
    setIsBulkLoading(true);
    try {
      const tasksToUpdate = tasks.filter(task => selectedTasks.includes(task.objectId!));
      const updatePromises = tasksToUpdate.map(task => {
        const updatedTask = { ...task, assignedTo: assignee, updatedAt: new Date().toISOString() };
        return taskService.updateTask(updatedTask);
      });
      
      await Promise.all(updatePromises);
      setTasks(prev => prev.map(task => 
        selectedTasks.includes(task.objectId!)
          ? { ...task, assignedTo: assignee, updatedAt: new Date().toISOString() }
          : task
      ));
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to reassign tasks:', error);
    } finally {
      setIsBulkLoading(false);
    }
  }, [selectedTasks, tasks]);

  const handleStatusChange = useCallback(async (objectId: string, newStatus: Task['status']) => {
    try {
      const task = tasks.find(t => t.objectId === objectId);
      if (task) {
        const updatedTask = {
          ...task,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : task.progress,
          completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString()
        };
        await taskService.updateTask(updatedTask);
        setTasks(prev => prev.map(t => 
          t.objectId === objectId ? updatedTask : t
        ));
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [tasks]);

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
      <div className="space-y-4 sm:space-y-6">
        {/* Enhanced Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Task Management System</span>
              <span className="sm:hidden">Tasks</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              <span className="hidden sm:inline">Advanced task tracking and project management</span>
              <span className="sm:hidden">Track and manage tasks</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">↻</span>
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Task</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Advanced Stats Dashboard - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { title: 'Total Tasks', shortTitle: 'Total', value: stats.total, icon: FileText, color: 'text-blue-600', trend: '+12%' },
            { title: 'Completed', shortTitle: 'Done', value: stats.completed, icon: CheckCircle, color: 'text-green-600', trend: '+8%' },
            { title: 'In Progress', shortTitle: 'Active', value: stats.inProgress, icon: Activity, color: 'text-blue-600', trend: '+5%' },
            { title: 'Overdue', shortTitle: 'Late', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', trend: '-2%' },
            { title: 'Avg Progress', shortTitle: 'Avg %', value: `${stats.avgProgress.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-600', trend: '+3%' },
            { title: 'High Priority', shortTitle: 'High Pri', value: stats.highPriority, icon: Flag, color: 'text-orange-600', trend: '+1%' }
          ].map((stat, index) => (
            <Card key={stat.title} className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    <span className="hidden sm:inline">{stat.title}</span>
                    <span className="sm:hidden">{stat.shortTitle}</span>
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-0.5 sm:mt-1 hidden sm:block">{stat.trend}</p>
                </div>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} flex-shrink-0`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Advanced Filters and View Controls */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, assignees, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 sm:h-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2 sm:px-3 py-2 border border-border rounded-md text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 h-9 sm:h-10"
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
                  className="px-2 sm:px-3 py-2 border border-border rounded-md text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 h-9 sm:h-10"
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
                  className="px-2 sm:px-3 py-2 border border-border rounded-md text-xs sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 h-9 sm:h-10"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={clearFilters} className="h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
                {selectedTasks.length > 0 && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setShowBulkActions(true)}
                    className="h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3 bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Bulk Actions ({selectedTasks.length})</span>
                    <span className="sm:hidden">Actions ({selectedTasks.length})</span>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center w-full sm:w-auto">
                <span className="text-sm text-muted-foreground hidden md:inline">Sort by:</span>
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
                    className="capitalize text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">{sort.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="sm:hidden">
                      {sort === 'dueDate' ? 'Due' : 
                       sort === 'priority' ? 'Pri' : 
                       sort === 'progress' ? 'Prog' : 'Title'}
                    </span>
                    {sortBy === sort && (
                      <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 w-full sm:w-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1 sm:flex-none h-7 sm:h-8 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1">
                    <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                      <div className="bg-current w-1 h-1 rounded-sm" />
                      <div className="bg-current w-1 h-1 rounded-sm" />
                      <div className="bg-current w-1 h-1 rounded-sm" />
                      <div className="bg-current w-1 h-1 rounded-sm" />
                    </div>
                    <span className="hidden sm:inline">Grid</span>
                  </div>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 sm:flex-none h-7 sm:h-8 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1">
                    <div className="flex flex-col gap-0.5 w-3 h-3">
                      <div className="bg-current w-3 h-0.5 rounded-sm" />
                      <div className="bg-current w-3 h-0.5 rounded-sm" />
                      <div className="bg-current w-3 h-0.5 rounded-sm" />
                    </div>
                    <span className="hidden sm:inline">List</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks Grid/List View */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedTasks.map((task) => (
              <Card key={task.objectId} className="group relative overflow-hidden border-l-4 border-l-transparent">
                <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                  {/* Task Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 leading-tight">{task.title}</h3>
                        {isOverdue(task.dueDate, task.status) && (
                          <Badge className="bg-red-100 text-red-800 text-xs flex-shrink-0">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Overdue</span>
                            <span className="sm:hidden">!</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleViewTask(task)}>
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleEditTask(task)}>
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleDeleteTask(task)}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={`${getStatusColor(task.status)} flex items-center gap-1 text-xs`}>
                        {getStatusIcon(task.status)}
                        <span className="hidden sm:inline">{task.status.replace('-', ' ')}</span>
                        <span className="sm:hidden">{task.status.charAt(0).toUpperCase()}</span>
                      </Badge>
                      <Badge className={`${getPriorityColor(task.priority)} text-xs capitalize flex items-center gap-1`}>
                        <Flag className="h-3 w-3" />
                        <span className="hidden sm:inline">{task.priority}</span>
                        <span className="sm:hidden">{task.priority.charAt(0).toUpperCase()}</span>
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Task Info - Responsive Grid */}
                    <div className="grid grid-cols-1 gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate font-medium">{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{task.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          <span className="hidden sm:inline">Due: </span>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: window.innerWidth > 640 ? 'numeric' : '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Timer className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{task.actualHours}h / {task.estimatedHours}h</span>
                      </div>
                    </div>

                    {/* Tags - Responsive */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, window.innerWidth > 640 ? 3 : 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > (window.innerWidth > 640 ? 3 : 2) && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            +{task.tags.length - (window.innerWidth > 640 ? 3 : 2)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions - Responsive */}
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 pt-2">
                    {task.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs sm:text-sm h-7 sm:h-8" 
                        onClick={() => handleStatusChange(task.objectId!, 'completed')}
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Complete</span>
                        <span className="sm:hidden">Done</span>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs sm:text-sm h-7 sm:h-8" 
                      onClick={() => handleViewTask(task)}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </div>

                  {/* Mobile-only status indicator */}
                  <div className="sm:hidden absolute top-2 right-2">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-blue-500' :
                      task.status === 'review' ? 'bg-yellow-500' :
                      task.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // List View - Responsive
          <div className="space-y-3">
            {/* Desktop Table View */}
            <Card className="hidden lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 xl:p-4 font-medium text-sm">Task</th>
                      <th className="text-left p-3 xl:p-4 font-medium text-sm">Assignee</th>
                      <th className="text-left p-3 xl:p-4 font-medium text-sm">Status</th>
                      <th className="text-left p-3 xl:p-4 font-medium text-sm">Priority</th>
                      <th className="text-left p-3 xl:p-4 font-medium text-sm">Progress</th>
                      <th className="text-left p-3 xl:p-4 font-medium text-sm">Due Date</th>
                      <th className="text-left p-3 xl:p-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTasks.map((task) => (
                      <tr key={task.objectId} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3 xl:p-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-sm xl:text-base line-clamp-1">{task.title}</p>
                            <p className="text-xs xl:text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                          </div>
                        </td>
                        <td className="p-3 xl:p-4">
                          <div>
                            <p className="font-medium text-sm xl:text-base">{task.assignedTo}</p>
                            <p className="text-xs xl:text-sm text-muted-foreground">{task.department}</p>
                          </div>
                        </td>
                        <td className="p-3 xl:p-4">
                          <Badge className={`${getStatusColor(task.status)} flex items-center gap-1 w-fit text-xs`}>
                            {getStatusIcon(task.status)}
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3 xl:p-4">
                          <Badge className={`${getPriorityColor(task.priority)} capitalize w-fit text-xs`}>
                            <Flag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="p-3 xl:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 xl:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 xl:h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300" 
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-xs xl:text-sm font-medium min-w-[2.5rem]">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3 xl:p-4">
                          <div className={`text-sm ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''}`}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: '2-digit' 
                            })}
                            {isOverdue(task.dueDate, task.status) && (
                              <Badge className="bg-red-100 text-red-800 text-xs ml-2">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 xl:p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 xl:h-8 xl:w-8" onClick={() => handleViewTask(task)}>
                              <Eye className="h-3 w-3 xl:h-4 xl:w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 xl:h-8 xl:w-8" onClick={() => handleEditTask(task)}>
                              <Edit className="h-3 w-3 xl:h-4 xl:w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 xl:h-8 xl:w-8" onClick={() => handleDeleteTask(task)}>
                              <Trash2 className="h-3 w-3 xl:h-4 xl:w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile/Tablet Card List View */}
            <div className="lg:hidden space-y-3">
              {filteredAndSortedTasks.map((task) => (
                <Card key={task.objectId} className="p-4 hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base line-clamp-1">{task.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewTask(task)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTask(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTask(task)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(task.status)} flex items-center gap-1 text-xs`}>
                          {getStatusIcon(task.status)}
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(task.priority)} capitalize text-xs`}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </div>
                      {isOverdue(task.dueDate, task.status) && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Assignee:</span>
                        <p className="font-medium">{task.assignedTo}</p>
                        <p className="text-xs text-muted-foreground">{task.department}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <p className={`font-medium ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 4).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{task.tags.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {task.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => handleStatusChange(task.objectId!, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        onClick={() => handleViewTask(task)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
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

              <div className="bg-gray-50 dark:bg-slate-800/50 p-6 border-t">
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask}
                    disabled={isCreating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Task
                      </>
                    )}
                  </Button>
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
                  {viewingTask.subtasks && viewingTask.subtasks.length > 0 && (
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
                  {viewingTask.comments && viewingTask.comments.length > 0 && (
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
                  {viewingTask.tags && viewingTask.tags.length > 0 && (
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
                  {viewingTask.attachmentUrls && viewingTask.attachmentUrls.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Attachments</label>
                      <div className="space-y-2 mt-2">
                        {viewingTask.attachmentUrls.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                            <div className="flex items-center gap-2 text-sm">
                              <Paperclip className="h-4 w-4" />
                              <span>Attachment {index + 1}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(url, '_blank')}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `task_attachment_${index + 1}`;
                                  link.click();
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
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

      {/* Advanced Edit Task Modal */}
      {showEditModal && editingTask && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-slate-900 dark:to-slate-800 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 mb-6 relative">
                <div className="flex items-center space-x-4 pr-12">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Edit className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Edit Task</h2>
                    <p className="text-orange-100 text-sm">Update task details and track progress</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowEditModal(false)} 
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="overflow-y-auto max-h-[70vh] px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Task Information */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-orange-100 dark:border-slate-700">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Task Details</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
                          <Input
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                            className="text-lg font-semibold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <textarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[120px]"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select 
                              value={editingTask.category} 
                              onChange={(e) => setEditingTask({...editingTask, category: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                            <select 
                              value={editingTask.department} 
                              onChange={(e) => setEditingTask({...editingTask, department: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assignment & Timeline */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-red-100 dark:border-slate-700">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Assignment & Timeline</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To</label>
                          <select 
                            value={editingTask.assignedTo} 
                            onChange={(e) => setEditingTask({...editingTask, assignedTo: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            {ASSIGNEES.map(assignee => (
                              <option key={assignee} value={assignee}>{assignee}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                          <Input
                            type="email"
                            value={editingTask.assignedEmail}
                            onChange={(e) => setEditingTask({...editingTask, assignedEmail: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                          <Input
                            type="date"
                            value={editingTask.dueDate}
                            onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Hours</label>
                          <Input
                            type="number"
                            min="0"
                            value={editingTask.estimatedHours}
                            onChange={(e) => setEditingTask({...editingTask, estimatedHours: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Progress */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-purple-100 dark:border-slate-700">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Status & Progress</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                          <select 
                            value={editingTask.status} 
                            onChange={(e) => setEditingTask({...editingTask, status: e.target.value as Task['status']})}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                          <select 
                            value={editingTask.priority} 
                            onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as Task['priority']})}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 capitalize"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress ({editingTask.progress}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={editingTask.progress}
                            onChange={(e) => setEditingTask({...editingTask, progress: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                              style={{ width: `${editingTask.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Actual Hours</label>
                          <Input
                            type="number"
                            min="0"
                            value={editingTask.actualHours}
                            onChange={(e) => setEditingTask({...editingTask, actualHours: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-green-100 dark:border-slate-700">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Flag className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tags</h3>
                      </div>
                      <Input
                        placeholder="Enter tags separated by commas"
                        value={editingTask.tags ? editingTask.tags.join(', ') : ''}
                        onChange={(e) => setEditingTask({...editingTask, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                      />
                      <div className="flex flex-wrap gap-1 mt-3">
                        {editingTask.tags && editingTask.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/50 p-6 border-t">
                <div className="flex justify-between w-full">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date(editingTask.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdateTask}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Task
                    </Button>
                  </div>
                </div>
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

      {/* Update Confirmation Modal */}
      {showUpdateConfirmModal && editingTask && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Edit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Update Task</h3>
                  <p className="text-muted-foreground">
                    Are you sure you want to update "<strong>{editingTask.title}</strong>"? All changes will be saved.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpdateConfirmModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmUpdateTask}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Update Task
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && selectedTasks.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowBulkActions(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-2xl">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Bulk Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Change Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { status: 'todo', label: 'To Do', color: 'bg-gray-100 hover:bg-gray-200' },
                        { status: 'in-progress', label: 'In Progress', color: 'bg-blue-100 hover:bg-blue-200' },
                        { status: 'review', label: 'Review', color: 'bg-yellow-100 hover:bg-yellow-200' },
                        { status: 'completed', label: 'Completed', color: 'bg-green-100 hover:bg-green-200' }
                      ].map(({ status, label, color }) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkStatusChange(status as Task['status'])}
                          className={`${color} text-xs`}
                          disabled={isBulkLoading}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Reassign To</label>
                    <select 
                      onChange={(e) => e.target.value && handleBulkAssign(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={isBulkLoading}
                    >
                      <option value="">Select Assignee</option>
                      {ASSIGNEES.map(assignee => (
                        <option key={assignee} value={assignee}>{assignee}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="w-full"
                      disabled={isBulkLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected Tasks
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBulkActions(false)}
                    className="flex-1"
                    disabled={isBulkLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setSelectedTasks([])}
                    className="flex-1"
                    disabled={isBulkLoading}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              {isBulkLoading && (
                <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}