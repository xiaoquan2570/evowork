'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
// import type { Thread } from '@/app/dashboard/page'; // No longer importing from page.tsx

// Define Thread interface here or in a dedicated types file
export interface Thread {
  id: string;
  title: string;
  lastUpdated: Date;
}

export interface Message {
  id: string;
  text: string; // This will store the raw combined text or final reply if not parsing <think>
  sender: 'user' | 'agent' | 'system-error';
  timestamp: Date | string;
  isStreaming?: boolean;
  thinkContent?: string | null; // Content within <think>...</think> tags
  replyContent?: string | null; // Content after </think> tag (the final answer)
  isThinking?: boolean;         // True if <think> is open and </think> is not yet received
  thinkDuration?: number;     // Optional: store duration of think process in ms
}

export interface ActivityEntry {
  id: string;
  title: string;
  details?: string | Record<string, any>; // Can be simple string or a structured object
  status: 'running' | 'success' | 'error' | 'pending';
  result?: string | Record<string, any>;
  error?: string | object;
  timestamp: Date;
  duration?: number;
}

// Initial mock messages, will be managed by the context provider
const initialMockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1-1', text: '你好，我想分析一下阿里巴巴最近的财报。', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    { id: 'm1-2', text: '当然，请问您关注财报的哪些方面？例如营收、利润、用户增长等等？', sender: 'agent', timestamp: new Date(Date.now() - 1000 * 60 * 9) },
    { id: 'm1-3', text: '我想重点了解营收和云计算业务的增长情况。', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
  ],
  '2': [
    { id: 'm2-1', text: '你好啊！', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'm2-2', text: '你好！有什么可以帮您的吗？', sender: 'agent', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
  ],
}; 

interface DashboardContextType {
  threads: Thread[];
  setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
  activeThreadId: string | null;
  setActiveThreadId: React.Dispatch<React.SetStateAction<string | null>>;
  handleSelectThread: (threadId: string) => void;
  handleNewChat: () => string;
  messagesByThreadId: Record<string, Message[]>;
  addMessageToThread: (threadId: string, message: Partial<Message>, isNewAgentMessage?: boolean) => string;
  activityLog: ActivityEntry[];
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => string;
  updateActivity: (activityId: string, updates: Partial<Omit<ActivityEntry, 'id' | 'timestamp'>>) => void;
  clearActivityLog: (forThreadId?: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setMessagesByThreadId: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  appendChunkToAgentMessage: (threadId: string, messageId: string, chunk: string) => void;
  finalizeAgentMessageStreaming: (threadId: string, messageId: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([
    { id: '1', title: '阿里财报分析', lastUpdated: new Date() },
    { id: '2', title: '你好聊天', lastUpdated: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '3', title: 'Weather Dashboard Project Idea', lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ]);
  const [messagesByThreadId, setMessagesByThreadId] = useState<Record<string, Message[]>>({});
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
  }, []);

  const handleNewChat = useCallback(() => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: Thread = {
      id: newThreadId,
      title: 'New Chat',
      lastUpdated: new Date(),
    };
    setThreads(prev => [newThread, ...prev]);
    setMessagesByThreadId(prev => ({ ...prev, [newThreadId]: [] }));
    setActiveThreadId(newThreadId);
    clearActivityLog();
    return newThreadId;
  }, []);

  const addMessageToThread = useCallback((threadId: string, messageData: Partial<Message>, isNewAgentMessage: boolean = false): string => {
    const messageId = messageData.id || `msg-${messageData.sender || 'system'}-${Date.now()}`;
    setMessagesByThreadId(prev => {
      const existingMessages = prev[threadId] || [];
      const correctedTimestamp = typeof messageData.timestamp === 'string' ? new Date(messageData.timestamp) : (messageData.timestamp || new Date());
      
      let newMessage: Message = {
        id: messageId,
        text: messageData.text || '',
        sender: messageData.sender || 'agent',
        timestamp: correctedTimestamp,
        isStreaming: isNewAgentMessage, // Set streaming based on this flag
        isThinking: isNewAgentMessage,  // Assume thinking if it's a new agent message that will stream
        thinkContent: '', // Initialize empty
        replyContent: '', // Initialize empty
        ...messageData, // Spread any other provided message data
      };
      
      setThreads(prevThreads => prevThreads.map(t => 
        t.id === threadId ? { ...t, lastUpdated: new Date() } : t
      ));

      return {
        ...prev,
        [threadId]: [...existingMessages, newMessage],
      };
    });
    return messageId;
  }, []);

