import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Award, 
  Menu, 
  X, 
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
  Shield,
  User,
  Building,
  Activity,
  Eye
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigationService, NavigationCounts } from '@/services/navigationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string | number;
  children?: NavigationItem[];
  isNew?: boolean;
  countKey?: keyof NavigationCounts;
}

const getNavigationItems = (counts: NavigationCounts, visitedPages: { [key: string]: boolean }): NavigationItem[] => [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    badge: visitedPages['/'] ? undefined : 'New'
  },
  { 
    name: 'Tasks', 
    href: '/tasks', 
    icon: ListTodo,
    badge: visitedPages['/tasks'] ? undefined : counts.tasks,
    countKey: 'tasks'
  },
  { 
    name: 'Interns', 
    href: '/interns', 
    icon: Users,
    badge: visitedPages['/interns'] ? undefined : counts.interns,
    countKey: 'interns'
  },
  { 
    name: 'Certificates', 
    href: '/certificates', 
    icon: Award,
    badge: visitedPages['/certificates'] ? undefined : counts.certificates,
    countKey: 'certificates'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      { name: 'Reports', href: '/analytics/reports', icon: FileText },
      { name: 'Performance', href: '/analytics/performance', icon: Activity },
      { name: 'Insights', href: '/analytics/insights', icon: Eye }
    ]
  },
  {
    name: 'Management',
    href: '/management',
    icon: Settings,
    children: [
      { name: 'Departments', href: '/management/departments', icon: Building },
      { name: 'Roles', href: '/management/roles', icon: Shield },
      { name: 'Permissions', href: '/management/permissions', icon: User }
    ]
  }
];



export function Sidebar({ collapsed, onToggle, isMobile: isMobileProp }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [counts, setCounts] = useState<NavigationCounts>({ tasks: 0, interns: 0, certificates: 0 });
  const [visitedPages, setVisitedPages] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [navigationCounts, visited] = await Promise.all([
          navigationService.getNavigationCounts(),
          Promise.resolve(navigationService.getVisitedPages())
        ]);
        setCounts(navigationCounts);
        setVisitedPages(visited);
      } catch (error) {
        console.error('Error loading navigation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Mark current page as visited
    if (!loading && location.pathname) {
      navigationService.markPageAsVisited(location.pathname);
      setVisitedPages(prev => ({ ...prev, [location.pathname]: true }));
    }
  }, [location.pathname, loading]);

  const navigation = getNavigationItems(counts, visitedPages);



  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };



  const filteredNavigation = navigation.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const paddingLeft = level === 0 ? 'pl-3' : 'pl-8';

    return (
      <div key={item.name}>
        <div className="relative group">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 group-hover:shadow-sm',
                paddingLeft
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(!collapsed || isMobile) && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {item.badge && !loading && (
                      <Badge 
                        variant={typeof item.badge === 'string' ? 'secondary' : 'default'} 
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {(!collapsed || isMobile) && (
                <div className="flex items-center space-x-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </div>
              )}
            </button>
          ) : (
            <NavLink
              to={item.href}
              end
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 group-hover:shadow-sm',
                paddingLeft
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium shadow-sm border-l-2 border-primary"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(!collapsed || isMobile) && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {item.badge && !loading && (
                      <Badge 
                        variant={typeof item.badge === 'string' ? 'secondary' : 'default'} 
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {item.isNew && (!collapsed || isMobile) && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </NavLink>
          )}
          
          {/* Tooltip for collapsed state */}
          {collapsed && !isMobile && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.name}
              {item.badge && !loading && (
                <span className="ml-2 px-1.5 py-0.5 bg-primary rounded text-xs">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (!collapsed || isMobile) && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" 
          onClick={onToggle}
        />
      )}
      
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-sm border-r border-sidebar-border/50 transition-all duration-300 shadow-xl',
          isMobile ? (
            collapsed ? '-translate-x-full w-72' : 'translate-x-0 w-72'
          ) : (
            collapsed ? 'w-16' : 'w-72'
          )
        )}
      >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/50 bg-gradient-to-r from-primary/10 to-primary/5">
          {(!collapsed || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                L
              </div>
              <div>
                <span className="font-bold text-lg text-sidebar-foreground">LTG Admin</span>
                <p className="text-xs text-muted-foreground">Management Portal</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          >
            {collapsed || isMobile ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search Bar */}
        {(!collapsed || isMobile) && (
          <div className="p-4 border-b border-sidebar-border/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search navigation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-sidebar-accent/50 border-sidebar-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {filteredNavigation.map(item => renderNavigationItem(item))}
        </nav>
      </div>
    </aside>
    </>
  );
}