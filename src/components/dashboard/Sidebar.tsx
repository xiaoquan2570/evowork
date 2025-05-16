import React from 'react';
// Thread type can be imported from context or other shared location if needed, but Sidebar directly uses context values
import { useDashboard } from '@/contexts/DashboardContext'; // Import the hook

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
    handleNewChat       // Corrected name
  } = useDashboard(); // Use the hook to get context values

  return (
    <aside className="w-72 bg-white dark:bg-slate-800 p-4 shadow-md hidden md:flex md:flex-col h-full relative border-r dark:border-slate-700">
      <div className="text-slate-900 dark:text-white flex flex-col h-full">
        <div className="mb-4"> {/* Top section for Agent title and New Chat button */}
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-xl">Agents</p>
            {/* Placeholder for potential collapse button */}
            {/* <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </button> */}
          </div>
          <button 
            onClick={handleNewChat} // Use correct handler from context
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Chat
          </button>
          {/* Placeholder for future search/filter bar */}
          {/* <div className="mt-4 h-px bg-slate-200 dark:bg-slate-700"></div> */}
        </div>
        
        {/* Scrollable chat history */}
        <div className="space-y-1.5 overflow-y-auto flex-grow pr-1 -mr-2"> {/* Added pr for scrollbar gap */}
          {(threads && threads.length > 0) ? (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)} // Use correct handler from context
                className={`p-2.5 rounded-lg cursor-pointer transition-colors 
                            ${activeThreadId === thread.id 
                              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'}`}
              >
                <p className="text-sm font-medium truncate" title={thread.title}>{thread.title}</p>
                {/* <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{thread.lastUpdated.toLocaleTimeString()}</p> */}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No chats yet.</p>
          )}
        </div>

        {/* Bottom fixed section */}
        <div className="mt-auto border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="p-3 bg-blue-50 dark:bg-slate-700/30 rounded-lg mb-3">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Enterprise Demo</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">All employees for your company</p>
            <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 px-3 rounded-md">
                Learn More
            </button>
          </div>
          {/* <button className="mt-3 w-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 px-3 rounded-md text-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M12 15c-2.2 0-4.2-1.2-5.5-3"></path></svg>
            Join Our Team
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 opacity-70"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </button> */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex items-center justify-between">
            <div className="flex items-center">
                <img src="https://via.placeholder.com/32/000000/FFFFFF/?text=XL" alt="User Avatar" className="w-8 h-8 rounded-full mr-2" />
                <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">xiaoquan li</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">xiaoquan2570@gmail.com</p>
                </div>
            </div>
            <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
} 