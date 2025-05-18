import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // If no session, redirect to the auth page
    // You might want to include a redirect_url query param 
    // so you can send them back to /dashboard after login
    redirect('/auth?redirect_url=/dashboard'); 
  }

  // If session exists, render the layout with DashboardProvider
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