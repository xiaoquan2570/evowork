'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
// import type { Thread } from '@/app/dashboard/page'; // No longer importing from page.tsx

// Define Thread interface here or in a dedicated types file
export interface Thread {
  id: string;
  title: string;
  lastUpdated: Date | string;
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
  thread_id?: string; // Optional, as it's contextually known but might be in DB object
  user_id?: string;   // Optional
  created_at?: Date | string; // Optional
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
  handleNewChat: () => Promise<string | null>;
  messagesByThreadId: Record<string, Message[]>;
  addMessageToThread: (threadId: string, message: Partial<Message>, isNewAgentMessage?: boolean) => Promise<string | null>;
  activityLog: ActivityEntry[];
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => string;
  updateActivity: (activityId: string, updates: Partial<Omit<ActivityEntry, 'id' | 'timestamp'>>) => void;
  clearActivityLog: (forThreadId?: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setMessagesByThreadId: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  appendChunkToAgentMessage: (threadId: string, messageId: string, chunk: string) => void;
  finalizeAgentMessageStreaming: (threadId: string, messageId: string) => void;
  isLoadingThreads: boolean;
  isLoadingMessages: Record<string, boolean>;
  error: string | null;
  clearError: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messagesByThreadId, setMessagesByThreadId] = useState<Record<string, Message[]>>({});
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoadingThreads(true);
      setError(null);
      try {
        const response = await fetch('/api/threads');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to fetch threads, and error response is not JSON.'}));
          throw new Error(errData.message || `Failed to fetch threads: ${response.status}`);
        }
        const data: Thread[] = await response.json();
        const processedThreads = data.map(thread => ({
          ...thread,
          lastUpdated: new Date(thread.lastUpdated),
        }));
        setThreads(processedThreads);
      } catch (e: any) {
        console.error("Error fetching threads:", e);
        setError(e.message || 'An unknown error occurred while fetching threads.');
      } finally {
        setIsLoadingThreads(false);
      }
    };
    fetchThreads();
  }, []);

  const handleSelectThread = useCallback(async (threadId: string) => {
    setActiveThreadId(threadId);
    setError(null);

    if (!messagesByThreadId[threadId] && !isLoadingMessages[threadId]) {
      setIsLoadingMessages(prev => ({ ...prev, [threadId]: true }));
      try {
        const response = await fetch(`/api/messages?threadId=${threadId}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to fetch messages, and error response is not JSON.'}));
          throw new Error(errData.message || `Failed to fetch messages for thread ${threadId}: ${response.status}`);
        }
        const data: Message[] = await response.json();
        const processedMessages = data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessagesByThreadId(prev => ({ ...prev, [threadId]: processedMessages }));
      } catch (e: any) {
        console.error(`Error fetching messages for thread ${threadId}:`, e);
        setError(e.message || `Failed to load messages for thread ${threadId}.`);
      } finally {
        setIsLoadingMessages(prev => ({ ...prev, [threadId]: false }));
      }
    }
  }, [messagesByThreadId, isLoadingMessages]);

  const handleNewChat = useCallback(async (): Promise<string | null> => {
    setError(null);
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Failed to create new chat, and error response is not JSON.'}));
        throw new Error(errData.message || `Failed to create new chat: ${response.status}`);
      }
      const newThread: Thread = await response.json();
      const processedNewThread = {
        ...newThread,
        lastUpdated: new Date(newThread.lastUpdated),
      };

      setThreads(prev => [processedNewThread, ...prev]);
      setMessagesByThreadId(prev => ({ ...prev, [processedNewThread.id]: [] }));
      setActiveThreadId(processedNewThread.id);
      clearActivityLog();
      return processedNewThread.id;
    } catch (e: any) {
      console.error("Error creating new chat:", e);
      setError(e.message || 'An unknown error occurred while creating a new chat.');
      return null;
    }
  }, []);

  const addMessageToThread = useCallback(async (threadId: string, messageData: Partial<Message>, isNewAgentMessage: boolean = false): Promise<string | null> => {
    const localMessageId = messageData.id || `msg-${messageData.sender || 'system'}-${Date.now()}`;
    
    const messageForFrontend: Message = {
      id: localMessageId,
      text: messageData.text || '',
      sender: messageData.sender || 'agent',
      timestamp: typeof messageData.timestamp === 'string' ? new Date(messageData.timestamp) : (messageData.timestamp || new Date()),
      isStreaming: isNewAgentMessage,
      isThinking: isNewAgentMessage,
      thinkContent: '',
      replyContent: '',
      ...messageData,
    };

    setMessagesByThreadId(prev => {
      const existingMessages = prev[threadId] || [];
      return {
        ...prev,
        [threadId]: [...existingMessages, messageForFrontend],
      };
    });

    if (messageForFrontend.sender === 'user') {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            thread_id: threadId,
            ...messageForFrontend,
            timestamp: (messageForFrontend.timestamp as Date).toISOString(),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to save user message, server response not JSON.'}));
          throw new Error(errData.message || `Server error saving user message: ${response.status}`);
        }
        const savedMessage: Message = await response.json();
        
        setMessagesByThreadId(prev => {
          const currentThreadMessages = prev[threadId] || [];
          return {
            ...prev,
            [threadId]: currentThreadMessages.map(msg => 
              msg.id === localMessageId ? { ...msg, ...savedMessage, timestamp: new Date(savedMessage.timestamp) } : msg
            ),
          };
        });
        setThreads(prevThreads => prevThreads.map(t => 
          t.id === threadId ? { ...t, lastUpdated: new Date(savedMessage.timestamp) } : t
        ).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()));

        return savedMessage.id;
      } catch (e: any) {
        console.error("Error saving user message:", e);
        setError(e.message || "Failed to save your message.");
        return null;
      }
    }
    
    return localMessageId; 
  }, [setError]);

  const appendChunkToAgentMessage = useCallback((threadId: string, messageId: string, chunk: string) => {
    setMessagesByThreadId(prev => {
      const threadMessages = prev[threadId] || [];
      let thinkStartTimestamp: number | null = null;

      const updatedMessages = threadMessages.map(msg => {
        if (msg.id === messageId) {
          let newText = (msg.text || '') + chunk;
          let currentThinkContent = msg.thinkContent || '';
          let currentReplyContent = msg.replyContent || '';
          let currentIsThinking = msg.isThinking;
          let newThinkDuration = msg.thinkDuration;

          if (currentIsThinking === undefined && newText.includes('<think>')) {
            currentIsThinking = true;
            thinkStartTimestamp = msg.timestamp instanceof Date ? msg.timestamp.getTime() : Date.now();
          }

          if (currentIsThinking) {
            currentThinkContent += chunk;
            if (currentThinkContent.includes('</think>')) {
              const parts = currentThinkContent.split('</think>');
              currentThinkContent = parts[0].replace('<think>', '').trim(); 
              currentReplyContent = (parts[1] || '') + (currentReplyContent || ''); 
              currentIsThinking = false; 
              if (thinkStartTimestamp && !newThinkDuration) {
                newThinkDuration = Date.now() - thinkStartTimestamp;
              }
            }
          } else {
            // Always append to reply content if not actively in a <think> block that hasn't closed
            currentReplyContent += chunk;
          }
          
          if (!currentIsThinking && currentThinkContent.startsWith('<think>')) {
              // Clean up <think> tag if it was at the very start and we are now out of thinking mode
              currentThinkContent = currentThinkContent.substring('<think>'.length);
          }

          return {
            ...msg,
            text: newText, 
            thinkContent: currentThinkContent,
            replyContent: currentReplyContent, // Main change: ensure this gets updated directly
            isStreaming: true, 
            isThinking: currentIsThinking, 
            thinkDuration: newThinkDuration,
          };
        }
        return msg;
      });
      
      if (updatedMessages.some(msg => msg.id === messageId && msg.isStreaming)) {
        setThreads(prevThreads => prevThreads.map(t => 
          t.id === threadId ? { ...t, lastUpdated: new Date() } : t
        ).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())); 
      }
      return { ...prev, [threadId]: updatedMessages };
    });
  }, [setThreads]);

  const finalizeAgentMessageStreaming = useCallback(async (threadId: string, messageId: string) => {
    let locallyFinalizedMessage: Message | undefined;

    setMessagesByThreadId(prev => {
      const threadMessages = prev[threadId] || [];
      const updatedMessages = threadMessages.map(msg => {
        if (msg.id === messageId) {
          let finalThinkContent = (msg.thinkContent || '').replace('<think>', '').replace('</think>', '').trim();
          let finalReplyContent = (msg.replyContent || '').trim();
          let finalThinkDuration = msg.thinkDuration;

          if (msg.isThinking && msg.thinkContent && !msg.thinkContent.includes('</think>')) {
             finalThinkContent = msg.thinkContent.replace('<think>', '').trim();
             if (msg.timestamp instanceof Date && !finalThinkDuration) {
                finalThinkDuration = Date.now() - msg.timestamp.getTime();
             }
          }
          
          if (!finalReplyContent && finalThinkContent && msg.text && msg.text.includes('</think>')){
            const parts = msg.text.split('</think>');
            if(parts.length > 1) finalReplyContent = parts[1].trim();
          }

          locallyFinalizedMessage = {
            ...msg,
            isStreaming: false,
            isThinking: false, 
            thinkContent: finalThinkContent,
            replyContent: finalReplyContent,
            thinkDuration: finalThinkDuration,
            text: finalReplyContent || finalThinkContent || 'Message processed.',
          };
          return locallyFinalizedMessage;
        }
        return msg;
      });

      if (locallyFinalizedMessage?.timestamp) {
        setThreads(prevThreads => prevThreads.map(t => 
          t.id === threadId ? { ...t, lastUpdated: new Date(locallyFinalizedMessage!.timestamp) } : t
        ).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()));
      }
      return { ...prev, [threadId]: updatedMessages };
    });

    // Restore DB Saving for Agent Message
    if (locallyFinalizedMessage && locallyFinalizedMessage.sender === 'agent') {
      try {
        const messageToSendToDB = {
            thread_id: threadId,
            id: locallyFinalizedMessage.id, // Send the ID that was used for streaming updates
            sender: locallyFinalizedMessage.sender,
            text: locallyFinalizedMessage.replyContent || locallyFinalizedMessage.thinkContent || 'Message processed.', // Prefer replyContent for main text in DB
            timestamp: (locallyFinalizedMessage.timestamp as Date).toISOString(),
            think_content: locallyFinalizedMessage.thinkContent,
            reply_content: locallyFinalizedMessage.replyContent,
            think_duration: locallyFinalizedMessage.thinkDuration,
        };
        // console.log('[finalizeStream DB Save] Sending to DB:', JSON.parse(JSON.stringify(messageToSendToDB)));

        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageToSendToDB),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to save agent message, server response not JSON.'}));
          throw new Error(errData.message || `Server error saving agent message: ${response.status}`);
        }
        const dbSavedMessage: Message = await response.json();
        // console.log('[finalizeStream DB Save] Received from DB:', JSON.parse(JSON.stringify(dbSavedMessage)));
        
        setMessagesByThreadId(prev => {
          const currentThreadMessages = prev[threadId] || [];
          const finalMessages = currentThreadMessages.map(msg => {
            if (msg.id === messageId) { // messageId is the original agentMessageIdToStream (locallyFinalizedMessage.id)
              // console.log('[finalizeStream DB Save] Merging local:', JSON.parse(JSON.stringify(locallyFinalizedMessage)), 'with DB:', JSON.parse(JSON.stringify(dbSavedMessage)));
              const mergedMessage = {
                ...locallyFinalizedMessage!, // Start with all frontend-processed data
                id: dbSavedMessage.id || locallyFinalizedMessage!.id, // Prefer DB id if available
                timestamp: new Date(dbSavedMessage.timestamp),     // Prefer DB timestamp
                created_at: dbSavedMessage.created_at,             // Add DB created_at
                // Explicitly keep frontend parsed content unless DB has something and frontend doesn't (unlikely for these)
                thinkContent: locallyFinalizedMessage!.thinkContent, 
                replyContent: locallyFinalizedMessage!.replyContent,
                text: locallyFinalizedMessage!.text, // Keep the text determined by frontend logic
                // Other fields like user_id, thread_id if returned by DB could be merged too
                user_id: dbSavedMessage.user_id || locallyFinalizedMessage!.user_id,
                thread_id: dbSavedMessage.thread_id || locallyFinalizedMessage!.thread_id,
              };
              // console.log('[finalizeStream DB Save] Merged message:', JSON.parse(JSON.stringify(mergedMessage)));
              return mergedMessage;
            }
            return msg;
          });
          return {
            ...prev,
            [threadId]: finalMessages,
          };
        });
      } catch (e: any) {
        setError(e.message || "Failed to save agent response.");
      }
    }
  }, [setError, setThreads]);

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
    isLoadingThreads,
    isLoadingMessages,
    error,
    clearError,
  }), [
    threads, activeThreadId, messagesByThreadId, activityLog, isSidebarOpen,
    addMessageToThread, addActivity, updateActivity, clearActivityLog, toggleSidebar,
    setThreads, setActiveThreadId, setMessagesByThreadId, appendChunkToAgentMessage, finalizeAgentMessageStreaming,
    isLoadingThreads, isLoadingMessages, error, clearError
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