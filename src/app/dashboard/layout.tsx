'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { DashboardProvider } from '@/contexts/DashboardContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
} 