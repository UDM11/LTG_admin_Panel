import { LayoutDashboard, ListTodo, Users, Award, Menu, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Interns', href: '/interns', icon: Users },
  { name: 'Certificates', href: '/certificates', icon: Award },
];

export function Sidebar({ collapsed, onToggle, isMobile }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed && !isMobile ? 'w-16' : 'w-64',
        isMobile && collapsed && '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {(!collapsed || isMobile) && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                L
              </div>
              <span className="font-semibold text-sidebar-foreground">LTG Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed || isMobile ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className={cn('flex items-center space-x-3', collapsed && !isMobile && 'justify-center')}>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              AD
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@ltg.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
