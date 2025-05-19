'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';
// import type { Thread } from '@/app/dashboard/page'; // No longer importing from page.tsx

// Define Thread interface here or in a dedicated types file
export interface Thread {
  id: string;
  title: string;
  lastUpdated: Date | string;
}

export interface ToolCallFunction {
  name: string;
  arguments: string; // JSON string
}

export interface ToolCall {
  id: string; // Tool call ID, if provided by LLM
  type: 'function'; // Assuming only function tools for now
  function: ToolCallFunction;
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
  thinkStartTimestamp?: number; // Internal: to calculate duration
  toolCalls?: ToolCall[]; // <--- ADDED FIELD for structured tool calls
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
  appendChunkToAgentMessage: (threadId: string, messageId: string, rawChunkOrJsonLine: string) => void;
  finalizeAgentMessageStreaming: (threadId: string, messageId: string) => void;
  isLoadingThreads: boolean;
  isLoadingMessages: Record<string, boolean>;
  error: string | null;
  clearError: () => void;
  handleDeleteThread: (threadId: string) => Promise<boolean>;
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
  const finalizingMessageIdsRef = useRef(new Set<string>()); // Lock for message finalization
  const currentlySavingMessageIdsRef = useRef<Set<string>>(new Set()); // <--- New lock for _executeFinalizationAndSave

  const clearError = useCallback(() => setError(null), []);

  const debugSetMessagesByThreadId = (updater: React.SetStateAction<Record<string, Message[]>>, label = '') => {
    return setMessagesByThreadId((prev: Record<string, Message[]>) => {
      const result = typeof updater === 'function' ? updater(prev) : updater;
      // console.log(`[全局调试] setMessagesByThreadId 被调用${label ? ' - ' + label : ''}，新ID列表:`, Object.fromEntries(Object.entries(result).map(([k, v]) => [k, (v as Message[]).map((m: Message) => m.id)])), /* new Error().stack */);
      return result;
    });
  };

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

    // If we are already loading messages for this specific thread, don't initiate another fetch.
    if (isLoadingMessages[threadId]) {
      // console.log(`[DashboardContext] handleSelectThread: Already loading messages for ${threadId}, skipping fetch.`);
      return;
    }

