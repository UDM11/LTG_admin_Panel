import { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Bell, 
  Settings,
  User,
  LogOut,
  ChevronDown,
  HelpCircle,
  Shield,
  Activity,
  Clock,
  Award,
  Database,
  Wifi,
  WifiOff,
  Users,
  ListTodo,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { notificationService, internService, taskService, certificateService, Notification } from '@/services/backendless';

interface NavbarProps {
  sidebarCollapsed: boolean;
}





export function Navbar({ sidebarCollapsed }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({ interns: 0, tasks: 0, certificates: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    network: 'Good'
  });

  // Update time every second and system stats
  useEffect(() => {
    const updateTimeAndStats = () => {
      setCurrentTime(new Date());
      
      // Get real system performance data
      if ('memory' in performance && 'usedJSHeapSize' in (performance as any).memory) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
        setSystemStats(prev => ({ ...prev, memory: Math.min(memoryUsage, 100) }));
      } else {
        // Fallback: simulate realistic memory usage
        setSystemStats(prev => ({ ...prev, memory: Math.floor(Math.random() * 20) + 50 }));
      }
      
      // Simulate CPU usage based on performance timing
      const now = performance.now();
      const cpuUsage = Math.floor((now % 1000) / 10) + Math.floor(Math.random() * 30) + 20;
      setSystemStats(prev => ({ ...prev, cpu: Math.min(cpuUsage, 100) }));
    };
    
    updateTimeAndStats();
    const timer = setInterval(updateTimeAndStats, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate network status
  useEffect(() => {
    const checkOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  // Load real data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [notifs, interns, tasks, certificates] = await Promise.all([
          notificationService.getAllNotifications(20),
          internService.getAllInterns(),
          taskService.getAllTasks(),
          certificateService.getAllCertificates()
        ]);
        
        setNotifications(notifs);
        setStats({
          interns: interns.length,
          tasks: tasks.length,
          certificates: certificates.length
        });
      } catch (error) {
        console.error('Failed to load navbar data:', error);
      }
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowNotifications(false);
      setShowProfile(false);
      setShowSettings(false);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.entityType === 'task') return ListTodo;
    if (notification.entityType === 'intern') return Users;
    if (notification.entityType === 'certificate') return Award;
    
    const icons = {
      info: Bell,
      success: Award,
      warning: Shield,
      error: Activity
    };
    return icons[notification.type];
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };
    return colors[type];
  };

  const markAsRead = async (objectId: string) => {
    try {
      await notificationService.markAsRead(objectId);
      setNotifications(prev => 
        prev.map(n => n.objectId === objectId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-14 sm:h-16 bg-gradient-to-r from-background to-background/95 backdrop-blur-sm border-b border-border/50 transition-all duration-300 shadow-sm',
        isMobile ? 'left-0' : (sidebarCollapsed ? 'md:left-16' : 'md:left-72')
      )}
    >
      <div className="flex h-full items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left Section - Empty for now */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
          {/* Stats removed as requested */}
        </div>

        {/* Right Section - System Info & Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          {/* System Status */}
          <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-600" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-600" />
              )}
              <span className="text-xs font-medium text-muted-foreground">
                {systemStats.network}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">
                {systemStats.cpu}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Database className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-muted-foreground">
                {systemStats.memory}%
              </span>
            </div>
          </div>
          {/* Mobile System Status */}
          <div className="flex xl:hidden items-center space-x-1 px-2 py-1 bg-muted/30 rounded text-xs">
            <Activity className="h-3 w-3 text-blue-600" />
            <span>{systemStats.cpu}%</span>
          </div>

          {/* Current Time */}
          <div className="hidden sm:flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="hidden md:inline">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span className="md:hidden">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-muted/50 transition-colors h-8 w-8 sm:h-10 sm:w-10"
          >
            {theme === 'dark' ? (
              <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            ) : (
              <Moon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:bg-muted/50 transition-colors relative h-8 w-8 sm:h-10 sm:w-10"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-background border border-border/50 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} new
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-6 px-2"
                      disabled={unreadCount === 0}
                    >
                      Mark all read
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification);
                    return (
                      <div
                        key={notification.objectId}
                        className={cn(
                          'p-3 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer',
                          !notification.read && 'bg-primary/5'
                        )}
                        onClick={() => markAsRead(notification.objectId!)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn('p-1.5 rounded-full bg-muted', getNotificationColor(notification.type))}>
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{notification.title}</p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="hover:bg-muted/50 transition-colors h-8 w-8 sm:h-10 sm:w-10"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            {/* Settings Dropdown */}
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-background border border-border/50 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-border/50">
                  <h3 className="font-semibold text-sm">Settings</h3>
                </div>
                <div className="p-2 space-y-1">
                  {[
                    { name: 'General Settings', icon: Settings },
                    { name: 'User Management', icon: User },
                    { name: 'System Configuration', icon: Shield },
                    { name: 'Backup & Restore', icon: Database },
                    { name: 'Activity Logs', icon: Activity }
                  ].map((item) => (
                    <button
                      key={item.name}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-1 sm:space-x-2 hover:bg-muted/50 transition-colors px-2 sm:px-3"
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-bold">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute top-full right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-background border border-border/50 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold">
                      AD
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@ltg.com</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Super Admin
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  {[
                    { name: 'Profile Settings', icon: User },
                    { name: 'Account Security', icon: Shield },
                    { name: 'Preferences', icon: Settings },
                    { name: 'Help & Support', icon: HelpCircle }
                  ].map((item) => (
                    <button
                      key={item.name}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.name}</span>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-border/50">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left text-red-600">
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile || showSettings) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setShowSettings(false);
          }}
        />
      )}
    </header>
  );
}