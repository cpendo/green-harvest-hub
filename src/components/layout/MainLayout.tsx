import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { open } = useSidebar();

  return (
    <div className="min-h-screen w-screen bg-background">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${open ? 'pl-64' : 'pl-20'}`}
      >
        {children}
      </main>
    </div>
  );
}
