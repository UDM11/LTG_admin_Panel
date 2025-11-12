import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />
      <Navbar sidebarCollapsed={sidebarCollapsed} />
      
      <main
        className={cn(
          'pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-4 md:px-6 transition-all duration-300',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
        )}
      >
        <div className="max-w-full overflow-x-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
