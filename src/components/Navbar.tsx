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
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}



const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: API Integration',
    type: 'info',
    timestamp: '2024-01-20T10:30:00Z',
    read: false
  },
  {
    id: '2',
    title: 'Certificate Approved',
    message: 'Certificate for John Doe has been approved',
    type: 'success',
    timestamp: '2024-01-20T09:15:00Z',
    read: false
  },
  {
    id: '3',
    title: 'System Alert',
    message: 'High memory usage detected: 85%',
    type: 'warning',
    timestamp: '2024-01-20T08:45:00Z',
    read: true
  }
];



export function Navbar({ sidebarCollapsed }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 68,
    network: 'Good'
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
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

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      info: Bell,
      success: Award,
      warning: Shield,
      error: Activity
    };
    return icons[type];
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

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-gradient-to-r from-background to-background/95 backdrop-blur-sm border-b border-border/50 transition-all duration-300 shadow-sm',
        sidebarCollapsed ? 'left-16' : 'left-72'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section - Breadcrumb */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
            <span className="text-foreground font-medium">Overview</span>
          </div>
        </div>

        {/* Right Section - System Info & Actions */}
        <div className="flex items-center space-x-3">
          {/* System Status */}
          <div className="hidden lg:flex items-center space-x-4 px-3 py-1.5 bg-muted/30 rounded-lg">
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

          {/* Current Time */}
          <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-muted/50 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-blue-600" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:bg-muted/50 transition-colors relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border/50 rounded-lg shadow-xl z-50">
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
                    >
                      Mark all read
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-3 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer',
                          !notification.read && 'bg-primary/5'
                        )}
                        onClick={() => markAsRead(notification.id)}
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
              className="hover:bg-muted/50 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Settings Dropdown */}
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-background border border-border/50 rounded-lg shadow-xl z-50">
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
              className="flex items-center space-x-2 hover:bg-muted/50 transition-colors px-3"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-bold">
                AD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border/50 rounded-lg shadow-xl z-50">
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