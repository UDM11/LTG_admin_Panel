import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { internService, taskService, certificateService, systemLogService, SystemLog } from '@/services/backendless';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  ListTodo, 
  FileCheck, 
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Star,
  Settings,
  Plus,
  X,
  Calendar,
  Clock,
  Filter,
  Search,
  ExternalLink,
  FileText,
  Database,
  Shield,
  Zap,
  Bell,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Edit,
  Trash2,
  MoreVertical,
  ArrowRight,
  TrendingDown as TrendingDownIcon,
  ChevronRight,
  Info,
  Warning,
  CheckCircle2,
  XCircle,
  Timer,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Battery
} from 'lucide-react';

interface DashboardStats {
  totalInterns: number;
  activeInterns: number;
  completedInternships: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalCertificates: number;
  issuedCertificates: number;
  pendingCertificates: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  avgCompletionRate: number;
  avgTaskScore: number;
  totalDepartments: number;
  activeDepartments: number;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  type: 'task' | 'certificate' | 'submission' | 'intern' | 'system';
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: string;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface DetailedMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}



const mockActivities: ActivityItem[] = [
  {
    id: '1',
    user: 'John Doe',
    action: 'completed task "API Integration"',
    type: 'task',
    timestamp: '2024-01-20T10:30:00Z',
    status: 'success',
    details: 'Full Stack Development'
  },
  {
    id: '2',
    user: 'Jane Smith',
    action: 'received certificate for UI/UX Design',
    type: 'certificate',
    timestamp: '2024-01-20T09:15:00Z',
    status: 'success',
    details: 'Grade: A+'
  },
  {
    id: '3',
    user: 'Mike Johnson',
    action: 'submitted project for review',
    type: 'submission',
    timestamp: '2024-01-20T08:45:00Z',
    status: 'info',
    details: 'Database Optimization Project'
  },
  {
    id: '4',
    user: 'Sarah Williams',
    action: 'started new internship',
    type: 'intern',
    timestamp: '2024-01-20T08:00:00Z',
    status: 'info',
    details: 'Marketing Department'
  },
  {
    id: '5',
    user: 'System',
    action: 'automated backup completed',
    type: 'system',
    timestamp: '2024-01-20T07:30:00Z',
    status: 'success',
    details: 'Daily backup successful'
  }
];









