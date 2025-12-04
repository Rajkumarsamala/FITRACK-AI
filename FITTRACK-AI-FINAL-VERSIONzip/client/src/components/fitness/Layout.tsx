import type { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f0f14] pb-24">
      <Navigation />
      <main className="container-responsive py-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