    // console.log(`[DashboardContext] handleSelectThread: Attempting to load messages for thread ${threadId}`);
    setIsLoadingMessages(prev => ({ ...prev, [threadId]: true }));
    try {
      const response = await fetch(`/api/messages?threadId=${threadId}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Failed to fetch messages, and error response is not JSON.'}));
        throw new Error(errData.message || `Failed to fetch messages for thread ${threadId}: ${response.status}`);
      }
      const dbMessagesData: Message[] = await response.json();
      const dbMessages = dbMessagesData.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        created_at: msg.created_at ? new Date(msg.created_at as string) : undefined, // Ensure created_at from DB is a Date
      }));
      /* console.log(`[DashboardContext] handleSelectThread: Fetched ${dbMessages.length} messages from DB for thread ${threadId}:`, 
        dbMessages.map(m => ({id: m.id, text: m.text?.substring(0,20), created_at: m.created_at, isStreaming: m.isStreaming }))
      ); */

      debugSetMessagesByThreadId(prev => {
        const currentLocalThreadMessages = prev[threadId] || [];
        /* console.log(`[DashboardContext] handleSelectThread (updater): currentLocalThreadMessages for ${threadId} (before merge - ${currentLocalThreadMessages.length} items):`,
          currentLocalThreadMessages.map(m => ({id: m.id, text: m.text?.substring(0,20), created_at: m.created_at, isStreaming: m.isStreaming }))
        ); */

        const localUnsavedAgentStreamMessages = currentLocalThreadMessages.filter(
          m => m.sender === 'agent' && (m.isStreaming || !m.created_at)
        );
        /* console.log(`[DashboardContext] handleSelectThread (updater): localUnsavedAgentStreamMessages for ${threadId} (${localUnsavedAgentStreamMessages.length} items):`,
          localUnsavedAgentStreamMessages.map(m => ({id: m.id, text: m.text?.substring(0,20), created_at: m.created_at, isStreaming: m.isStreaming }))
        ); */

        const messagesMap = new Map<string, Message>();
        // Add all messages fetched from DB first. These are the source of truth.
        dbMessages.forEach(msg => messagesMap.set(msg.id, msg));

        // Now, add any genuinely local, unsaved agent streaming messages ONLY if their ID isn't already in the map
        // (which means they weren't in the DB fetch, as expected for an active stream).
        localUnsavedAgentStreamMessages.forEach(localMsg => {
          if (!messagesMap.has(localMsg.id)) {
            messagesMap.set(localMsg.id, localMsg);
            // console.log(`[DashboardContext] handleSelectThread: Adding local unsaved agent message ${localMsg.id} to map.`);
          } else {
            // This case (local unsaved agent message ID already in DB map) should ideally not happen 
            // if IDs and created_at are managed correctly during finalization.
            // If it does, it implies the local placeholder might not have been cleaned up properly
            // or an ID collision occurred. We prioritize the DB version.
            // console.warn(`[DashboardContext] handleSelectThread: Local unsaved agent message ID ${localMsg.id} already exists in DB results. Prioritizing DB version.`);
          }
        });
        
        const combinedMessages = Array.from(messagesMap.values());
        combinedMessages.sort((a, b) => (new Date(a.timestamp)).getTime() - (new Date(b.timestamp)).getTime());

        /* console.log(`[DashboardContext] handleSelectThread (updater): For thread ${threadId}, combined ${combinedMessages.length} messages. DB: ${dbMessages.length}, LocalUnsavedAgent: ${localUnsavedAgentStreamMessages.length}`);
        console.log(`[DashboardContext] handleSelectThread (updater): Final combinedMessages list for ${threadId}:`,
          combinedMessages.map(m => ({id: m.id, text: m.text?.substring(0,20), created_at: m.created_at, isStreaming: m.isStreaming }))
        ); */
        return { ...prev, [threadId]: combinedMessages };
      }, `handleSelectThread - Fetched DB for ${threadId}`);

    } catch (e: any) {
      console.error(`Error fetching messages for thread ${threadId}:`, e);
      setError(e.message || `Failed to load messages for thread ${threadId}.`);
      // Even on error, ensure loading state is reset for the specific thread
      debugSetMessagesByThreadId(prev => ({...prev, [threadId]: prev[threadId] || [] }), `handleSelectThread - Error, ensuring thread array exists`);
    } finally {
      setIsLoadingMessages(prev => ({ ...prev, [threadId]: false }));
    }
  }, [isLoadingMessages, setIsLoadingMessages, setActiveThreadId, setError, debugSetMessagesByThreadId]);

  const handleDeleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    setError(null);
    // console.log(`[DashboardContext] Attempting to delete thread: ${threadId}`);

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete thread, server response not JSON.'}));
        throw new Error(errorData.message || `Server error deleting thread: ${response.status}`);
      }

      // Deletion was successful on the backend
      debugSetMessagesByThreadId(prev => {
        const { [threadId]: _, ...restMessages } = prev; // Remove messages for the deleted thread
        return restMessages;
      }, `handleDeleteThread - messages removed for ${threadId}`);

      setThreads(prevThreads => prevThreads.filter(t => t.id !== threadId));

      if (activeThreadId === threadId) {
        // If the active thread was deleted, try to set a new active thread or set to null
        const remainingThreads = threads.filter(t => t.id !== threadId); // get up-to-date threads list
        if (remainingThreads.length > 0) {
          setActiveThreadId(remainingThreads[0].id); // Select the first remaining thread
          // Optionally, trigger handleSelectThread for the new active thread to load its messages if not already loaded
          // handleSelectThread(remainingThreads[0].id); 
        } else {
          setActiveThreadId(null); // No threads left
        }
      }
      // console.log(`[DashboardContext] Thread ${threadId} deleted successfully from frontend state.`);
      return true;
    } catch (e: any) {
      console.error(`[DashboardContext] Error deleting thread ${threadId}:`, e);
      setError(e.message || 'Failed to delete thread.');
      return false;
    }
  }, [activeThreadId, setActiveThreadId, setThreads, debugSetMessagesByThreadId, setError, threads]); // Added threads to dependencies for auto-selecting next thread

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
      debugSetMessagesByThreadId(prev => ({ ...prev, [processedNewThread.id]: [] }), 'handleNewChat');
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

    debugSetMessagesByThreadId(prev => {
      const existingMessages = prev[threadId] || [];
      const newList = [...existingMessages, messageForFrontend];
      if (messageForFrontend.sender === 'agent') {
        // console.log('[DashboardContext] addMessageToThread 插入Agent消息:', messageForFrontend.id, '当前消息ID列表:', newList.map(m => m.id));
      }
      return {
        ...prev,
        [threadId]: newList,
      };
    }, 'addMessageToThread');

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
        
        debugSetMessagesByThreadId(prev => {
          const currentThreadMessages = prev[threadId] || [];
          return {
            ...prev,
            [threadId]: currentThreadMessages.map(msg => 
              msg.id === localMessageId ? { ...msg, ...savedMessage, timestamp: new Date(savedMessage.timestamp) } : msg
            ),
          };
        }, 'addMessageToThread-用户消息保存');
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

  // Utility function to actually save the message to the backend and update local state
  const _executeFinalizationAndSave = useCallback(async (threadId: string, messageToFinalize: Message) => {
    // console.log(`[DashboardContext] _executeFinalizationAndSave: ENTERED for message ID ${messageToFinalize.id} in thread ${threadId}. Current save lock count: ${currentlySavingMessageIdsRef.current.size}`);

    // Additional check: If the message to finalize already looks like a finalized DB message, skip.
    // This is a heuristic. A more robust check might involve looking up its ID in a set of known finalized DB IDs.
    if (!messageToFinalize.id.startsWith('msg-agent-') && messageToFinalize.created_at) {
      console.warn(`[DashboardContext] _executeFinalizationAndSave: Message ${messageToFinalize.id} appears to be already finalized (non-temp ID and has created_at). Skipping save attempt.`);
      // Ensure it's marked as not streaming/thinking if it wasn't already
      debugSetMessagesByThreadId(prev => {
        const currentMessages = prev[threadId] || [];
        return {
          ...prev,
          [threadId]: currentMessages.map(msg => 
            msg.id === messageToFinalize.id 
            ? { ...msg, isStreaming: false, isThinking: false } 
            : msg
          ),
        };
      }, `_executeFinalizationAndSave-SkippedAlreadyFinalized-${messageToFinalize.id}`);
      return;
    }

    if (currentlySavingMessageIdsRef.current.has(messageToFinalize.id)) {
      // console.log(`[DashboardContext] _executeFinalizationAndSave: SKIPPING save for message ID ${messageToFinalize.id} as it is already being saved.`);
      return; // Already being processed, skip
    }

    // console.log(`[DashboardContext] _executeFinalizationAndSave: Acquiring save lock for message ID ${messageToFinalize.id}.`);
    currentlySavingMessageIdsRef.current.add(messageToFinalize.id);

    try {
      let finalDbId = messageToFinalize.id; // Assume it keeps its temp ID if no DB ID is assigned
      let finalTimestamp = messageToFinalize.timestamp; // Use existing timestamp unless DB provides a new one
      let finalCreatedAt = messageToFinalize.created_at; // Preserve if already set

      // Determine if this is a new message (temp ID, no created_at) or an update to an existing one (has created_at)
      const isNewMessage = messageToFinalize.id.startsWith('msg-agent-'); // Heuristic for temp IDs
      // console.log(`[DashboardContext] _executeFinalizationAndSave: Message ${messageToFinalize.id} - isNewMessage: ${isNewMessage}`);

      const payload: Partial<Message> & { originalMessageId?: string } = {
        thread_id: threadId,
        sender: messageToFinalize.sender,
        text: messageToFinalize.replyContent || messageToFinalize.text || '', // Prefer replyContent, then text
        thinkContent: messageToFinalize.thinkContent,
        replyContent: messageToFinalize.replyContent,
        thinkDuration: messageToFinalize.thinkDuration,
        toolCalls: messageToFinalize.toolCalls, // <--- ADDED toolCalls to payload
        timestamp: new Date(messageToFinalize.timestamp).toISOString(), // Ensure ISO string for backend
      };

      if (isNewMessage) {
        payload.originalMessageId = messageToFinalize.id; // Send the temp ID for mapping if it's a new message
        // console.log(`[DashboardContext] _executeFinalizationAndSave: POSTing new message ${messageToFinalize.id}. Payload:`, payload);
      } else {
        // This is an update to an existing message, use its existing ID in the URL
        // console.log(`[DashboardContext] _executeFinalizationAndSave: PUTting existing message ${messageToFinalize.id}. Payload:`, payload);
      }

      console.log(`[DashboardContext] _executeFinalizationAndSave: About to POST to /api/messages for originalMessageId: ${messageToFinalize.id}, Payload:`, JSON.parse(JSON.stringify(payload)));

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Failed to save agent message, server response not JSON.'}));
        throw new Error(errData.message || `Server error saving agent message: ${response.status} for original ID ${messageToFinalize.id}`);
      }
      const dbSavedMessage: Message = await response.json();
      // console.log(`[DashboardContext] Agent message saved to DB successfully for original ID ${messageToFinalize.id}. DB Response:`, JSON.parse(JSON.stringify(dbSavedMessage)));
      
      finalCreatedAt = dbSavedMessage.created_at || dbSavedMessage.timestamp;
      finalDbId = dbSavedMessage.id; // Use ID from DB response

      if (!finalDbId) {
        console.error(`[DashboardContext] _executeFinalizationAndSave: DB did not return an ID for message with original ID ${messageToFinalize.id}.`);
        throw new Error(`DB did not return an ID for message with original ID ${messageToFinalize.id}.`);
      }

      debugSetMessagesByThreadId(prev => {
        const currentMessages = prev[threadId] || [];
        console.log(`[DashboardContext] _executeFinalizationAndSave (updater): originalMessageId: ${messageToFinalize.id}, finalDbId: ${finalDbId}`);
        console.log(`[DashboardContext] _executeFinalizationAndSave (updater): currentMessages for ${threadId} (before update - ${currentMessages.length} items):`,
          currentMessages.map(m => ({id: m.id, text: m.text?.substring(0,20), created_at: m.created_at, isStreaming: m.isStreaming }))
        );

        // Step 1: Remove the original placeholder message (using originalMessageId)
        let intermediateMessages = currentMessages.filter(msg => msg.id !== messageToFinalize.id);
        
        // Step 2: Remove any existing message that might already have the finalDbId (defensive)
        // This is crucial if the updater function itself runs multiple times for the same logical operation
        intermediateMessages = intermediateMessages.filter(msg => msg.id !== finalDbId);
        
        const messageToAddOrUpdate: Message = { 
          ...messageToFinalize, // Start with locally finalized content
          id: finalDbId, // CRITICAL: Use the ID from the database
          text: dbSavedMessage.text || '', // Use text from DB, ensure it's a string
          timestamp: new Date(dbSavedMessage.timestamp), 
          created_at: finalCreatedAt ? new Date(finalCreatedAt) : undefined, // Ensure Date object
          user_id: dbSavedMessage.user_id || messageToFinalize.user_id,
          thread_id: dbSavedMessage.thread_id || messageToFinalize.thread_id,
          thinkContent: dbSavedMessage.thinkContent, // Use thinkContent from DB
          replyContent: dbSavedMessage.replyContent, // Use replyContent from DB
          // @ts-ignore
          thinkDuration: dbSavedMessage.thinkDuration, // Use thinkDuration from DB
          toolCalls: dbSavedMessage.toolCalls, // <--- SET toolCalls from DB response
          isStreaming: false, // Ensure these are false
          isThinking: false,  // Ensure these are false
        };
        
        const updatedMessages = [...intermediateMessages, messageToAddOrUpdate];
        updatedMessages.sort((a, b) => (new Date(a.timestamp)).getTime() - (new Date(b.timestamp)).getTime());

        console.log(`[DashboardContext] _executeFinalizationAndSave (updater): Final updatedMessages list for ${threadId} (${updatedMessages.length} items, new/updated ID ${finalDbId}):`,
          updatedMessages.map(m => ({id: m.id, text: m.text?.substring(0,20), created_at: m.created_at, isStreaming: m.isStreaming }))
        );

        return {
          ...prev,
          [threadId]: updatedMessages,
        };
      }, `_executeFinalizationAndSave-DB保存(origID:${messageToFinalize.id},finalID:${finalDbId})`);

      setThreads(prevThreads => prevThreads.map(t => 
        t.id === threadId ? { ...t, lastUpdated: new Date(dbSavedMessage.timestamp) } : t
      ).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()));

    } catch (e: any) { // This is the main catch block for the function, now also catching DB errors
      console.error(`[DashboardContext] _executeFinalizationAndSave: Error during process for originalMessageId ${messageToFinalize.id}:`, e);
      setError(e.message || `Failed to process and save agent message (original ID ${messageToFinalize.id}).`);
      // Fallback: update the local message state to non-streaming/thinking using the original ID
      // This ensures the UI doesn't get stuck in a streaming state if DB save fails.
      debugSetMessagesByThreadId(prev => {
        const currentMessages = prev[threadId] || [];
        const messageExists = currentMessages.some(msg => msg.id === messageToFinalize.id);
        if (!messageExists) return prev; // Don't modify if message isn't there

        return {
          ...prev,
          [threadId]: currentMessages.map(msg => 
            msg.id === messageToFinalize.id 
            ? { 
                ...messageToFinalize, // Use the snapshot passed to the function
                id: messageToFinalize.id, // Ensure original ID is used
                isStreaming: false, 
                isThinking: false,
                text: messageToFinalize.replyContent || messageToFinalize.thinkContent || "Error: Could not save to server." // Update text on error
              } 
            : msg
          ),
        };
      }, `_executeFinalizationAndSave-OuterCatchError(origID:${messageToFinalize.id})`);
    } finally {
      currentlySavingMessageIdsRef.current.delete(messageToFinalize.id);
      console.log(`[DashboardContext] _executeFinalizationAndSave: LOCK RELEASED for ${messageToFinalize.id} in currentlySavingMessageIdsRef`);
    }
  }, [setError, setThreads, debugSetMessagesByThreadId]); // debugSetMessagesByThreadId instead of setMessagesByThreadId

  // New public trigger function
  const finalizeAgentMessageStreaming = useCallback((threadId: string, messageId: string) => {
    console.log(`[DashboardContext] finalizeAgentMessageStreaming CALLED. messageId: ${messageId}, Current finalizingMessageIds:`, Array.from(finalizingMessageIdsRef.current));
    if (finalizingMessageIdsRef.current.has(messageId)) {
      console.warn(`[DashboardContext] finalizeAgentMessageStreaming: LOCK HIT for messageId: ${messageId}. Skipping duplicate trigger.`);
      return;
    }

    console.log(`[DashboardContext] finalizeAgentMessageStreaming: LOCK ACQUIRED for messageId: ${messageId}.`);
    finalizingMessageIdsRef.current.add(messageId);

    debugSetMessagesByThreadId(prev => {
      const currentThreadMessages = prev[threadId] || [];
      const messageToFinalize = currentThreadMessages.find(msg => msg.id === messageId);

      if (!messageToFinalize) {
        console.error(`[DashboardContext] finalizeAgentMessageStreaming (updater): Agent message with ID ${messageId} not found in LATEST state for thread ${threadId}. Cannot finalize. Releasing lock.`);
        console.log(`[DashboardContext] finalizeAgentMessageStreaming (updater): Current finalizingMessageIds before delete due to not found:`, Array.from(finalizingMessageIdsRef.current));
        finalizingMessageIdsRef.current.delete(messageId); // Release lock if message not found
        console.log(`[DashboardContext] finalizeAgentMessageStreaming (updater): Current finalizingMessageIds after delete due to not found:`, Array.from(finalizingMessageIdsRef.current));
        return prev; // Return original state if not found
      }
      
      console.log(`[DashboardContext] finalizeAgentMessageStreaming (updater): Found messageToFinalize. ID: ${messageToFinalize.id}. Attempting to call _executeFinalizationAndSave.`);
      _executeFinalizationAndSave(threadId, { ...messageToFinalize }) // Pass a copy
        .catch(err => {
          console.error(`[DashboardContext] Error during _executeFinalizationAndSave for message ${messageId}:`, err);
        })
        .finally(() => {
          console.log(`[DashboardContext] finalizeAgentMessageStreaming: _executeFinalizationAndSave PROMISE FINISHED for messageId: ${messageId}. Releasing lock. Current finalizingMessageIds before delete:`, Array.from(finalizingMessageIdsRef.current));
          finalizingMessageIdsRef.current.delete(messageId);
          console.log(`[DashboardContext] finalizeAgentMessageStreaming: Lock released. Current finalizingMessageIds after delete:`, Array.from(finalizingMessageIdsRef.current));
        });
      return prev;
    }, `finalizeAgentMessageStreaming-trigger-${messageId}`);
  }, [_executeFinalizationAndSave, debugSetMessagesByThreadId, setError]);

  const appendChunkToAgentMessage = useCallback((threadId: string, messageId: string, rawChunkOrJsonLine: string) => {
    // console.log(`[DashboardContext] appendChunkToAgentMessage called for msg ${messageId} in thread ${threadId}. Chunk:`, rawChunkOrJsonLine);
    debugSetMessagesByThreadId(prev => {
      const threads = { ...prev };
      const messages = [...(threads[threadId] || [])];
      const messageIndex = messages.findIndex(m => m.id === messageId);

      if (messageIndex === -1) {
        console.warn(`[DashboardContext] appendChunkToAgentMessage: Message ID ${messageId} not found in thread ${threadId}. Chunk ignored.`);
        return prev;
      }

      let message = { ...messages[messageIndex] }; // Use let as message will be reassigned or modified

      try {
        // rawChunkOrJsonLine is expected to be a single, complete JSON string (a line) from ChatArea.tsx
        const update = JSON.parse(rawChunkOrJsonLine);

        // Original logic for updating the message based on 'update' START (will be refined later if needed)
        if (update.isThinking !== undefined) {
          if (message.isThinking === true && update.isThinking === false) { // Transitioning from thinking to not thinking
            if (message.thinkStartTimestamp) {
              message.thinkDuration = Date.now() - message.thinkStartTimestamp;
            }
          }
          message.isThinking = update.isThinking;
          if (update.isThinking && !message.thinkStartTimestamp) {
            message.thinkStartTimestamp = Date.now();
          }
        }

        if (update.thinkContent) {
          message.thinkContent = (message.thinkContent && message.thinkContent !== "正在处理您的请求，与大模型通信中..." ? message.thinkContent : "") + update.thinkContent;
          message.isThinking = true; 
          if (!message.thinkStartTimestamp) {
            message.thinkStartTimestamp = Date.now();
          }
        }

        if (update.replyContent) {
          message.replyContent = (message.replyContent || "") + update.replyContent;
        }
        
        // Handle structured tool calls data from API
        if (update.toolCallsData && Array.isArray(update.toolCallsData)) {
          if (!message.toolCalls) {
            message.toolCalls = [];
          }
          // Append new tool calls from the current chunk
          message.toolCalls = [...message.toolCalls, ...update.toolCallsData];
          // Typically, if we receive tool calls, the agent is in a thinking phase.
          message.isThinking = true; 
          if (!message.thinkStartTimestamp) {
            message.thinkStartTimestamp = Date.now();
          }
        }

        message.timestamp = new Date(); 
        message.isStreaming = true;   
        // Original logic END

        messages[messageIndex] = message;
        threads[threadId] = messages;
        return threads;

      } catch (e) {
        console.error(`[DashboardContext] appendChunkToAgentMessage: Failed to parse JSON line for message ${messageId}. Line: '${rawChunkOrJsonLine}'. Error:`, e);
        return prev; // Return previous state to avoid applying a partially failed update or polluting content
      }
    }, `appendChunkToAgentMessage for msg ${messageId}`);
  }, [debugSetMessagesByThreadId]);

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
    debugSetMessagesByThreadId,
    _executeFinalizationAndSave,
    handleDeleteThread,
  }), [
    threads, activeThreadId, messagesByThreadId, activityLog, isSidebarOpen,
    addMessageToThread, addActivity, updateActivity, clearActivityLog, toggleSidebar,
    setThreads, setActiveThreadId, setMessagesByThreadId, appendChunkToAgentMessage, finalizeAgentMessageStreaming,
    isLoadingThreads, isLoadingMessages, error, clearError, debugSetMessagesByThreadId, _executeFinalizationAndSave,
    handleDeleteThread,
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