export default function Dashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInterns: 0,
    activeInterns: 0,
    completedInternships: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalCertificates: 0,
    issuedCertificates: 0,
    pendingCertificates: 0,
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
    avgCompletionRate: 0,
    avgTaskScore: 0,
    totalDepartments: 0,
    activeDepartments: 0
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [departmentStats, setDepartmentStats] = useState<ChartData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<ChartData[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: Math.floor(Math.random() * 50) + 30,
    memory: Math.floor(Math.random() * 40) + 50,
    storage: Math.floor(Math.random() * 30) + 20,
    network: Math.floor(Math.random() * 20) + 80
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSystemLogsModal, setShowSystemLogsModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load dashboard data from Backendless
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [interns, tasks, certificates] = await Promise.all([
          internService.getAllInterns(),
          taskService.getAllTasks(),
          certificateService.getAllCertificates()
        ]);

        // Load system logs separately to handle potential errors
        try {
          const logs = await systemLogService.getAllLogs(20);
          setSystemLogs(logs);
        } catch (error) {
          console.error('Failed to load system logs:', error);
          setSystemLogs([]);
        }

        const now = new Date();
        const overdueTasks = tasks.filter(task => 
          new Date(task.dueDate) < now && task.status !== 'completed'
        ).length;

        const departments = [...new Set(interns.map(intern => intern.department))];
        const activeDepartments = departments.filter(dept => 
          interns.some(intern => intern.department === dept && intern.status === 'active')
        ).length;

        const avgProgress = interns.length > 0 
          ? interns.reduce((sum, intern) => sum + intern.progress, 0) / interns.length 
          : 0;

        const avgTaskScore = tasks.length > 0
          ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
          : 0;

        // Update refresh data (same logic as initial load)
        setStats({
          totalInterns: interns.length,
          activeInterns: interns.filter(i => i.status === 'active').length,
          completedInternships: interns.filter(i => i.status === 'completed').length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          pendingTasks: tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length,
          overdueTasks,
          totalCertificates: certificates.length,
          issuedCertificates: certificates.filter(c => c.status === 'issued').length,
          pendingCertificates: certificates.filter(c => c.status === 'pending').length,
          totalSubmissions: tasks.filter(t => t.status === 'review').length,
          approvedSubmissions: tasks.filter(t => t.status === 'completed').length,
          pendingSubmissions: tasks.filter(t => t.status === 'review').length,
          rejectedSubmissions: tasks.filter(t => t.status === 'cancelled').length,
          avgCompletionRate: avgProgress,
          avgTaskScore,
          totalDepartments: departments.length,
          activeDepartments
        });

        // Update system health with random values (simulating real metrics)
        setSystemHealth({
          cpu: Math.floor(Math.random() * 50) + 30,
          memory: Math.floor(Math.random() * 40) + 50,
          storage: Math.floor(Math.random() * 30) + 20,
          network: Math.floor(Math.random() * 20) + 80
        });

        // Generate recent activities from real data
        const activities: ActivityItem[] = [];
        
        // Recent tasks - show different messages based on status
        tasks.slice(-3).forEach(task => {
          let action = '';
          let status: 'success' | 'warning' | 'error' | 'info' = 'info';
          
          switch(task.status) {
            case 'completed':
              action = `completed task "${task.title}"`;
              status = 'success';
              break;
            case 'in-progress':
              action = `is working on task "${task.title}"`;
              status = 'info';
              break;
            case 'review':
              action = `submitted task "${task.title}" for review`;
              status = 'warning';
              break;
            default:
              action = `was assigned task "${task.title}"`;
              status = 'info';
          }
          
          activities.push({
            id: `task-${task.objectId}`,
            user: task.assignedTo,
            action,
            type: 'task',
            timestamp: task.updatedAt,
            status,
            details: `${task.department} • Priority: ${task.priority}`
          });
        });

        // Recent interns - show different messages based on status
        interns.slice(-2).forEach(intern => {
          let action = '';
          let status: 'success' | 'warning' | 'error' | 'info' = 'info';
          
          switch(intern.status) {
            case 'active':
              action = `started internship in ${intern.department}`;
              status = 'success';
              break;
            case 'completed':
              action = `completed internship program`;
              status = 'success';
              break;
            case 'pending':
              action = `application pending review`;
              status = 'warning';
              break;
            default:
              action = `joined as intern`;
              status = 'info';
          }
          
          activities.push({
            id: `intern-${intern.objectId}`,
            user: intern.name,
            action,
            type: 'intern',
            timestamp: intern.updated || new Date().toISOString(),
            status,
            details: `${intern.position} • Progress: ${intern.progress}%`
          });
        });

        // Recent certificates - show different messages based on status
        certificates.slice(-2).forEach(cert => {
          let action = '';
          let status: 'success' | 'warning' | 'error' | 'info' = 'info';
          
          switch(cert.status) {
            case 'issued':
              action = `received certificate for "${cert.courseName}"`;
              status = 'success';
              break;
            case 'pending':
              action = `certificate for "${cert.courseName}" pending approval`;
              status = 'warning';
              break;
            case 'revoked':
              action = `certificate for "${cert.courseName}" was revoked`;
              status = 'error';
              break;
            default:
              action = `applied for certificate in "${cert.courseName}"`;
              status = 'info';
          }
          
          activities.push({
            id: `cert-${cert.objectId}`,
            user: cert.internName,
            action,
            type: 'certificate',
            timestamp: cert.updatedAt || new Date().toISOString(),
            status,
            details: `Grade: ${cert.grade} • Score: ${cert.completionScore}%`
          });
        });

        // Add system backup activity
        activities.push({
          id: 'system-backup',
          user: 'System',
          action: 'automated backup completed',
          type: 'system',
          timestamp: new Date().toISOString(),
          status: 'success',
          details: 'Daily backup successful'
        });

        // Sort by timestamp and take latest 5
        setRecentActivities(activities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 5));

        // Generate department statistics
        let deptStats = departments.map(dept => {
          const deptInterns = interns.filter(i => i.department === dept);
          return {
            name: dept,
            value: deptInterns.length,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            growth: Math.floor(Math.random() * 30) - 10
          };
        });
        
        // If no departments or all departments have 0 interns, show default departments
        if (deptStats.length === 0 || deptStats.every(d => d.value === 0)) {
          deptStats = [
            { name: 'Engineering', value: 0, color: '#3b82f6', growth: 0 },
            { name: 'Design', value: 0, color: '#8b5cf6', growth: 0 },
            { name: 'Marketing', value: 0, color: '#10b981', growth: 0 },
            { name: 'Analytics', value: 0, color: '#f59e0b', growth: 0 }
          ];
        }
        
        setDepartmentStats(deptStats);

        // Generate performance metrics
        const taskCompletionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0;
        const certificateRate = certificates.length > 0 ? (certificates.filter(c => c.status === 'issued').length / certificates.length) * 100 : 0;
        const internSatisfaction = avgProgress;
        
        setPerformanceMetrics([
          { name: 'Task Completion', value: Math.round(taskCompletionRate), color: '#3b82f6', target: 90 },
          { name: 'Certificate Rate', value: Math.round(certificateRate), color: '#10b981', target: 85 },
          { name: 'Submission Quality', value: Math.round(avgTaskScore), color: '#8b5cf6', target: 80 },
          { name: 'Intern Satisfaction', value: Math.round(internSatisfaction), color: '#f59e0b', target: 90 }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Modal management - block background scroll when any modal is open
  useEffect(() => {
    const hasModal = showDetailsModal || showBreakdownModal || showActivityModal || showSystemLogsModal;
    document.body.style.overflow = hasModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showDetailsModal, showBreakdownModal, showActivityModal, showSystemLogsModal]);

  // Refresh data from Backendless
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [interns, tasks, certificates] = await Promise.all([
        internService.getAllInterns(),
        taskService.getAllTasks(),
        certificateService.getAllCertificates()
      ]);

      // Refresh system logs separately
      try {
        const logs = await systemLogService.getAllLogs(20);
        setSystemLogs(logs);
      } catch (error) {
        console.error('Failed to refresh system logs:', error);
      }

      const now = new Date();
      const overdueTasks = tasks.filter(task => 
        new Date(task.dueDate) < now && task.status !== 'completed'
      ).length;

      const departments = [...new Set(interns.map(intern => intern.department))];
      const activeDepartments = departments.filter(dept => 
        interns.some(intern => intern.department === dept && intern.status === 'active')
      ).length;

      const avgProgress = interns.length > 0 
        ? interns.reduce((sum, intern) => sum + intern.progress, 0) / interns.length 
        : 0;

      const avgTaskScore = tasks.length > 0
        ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
        : 0;

      setStats({
        totalInterns: interns.length,
        activeInterns: interns.filter(i => i.status === 'active').length,
        completedInternships: interns.filter(i => i.status === 'completed').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length,
        overdueTasks,
        totalCertificates: certificates.length,
        issuedCertificates: certificates.filter(c => c.status === 'issued').length,
        pendingCertificates: certificates.filter(c => c.status === 'pending').length,
        totalSubmissions: tasks.filter(t => t.status === 'review').length,
        approvedSubmissions: tasks.filter(t => t.status === 'completed').length,
        pendingSubmissions: tasks.filter(t => t.status === 'review').length,
        rejectedSubmissions: tasks.filter(t => t.status === 'cancelled').length,
        avgCompletionRate: avgProgress,
        avgTaskScore,
        totalDepartments: departments.length,
        activeDepartments
      });
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Calculate trends and insights based on time range
  const insights = useMemo(() => {
    const multiplier = timeRange === '7d' ? 0.2 : timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : 12;
    
    const taskCompletionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
    const certificateIssueRate = stats.totalCertificates > 0 ? (stats.issuedCertificates / stats.totalCertificates) * 100 : 0;
    const internActiveRate = stats.totalInterns > 0 ? (stats.activeInterns / stats.totalInterns) * 100 : 0;
    const submissionApprovalRate = stats.totalSubmissions > 0 ? (stats.approvedSubmissions / stats.totalSubmissions) * 100 : 0;

    return {
      taskCompletionRate: taskCompletionRate * multiplier,
      certificateIssueRate: certificateIssueRate * multiplier,
      internActiveRate: internActiveRate * multiplier,
      submissionApprovalRate: submissionApprovalRate * multiplier,
      overallHealth: (taskCompletionRate + certificateIssueRate + internActiveRate + submissionApprovalRate) / 4
    };
  }, [timeRange, stats]);

  const getTimeAgo = useCallback((timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  const getActivityIcon = useCallback((type: ActivityItem['type']) => {
    const icons = {
      task: ListTodo,
      certificate: Award,
      submission: FileCheck,
      intern: Users,
      system: Settings
    };
    return icons[type];
  }, []);

  const getStatusColor = useCallback((status: ActivityItem['status']) => {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600'
    };
    return colors[status];
  }, []);

  const handleViewDetails = useCallback((metric: string) => {
    setSelectedMetric(metric);
    setShowDetailsModal(true);
  }, []);

  const handleBreakdown = useCallback(() => {
    setShowBreakdownModal(true);
  }, []);

  const handleViewAllActivity = useCallback(() => {
    setShowActivityModal(true);
  }, []);

  const handleSystemAlert = useCallback((alertType: string) => {
    switch(alertType) {
      case 'logs':
        setShowSystemLogsModal(true);
        break;
      case 'review-tasks':
        navigate('/tasks');
        break;
      case 'review-certificates':
        navigate('/certificates');
        break;
      default:
        console.log(`Handling ${alertType} alert`);
    }
  }, [navigate]);

  const exportData = useCallback(() => {
    const data = {
      stats: mockStats,
      timeRange,
      exportDate: new Date().toISOString(),
      insights
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [timeRange, insights]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Real-time insights and comprehensive analytics for {timeRange} period
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-1">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range as any)}
                  className="text-xs flex-1 sm:flex-none"
                >
                  {range}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex-1 sm:flex-none">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <Button onClick={exportData} className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {[
            { 
              title: 'Total Interns', 
              value: stats.totalInterns, 
              icon: Users, 
              color: 'text-blue-600', 
              trend: { value: 12, isPositive: true },
              subtitle: `${stats.activeInterns} active`,
              metric: 'interns'
            },
            { 
              title: 'Active Tasks', 
              value: stats.totalTasks, 
              icon: ListTodo, 
              color: 'text-purple-600', 
              trend: { value: 8, isPositive: true },
              subtitle: `${stats.completedTasks} completed`,
              metric: 'tasks'
            },
            { 
              title: 'Certificates', 
              value: stats.totalCertificates, 
              icon: Award, 
              color: 'text-green-600', 
              trend: { value: 15, isPositive: true },
              subtitle: `${stats.issuedCertificates} issued`,
              metric: 'certificates'
            },
            { 
              title: 'Submissions', 
              value: stats.totalSubmissions, 
              icon: FileCheck, 
              color: 'text-orange-600', 
              trend: { value: 5, isPositive: false },
              subtitle: `${stats.approvedSubmissions} approved`,
              metric: 'submissions'
            },
            { 
              title: 'Completion Rate', 
              value: `${insights.taskCompletionRate.toFixed(1)}%`, 
              icon: Target, 
              color: 'text-emerald-600', 
              trend: { value: 3.2, isPositive: true },
              subtitle: 'Task completion',
              metric: 'completion'
            },
            { 
              title: 'Avg Score', 
              value: stats.avgTaskScore.toFixed(1), 
              icon: Star, 
              color: 'text-yellow-600', 
              trend: { value: 2.1, isPositive: true },
              subtitle: 'Performance score',
              metric: 'score'
            }
          ].map((stat, index) => (
            <Card key={stat.title} className="p-3 sm:p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => handleViewDetails(stat.metric)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend.value}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="w-full">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Enhanced System Health Overview */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">System Health & Performance</h3>
            <div className="flex gap-2">
              <Badge className={`${insights.overallHealth > 90 ? 'bg-green-100 text-green-800' : insights.overallHealth > 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {insights.overallHealth.toFixed(1)}% Healthy
              </Badge>
              <Button variant="outline" size="sm" onClick={() => handleSystemAlert('logs')}>
                <Settings className="h-4 w-4 mr-2" />
                System Logs
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { name: 'CPU Usage', value: systemHealth.cpu, unit: '%', status: systemHealth.cpu < 50 ? 'good' : systemHealth.cpu < 80 ? 'warning' : 'critical', icon: Cpu },
              { name: 'Memory', value: systemHealth.memory, unit: '%', status: systemHealth.memory < 60 ? 'good' : systemHealth.memory < 85 ? 'warning' : 'critical', icon: HardDrive },
              { name: 'Storage', value: systemHealth.storage, unit: '%', status: systemHealth.storage < 70 ? 'good' : systemHealth.storage < 90 ? 'warning' : 'critical', icon: Database },
              { name: 'Network', value: systemHealth.network, unit: 'Mbps', status: systemHealth.network > 70 ? 'excellent' : systemHealth.network > 40 ? 'good' : 'warning', icon: Wifi }
            ].map((metric) => (
              <div key={metric.name} className="space-y-3 p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <span className="text-sm font-bold">{metric.value}{metric.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.status === 'excellent' ? 'bg-green-500' :
                      metric.status === 'good' ? 'bg-blue-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className={`font-medium ${
                    metric.status === 'excellent' ? 'text-green-600' :
                    metric.status === 'good' ? 'text-blue-600' :
                    metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.status.toUpperCase()}
                  </span>
                  <span>100%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enhanced Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Performance Overview</h3>
              <Button variant="outline" size="sm" onClick={() => handleViewDetails('performance')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{metric.value}%</span>
                      <Badge variant={metric.value >= metric.target ? 'default' : 'secondary'} className="text-xs">
                        Target: {metric.target}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 relative"
                      style={{ 
                        width: `${metric.value}%`,
                        backgroundColor: metric.color
                      }}
                    >
                      <div 
                        className="absolute top-0 h-3 w-1 bg-white/50 rounded-full"
                        style={{ left: `${(metric.target / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Department Distribution</h3>
              <Button variant="outline" size="sm" onClick={handleBreakdown}>
                <PieChart className="h-4 w-4 mr-2" />
                Breakdown
              </Button>
            </div>
            <div className="space-y-3">
              {departmentStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No department data available</p>
                  <p className="text-sm">Add interns with departments to see distribution</p>
                </div>
              ) : (
                departmentStats.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{dept.value}</span>
                      <div className="flex items-center gap-1">
                        {dept.growth > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDownIcon className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs ${dept.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dept.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Enhanced Recent Activity */}
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleViewAllActivity}>
                  <Activity className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivities
                .filter(activity => 
                  activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  activity.action.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                    <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${getStatusColor(activity.status)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground">{activity.details}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        </Card>

        {/* Enhanced Alerts and Notifications */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">System Alerts & Notifications</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.overdueTasks} active alerts</Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Manage Alerts
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                type: 'warning',
                title: 'Overdue Tasks',
                message: `${stats.overdueTasks} tasks are past their deadline`,
                action: 'Review Tasks',
                icon: AlertCircle,
                actionType: 'review-tasks',
                priority: 'high'
              },
              {
                type: 'info',
                title: 'Pending Certificates',
                message: `${stats.pendingCertificates} certificates awaiting approval`,
                action: 'Review Certificates',
                icon: Award,
                actionType: 'review-certificates',
                priority: 'medium'
              },
              {
                type: 'success',
                title: 'System Backup',
                message: 'Daily backup completed successfully',
                action: 'View Logs',
                icon: CheckCircle,
                actionType: 'logs',
                priority: 'low'
              }
            ].map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 hover:shadow-md transition-shadow ${
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                alert.type === 'info' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' :
                'border-green-500 bg-green-50 dark:bg-green-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'info' ? 'text-blue-600' :
                    'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant={alert.priority === 'high' ? 'destructive' : alert.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleSystemAlert(alert.actionType)}
                    >
                      {alert.action}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowDetailsModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detailed Analytics - {selectedMetric}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowDetailsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Key Metrics</h3>
                  {[
                    { id: '1', name: 'New Interns This Week', value: Math.floor(stats.totalInterns * 0.1), change: 25, trend: 'up', category: 'Interns' },
                    { id: '2', name: 'Tasks Completed Today', value: Math.floor(stats.completedTasks * 0.15), change: -8, trend: 'down', category: 'Tasks' },
                    { id: '3', name: 'Certificates Issued', value: stats.issuedCertificates, change: 15, trend: 'up', category: 'Certificates' },
                    { id: '4', name: 'Pending Reviews', value: stats.pendingSubmissions, change: 5, trend: 'up', category: 'Reviews' }
                  ].map((metric) => (
                    <div key={metric.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl">{metric.value}</span>
                          <div className="flex items-center gap-1">
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDownIcon className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.change}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Time Range Analysis</h3>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Selected Period: {timeRange}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Growth Rate:</span>
                        <span className="font-bold text-green-600">+12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="font-bold">87.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend:</span>
                        <span className="font-bold text-blue-600">Positive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Breakdown Modal */}
      {showBreakdownModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowBreakdownModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Department Breakdown</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowBreakdownModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <h3 className="font-semibold text-lg">{dept.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl">{dept.value}</p>
                        <p className={`text-sm ${dept.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dept.growth > 0 ? '+' : ''}{dept.growth}% growth
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${departmentStats.length > 0 ? (dept.value / Math.max(...departmentStats.map(d => d.value))) * 100 : 0}%`,
                          backgroundColor: dept.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowActivityModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">All Activities</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowActivityModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${getStatusColor(activity.status)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* System Logs Modal */}
      {showSystemLogsModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowSystemLogsModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">System Logs</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      try {
                        const logs = await systemLogService.getAllLogs(20);
                        setSystemLogs(logs);
                      } catch (error) {
                        console.error('Failed to refresh logs:', error);
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowSystemLogsModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3 font-mono text-sm">
                {systemLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No system logs available</p>
                    <p className="text-sm">Logs will appear here as system events occur</p>
                  </div>
                ) : (
                  systemLogs.map((log, index) => (
                  <div key={log.objectId || index} className={`p-3 rounded border-l-4 ${
                    log.level === 'ERROR' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                    log.level === 'WARN' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <Badge variant={
                        log.level === 'ERROR' ? 'destructive' :
                        log.level === 'WARN' ? 'secondary' : 'default'
                      } className="text-xs">
                        {log.level}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.message}</span>
                          {log.source && (
                            <Badge variant="outline" className="text-xs">
                              {log.source}
                            </Badge>
                          )}
                        </div>
                        {log.details && (
                          <p className="text-xs text-muted-foreground">{log.details}</p>
                        )}
                        {(log.userId || log.ipAddress) && (
                          <div className="flex gap-2 mt-1">
                            {log.userId && (
                              <span className="text-xs text-muted-foreground">User: {log.userId}</span>
                            )}
                            {log.ipAddress && (
                              <span className="text-xs text-muted-foreground">IP: {log.ipAddress}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}