  const appendChunkToAgentMessage = useCallback((threadId: string, messageId: string, chunk: string) => {
    setMessagesByThreadId(prev => {
      const threadMessages = prev[threadId] || [];
      let thinkStartTime: number | null = null; 

      const updatedMessages = threadMessages.map(msg => {
        if (msg.id === messageId) {
          let newText = msg.text + chunk;
          let newThinkContent = msg.thinkContent || '';
          let newReplyContent = msg.replyContent || '';
          let stillIsThinking = msg.isThinking;
          let newThinkDuration = msg.thinkDuration;

          // Simplified parsing for <think>...</think>
          // This logic assumes <think> and </think> don't get split across chunks in a way that breaks this.
          // A more robust parser might be needed for complex cases.

          if (stillIsThinking) {
            if (!thinkStartTime && msg.text.includes('<think>')) { // Crude way to mark start time approx
                thinkStartTime = msg.timestamp instanceof Date ? msg.timestamp.getTime() : Date.now();
            }
            if (chunk.includes('</think>')) {
              // </think> found, finalize thinking phase for this chunk
              const parts = (newThinkContent + chunk).split('</think>');
              newThinkContent = parts[0].replace('<think>', ''); // Remove <think> if it was part of the first chunk
              newReplyContent = parts[1] || '';
              stillIsThinking = false;
              if (thinkStartTime) {
                newThinkDuration = Date.now() - thinkStartTime;
              }
            } else {
              // Still in thinking phase, append to thinkContent
              newThinkContent += chunk.replace('<think>', ''); // Proactively remove <think> if present
            }
          } else {
            // Not in thinking phase (either before <think> or after </think>), append to replyContent
            newReplyContent += chunk;
          }
          
          // If <think> tag appears for the first time in this chunk (and we weren't already thinking)
          if (!msg.isThinking && newText.includes('<think>') && !newText.includes('</think>')){
            const thinkStartIndex = newText.indexOf('<think>');
            // Content before <think> is part of reply (or preamble)
            newReplyContent = newText.substring(0, thinkStartIndex);
            newThinkContent = newText.substring(thinkStartIndex + '<think>'.length);
            stillIsThinking = true;
            thinkStartTime = Date.now(); 
          }

          return {
            ...msg,
            text: newText, // Keep raw text for now, might remove later if not needed
            thinkContent: newThinkContent.trimStart(),
            replyContent: newReplyContent.trimStart(),
            isStreaming: true,
            isThinking: stillIsThinking,
            thinkDuration: newThinkDuration,
          };
        }
        return msg;
      });
      
      if (updatedMessages.some(msg => msg.id === messageId && msg.isStreaming)) {
        setThreads(prevThreads => prevThreads.map(t => 
          t.id === threadId ? { ...t, lastUpdated: new Date() } : t
        ));
      }
      return { ...prev, [threadId]: updatedMessages };
    });
  }, []);

  const finalizeAgentMessageStreaming = useCallback((threadId: string, messageId: string) => {
    setMessagesByThreadId(prev => {
      const threadMessages = prev[threadId] || [];
      const updatedMessages = threadMessages.map(msg => {
        if (msg.id === messageId) {
          let finalThinkContent = msg.thinkContent || '';
          let finalReplyContent = msg.replyContent || '';
          let thinkDuration = msg.thinkDuration;

          // If streaming finished while still in thinking mode (e.g. </think> was the last chunk)
          // or if </think> was never received but streaming ended.
          if (msg.isThinking) {
            // Consider everything received as think content if </think> was missing.
            // Or, if </think> was in the last chunk, parsing in appendChunk should handle it.
            // This is a fallback.
            finalThinkContent = finalThinkContent.replace('<think>','').trim();
             if (!thinkDuration && msg.timestamp instanceof Date) { // Estimate duration if not set
                thinkDuration = Date.now() - msg.timestamp.getTime();
            }
          } else {
             // If we were not thinking, it means all content is reply content or </think> was processed.
             // Ensure <think> tag is not in reply if it accidentally slipped through
             finalReplyContent = finalReplyContent.replace('<think>','').trim();
          }
          // Clean up thinkContent one last time just in case of stray <think> tags
          finalThinkContent = finalThinkContent.replace('<think>','').trim();

          return { 
            ...msg, 
            isStreaming: false, 
            isThinking: false, // Final state is not thinking
            thinkContent: finalThinkContent,
            replyContent: finalReplyContent,
            thinkDuration: thinkDuration,
          }; 
        }
        return msg;
      });
      setThreads(prevThreads => prevThreads.map(t => 
        t.id === threadId ? { ...t, lastUpdated: new Date() } : t
      ));
      return { ...prev, [threadId]: updatedMessages };
    });
  }, []);

  const addActivity = useCallback((activity: Omit<ActivityEntry, 'id' | 'timestamp'>): string => {
    const newActivityId = `act-${Date.now()}`;
    const newEntry: ActivityEntry = {
      ...activity,
      id: newActivityId,
      timestamp: new Date(),
    };
    setActivityLog(prev => [newEntry, ...prev]);
    return newActivityId;
  }, []);

  const updateActivity = useCallback((activityId: string, updates: Partial<Omit<ActivityEntry, 'id' | 'timestamp'>>) => {
    setActivityLog(prev =>
      prev.map(entry =>
        entry.id === activityId
          ? { 
              ...entry, 
              ...updates, 
              duration: updates.status !== 'running' && entry.status === 'running' && entry.timestamp ? new Date().getTime() - entry.timestamp.getTime() : entry.duration 
            }
          : entry
      )
    );
  }, []);
  
  const clearActivityLog = useCallback(() => {
    setActivityLog([]);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    threads,
    setThreads,
    activeThreadId,
    setActiveThreadId,
    handleSelectThread,
    handleNewChat,
    messagesByThreadId,
    addMessageToThread,
    activityLog,
    addActivity,
    updateActivity,
    clearActivityLog,
    isSidebarOpen,
    toggleSidebar,
    setMessagesByThreadId,
    appendChunkToAgentMessage,
    finalizeAgentMessageStreaming,
  }), [
    threads, activeThreadId, messagesByThreadId, activityLog, isSidebarOpen,
    addMessageToThread, addActivity, updateActivity, clearActivityLog, toggleSidebar,
    setThreads, setActiveThreadId, setMessagesByThreadId, appendChunkToAgentMessage, finalizeAgentMessageStreaming
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 