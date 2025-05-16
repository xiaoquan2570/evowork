'use client';
import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import type { ActivityEntry } from '@/contexts/DashboardContext'; // Import type
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

// Helper function to format details or results
const formatContent = (content: string | Record<string, any> | undefined): string => {
  if (typeof content === 'string') {
    return content;
  }
  if (typeof content === 'object' && content !== null) {
    // Basic JSON stringify, can be enhanced for specific object structures
    return JSON.stringify(content, null, 2); 
  }
  return 'N/A'; // Return N/A or empty string if undefined or not string/object
};

// Helper function to get status color and potentially icon
const getStatusStyles = (status: ActivityEntry['status']) => {
  switch (status) {
    case 'success': return { color: 'text-green-500 dark:text-green-400', icon: '✓' }; // Checkmark icon
    case 'error': return { color: 'text-red-500 dark:text-red-400', icon: '✗' }; // Cross icon
    case 'running': return { color: 'text-yellow-500 dark:text-yellow-400', icon: '⏳' }; // Hourglass icon
    case 'pending': return { color: 'text-slate-500 dark:text-slate-400', icon: '...' };
    default: return { color: 'text-slate-500 dark:text-slate-400', icon: '' };
  }
};

export default function ProcessPanel() {
  const { activityLog } = useDashboard();

  const activityVariants = {
    hidden: { opacity: 0, x: 20 }, // Slide in from right
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } } // Slide out to left on exit
  };

  return (
    <aside className="w-80 md:w-96 bg-white dark:bg-slate-850 p-0 shadow-lg border-l border-slate-200 dark:border-slate-700 overflow-y-auto hidden xl:flex xl:flex-col h-full">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 sticky top-0 bg-white dark:bg-slate-850 py-3.5 px-4 z-10 border-b dark:border-slate-700">
        Tool Activity
      </h2>
      
      {activityLog.length === 0 ? (
        <div className="flex-grow flex items-center justify-center p-4">
          <p className="text-slate-400 dark:text-slate-500 text-sm text-center">No tool activity to display for this turn. Send a message to see agent actions.</p>
        </div>
      ) : (
        <div className="space-y-3 p-4 text-sm flex-grow">
          <AnimatePresence initial={false} mode="sync"> {/* Use mode="sync" or experiment with "popLayout" if needed for reordering */}
            {activityLog.map((entry) => {
              const statusStyles = getStatusStyles(entry.status);
              return (
                <motion.div 
                  key={entry.id} // Essential for AnimatePresence to track items
                  layout // Smooth reordering if items change position
                  variants={activityVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit" // Enable exit animation
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="font-medium text-slate-700 dark:text-slate-200 break-words mr-2">{entry.title}</p>
                    <span className={`text-xs font-semibold ${statusStyles.color} flex items-center flex-shrink-0`}>
                      <span className="mr-1">{statusStyles.icon}</span>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </div>
                  {entry.details && (
                    <div className="mb-1.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Details:</p>
                      <pre className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-2 rounded whitespace-pre-wrap break-all syntax-highlight">
                        {formatContent(entry.details)}
                      </pre>
                    </div>
                  )}
                  {(entry.status === 'success' || entry.status === 'error') && entry.result && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {entry.status === 'error' ? 'Error Output:' : 'Result:'}
                      </p>
                      <pre className={`text-xs ${entry.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'} bg-slate-100 dark:bg-slate-700 p-2 rounded whitespace-pre-wrap break-all syntax-highlight`}>
                        {formatContent(entry.result)}
                      </pre>
                    </div>
                  )}
                  <p className="text-right text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </aside>
  );
} 