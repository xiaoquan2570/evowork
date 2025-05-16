'use client'; // This page will manage state, so it needs to be a Client Component

import React from 'react';
import ChatArea from '@/components/dashboard/ChatArea';
import ProcessPanel from '@/components/dashboard/ProcessPanel';
// Sidebar is no longer imported or used here

// No longer needs to define Thread type here if it's defined in context or ChatArea
// No longer needs DashboardPageProps

export default function DashboardPage() {
  // activeThreadId is no longer passed as a prop here.
  // ChatArea will get it from the DashboardContext.

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Sidebar is rendered by DashboardLayout */}
      <ChatArea /> {/* ChatArea now gets activeThreadId from context */}
      <ProcessPanel />
    </div>
  );
} 