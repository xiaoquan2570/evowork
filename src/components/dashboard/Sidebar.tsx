'use client';

import React from 'react';
// Thread type can be imported from context or other shared location if needed, but Sidebar directly uses context values
import { useDashboard } from '@/contexts/DashboardContext'; // Import the hook
// Assuming shadcn/ui components are typically in src/components/ui/
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Button } from '@/components/ui/button'; 
import { PlusCircle, Trash2 } from 'lucide-react'; // Using lucide-react for icons

// interface SidebarProps { // No longer needed as props come from context
//   threads: Thread[];
//   activeThreadId: string | null;
//   onSelectThread: (threadId: string | null) => void;
//   onNewChat: () => void;
// }

export default function Sidebar() { // Remove props from function signature
  const { 
    threads, 
    activeThreadId, 
    handleSelectThread, // Corrected name
    handleNewChat,       // Corrected name
    isLoadingThreads,
    error,
    isSidebarOpen,       // Assuming you might use this for mobile responsiveness later
    toggleSidebar,       // Same as above
    handleDeleteThread   // Get the delete handler from context
  } = useDashboard(); // Use the hook to get context values

  const confirmAndDelete = (threadId: string, threadTitle: string) => {
    if (window.confirm(`您确定要删除聊天 "${threadTitle}" 吗？\n此操作无法撤销，所有相关数据都将被永久删除。`)) {
      handleDeleteThread(threadId);
    }
  };

  return (
    <aside className={`flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out w-64 space-y-2 p-3 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative fixed md:h-auto h-full z-40`}>
      <div className="flex items-center justify-between p-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Agents</h2>
        {/* Placeholder for potential future actions or a toggle for mobile */} 
      </div>
      <Button 
        onClick={handleNewChat}
        variant="default" 
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <PlusCircle size={18} />
        <span>New Chat</span>
      </Button>
      
      {isLoadingThreads && (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">Loading chats...</div>
      )}
      {error && (
        <div className="p-4 text-red-500 dark:text-red-400">Error loading: {error}</div>
      )}
      {!isLoadingThreads && !error && threads.length === 0 && (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">No chats yet. Start a new one!</div>
      )}

      <ScrollArea className="flex-1 -mx-3">
        <div className="px-3 space-y-1">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`group flex items-center justify-between p-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ease-in-out 
                          ${activeThreadId === thread.id
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
            >
              <span onClick={() => handleSelectThread(thread.id)} className="truncate flex-grow pr-2" title={thread.title}>
                {thread.title || 'New Chat'}
              </span>
              <Button 
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 w-7 h-7"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  confirmAndDelete(thread.id, thread.title || 'New Chat');
                }}
                title="Delete chat"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      {/* Optional: Add a toggle button for mobile view here if needed */}
    </aside>
  );
} 