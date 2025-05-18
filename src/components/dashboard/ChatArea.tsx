'use client'; // Add this directive to make it a Client Component
import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/contexts/DashboardContext'; // Import the hook
import type { Message, ActivityEntry } from '@/contexts/DashboardContext'; // Import Message type and ActivityEntry from context
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm for GitHub Flavored Markdown
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Shadcn Accordion components

// Local Message interface definition should be removed
// export interface Message { <-- REMOVE THIS BLOCK
//   id: string;
//   text: string;
//   sender: 'user' | 'agent';
//   timestamp: Date;
// }

// mockMessagesStore is no longer defined here, it's managed by context

// Simple "Agent is typing" component
const AgentTypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.3 }}
    className="flex items-center space-x-2 ml-2 mb-2 self-start w-auto mt-1" // Aligned with agent messages
  >
    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0 animate-pulse"></div> {/* Pulsing avatar placeholder */}
    <div className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-lg max-w-xs">
      <div className="flex space-x-1 items-center">
        <span className="text-sm">Agent is typing</span>
        <div className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  </motion.div>
);

export default function ChatArea() {
  const {
    activeThreadId,
    messagesByThreadId,
    addMessageToThread,
    appendChunkToAgentMessage,
    finalizeAgentMessageStreaming,
    threads,
    addActivity,
    updateActivity,
    clearActivityLog,
  } = useDashboard();

  const [inputValue, setInputValue] = useState('');
  const [isAgentReplying, setIsAgentReplying] = useState(false);
  const userScrolledAwayRef = useRef(false); // New ref

  const currentMessages = activeThreadId ? messagesByThreadId[activeThreadId] || [] : [];
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const showWelcomeMessage = activeThreadId === null;
  
  const activeThreadDetails = activeThreadId ? threads.find(t => t.id === activeThreadId) : null;
  const chatTitle = activeThreadDetails?.title || (activeThreadId ? 'Chat' : 'Welcome'); // Adjusted title logic

  // Auto-scroll effect
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const lastMessage = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;
    // Check if the last message is part of an ongoing agent stream
    const isAgentStreamingNow = lastMessage?.sender === 'agent' && isAgentReplying;

    if (isAgentStreamingNow) {
      // If agent is streaming, only scroll if user hasn't scrolled away
      if (!userScrolledAwayRef.current) {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      // For user messages, or when agent finishes streaming, or initial load of a thread
      container.scrollTop = container.scrollHeight;
      userScrolledAwayRef.current = false; // Reset scroll away status
    }
  }, [currentMessages, isAgentReplying]); // Rerun when messages change or agent replying status changes

  // Scroll event listener effect
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!isAgentReplying || !container) {
        // If agent is not replying, or container is not available, do nothing with userScrolledAwayRef.
        // userScrolledAwayRef will be reset by the main scroll effect when agent is not replying.
        return;
      }
      // Check if user is near the bottom
      const SCROLL_THRESHOLD = 50; // px from bottom
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < SCROLL_THRESHOLD;
      userScrolledAwayRef.current = !isAtBottom;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isAgentReplying]); // Only re-bind listener if isAgentReplying status changes

  useEffect(() => {
    setInputValue('');
    setIsAgentReplying(false);
    userScrolledAwayRef.current = false; // Reset scroll state on active thread change
  }, [activeThreadId]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && activeThreadId) {
      const userMessageText = inputValue.trim();
      const timestamp = new Date();

      // Add user message to context (this also handles DB saving for user message)
      const confirmedUserMessageId = await addMessageToThread(activeThreadId, {
        text: userMessageText,
        sender: 'user',
        timestamp: timestamp,
      });

      if (!confirmedUserMessageId) {
        console.error("User message could not be added or ID not confirmed.");
        // Optionally, display an error to the user in the UI
        // For now, just prevent further processing for this send action
        return; 
      }
      
      // Prepare history for the API call to /api/chat/agent
      // currentMessages reflects the state *before* this new user message was added to the context.
      // So, we explicitly add the new user message to this array for the API call.
      const constructedHistoryForAPI: Message[] = [
        ...currentMessages, 
        {
          id: confirmedUserMessageId, // Use the ID confirmed by the context (could be from DB)
          text: userMessageText,
          sender: 'user',
          timestamp: timestamp,
          // Ensure all other fields from Message interface are present, even if null/default
          thinkContent: null,
          replyContent: null,
          isStreaming: false,
          isThinking: false,
          // thread_id, user_id, created_at etc. are part of DB schema but not strictly Message context type used here for API mapping
        }
      ];

      setInputValue('');
      clearActivityLog();
      setIsAgentReplying(true);

      let agentPrepActivityId: string | null = null;
      let llmStreamActivityId: string | null = null;
      let agentMessageIdToStream: string | null = null; 

      try {
        agentPrepActivityId = addActivity({
          title: 'Agent Preparing Request',
          details: 'Formatting message and history for LLM.',
          status: 'running',
        });

        const response = await fetch('/api/chat/agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: constructedHistoryForAPI }), // Use the constructed history
        });

        updateActivity(agentPrepActivityId, {
          status: 'success',
          result: 'Request prepared and sent to backend.',
        });

        if (!response.ok || !response.body) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
          throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`);
        }
        
        llmStreamActivityId = addActivity({
          title: 'Agent Interacting with LLM',
          details: 'Processing response from Large Language Model...',
          status: 'running',
        });

        agentMessageIdToStream = await addMessageToThread(activeThreadId, {
          sender: 'agent',
          timestamp: new Date(), 
        }, true);

        if (!agentMessageIdToStream) {
          console.error("Failed to create a placeholder for agent message or get its ID.");
          throw new Error("Agent message stream initialization failed.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          if (agentMessageIdToStream && activeThreadId) { // Use the stored agentMessageIdToStream
            appendChunkToAgentMessage(activeThreadId, agentMessageIdToStream, chunk);
          }
        }
        
        if (agentMessageIdToStream && activeThreadId) { // Use the stored agentMessageIdToStream
          finalizeAgentMessageStreaming(activeThreadId, agentMessageIdToStream);
        }

        updateActivity(llmStreamActivityId, {
          status: 'success',
          result: 'LLM stream finished.',
          details: `Received ${accumulatedText.length} characters.`
        });

      } catch (error: any) {
        console.error('Error during LLM communication or streaming:', error);
        const errorMessage = error.message || 'An unknown error occurred.';
        if (agentPrepActivityId && !llmStreamActivityId) {
          updateActivity(agentPrepActivityId, { status: 'error', result: errorMessage });
        } else if (llmStreamActivityId) {
          updateActivity(llmStreamActivityId, { status: 'error', result: errorMessage });
        }
        // Add a system error message to the chat
        if (activeThreadId) {
            // No need to get message ID back here for error message
            addMessageToThread(activeThreadId, {
                text: `Sorry, I encountered an error: ${errorMessage.substring(0, 150)}...`,
                sender: 'system-error', 
                timestamp: new Date(),
            });
        }
      } finally {
        setIsAgentReplying(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25, duration: 0.3 } },
  };

  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-850">
      {/* Header */}
      {!showWelcomeMessage && activeThreadId && (
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate pr-2" title={chatTitle}>
            {chatTitle}
          </h1>
        </header>
      )}

      {/* Messages display area */}
      <div ref={messagesContainerRef} className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/80">
        {showWelcomeMessage ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
            <div className="max-w-md">
              <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-300">Hey</h2>
              <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
                What would you like EvoWork to do today?
              </p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                Select a conversation from the sidebar or start a new one.
              </p>
            </div>
          </div>
        ) : currentMessages.length > 0 ? (
          <motion.div className="w-full">
            {currentMessages.map((msg) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3 md:mb-4`}>
                <div className={`max-w-xl lg:max-w-3xl w-auto message-content-wrapper ${ 
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-xl rounded-br-none shadow-sm px-4 py-2.5' 
                    : msg.sender === 'agent' 
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl shadow-sm px-4 py-2.5 w-full'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg px-4 py-2.5'
                }`}>
                  {msg.sender === 'agent' && (
                    <>
                      <div className="flex items-center mb-2"> 
                        <div className="w-7 h-7 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot text-slate-500 dark:text-slate-400"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">EvoWork Agent</span>
                      </div>
                      <div className="agent-message-container w-full">
                        {(msg.isThinking || msg.thinkContent) && (
                          <Accordion type="single" collapsible className="w-full" defaultValue={(msg.isThinking || (msg.thinkContent && !msg.isStreaming)) ? msg.id : undefined}>
                            <AccordionItem value={msg.id} className="border-b-0">
                              <AccordionTrigger className="py-2 text-sm text-slate-500 dark:text-slate-400 hover:no-underline focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 rounded-t-xl px-2 data-[state=open]:bg-slate-100 data-[state=open]:dark:bg-slate-600">
                                <div className="flex items-center">
                                  {msg.isThinking ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4 mr-1.5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>思考中...</span>
                                    </>
                                  ) : (
                                    <span className="ml-0">已完成思考 (用时 {(msg.thinkDuration || 0 / 1000).toFixed(1)}秒)</span>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-2 px-2 think-content-details prose dark:prose-invert max-w-none bg-slate-100 dark:bg-slate-600 rounded-b-xl">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.thinkContent || ''}</ReactMarkdown>
                                {msg.isStreaming && msg.isThinking && (
                                  <span className="inline-block w-1 h-4 ml-1 bg-slate-600 dark:bg-slate-400 animate-pulse_custom_caret"></span>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                        {(msg.replyContent || (!msg.thinkContent && !msg.isThinking && msg.text)) && (
                          <div className="reply-content prose dark:prose-invert max-w-none pt-3 px-1 prose-p:mb-4 prose-p:leading-relaxed prose-headings:mt-6 prose-headings:mb-4 prose-li:mb-3 prose-ul:my-4 prose-ol:my-4 prose-hr:my-6 prose-blockquote:my-6 prose-blockquote:pl-4 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.replyContent || ((!msg.isStreaming && !msg.isThinking && !msg.thinkContent) ? msg.text : '')}
                            </ReactMarkdown>
                            {msg.isStreaming && !msg.isThinking && ( 
                              <span className="inline-block w-1 h-4 ml-1 bg-slate-600 dark:bg-slate-400 animate-pulse_custom_caret"></span>
                            )}
                          </div>
                        )}
                         {msg.isStreaming && !msg.thinkContent && !msg.replyContent && msg.text.length === 0 && !msg.isThinking &&(
                           <p className="text-sm whitespace-pre-wrap break-words"><span className="inline-block w-1 h-4 ml-1 bg-slate-600 dark:bg-slate-400 animate-pulse_custom_caret"></span></p>
                         )}
                      </div>
                    </>
                  )}

                  {/* User Message (direct rendering) */}
                  {msg.sender === 'user' && (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  )}

                  {/* System Error Message (direct rendering with Markdown) */}
                  {msg.sender === 'system-error' && (
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  )}
                  
                  {/* Timestamp (common for user and agent, but not for system-error) */}
                  {msg.sender !== 'system-error' && (
                    <p className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-blue-100/80' : 'text-slate-400 dark:text-slate-500'} text-right`}>
                      {(typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // This case: active chat but no messages yet
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
             <p className="text-slate-500 dark:text-slate-400">
                No messages in this chat yet. Send a message to start the conversation!
             </p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="relative flex items-end">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={activeThreadId ? "Send a message... (Shift+Enter for new line)" : "Select or start a new chat to send a message..."}
            className="flex-1 p-3 pr-20 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:text-white resize-none leading-tight max-h-32 min-h-[2.5rem] text-sm"
            rows={1}
            disabled={!activeThreadId || isAgentReplying} // Also disable input while agent is replying
            autoFocus // Auto-focus the textarea when available
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !activeThreadId || isAgentReplying} // Disable send button while agent is replying
            className="absolute right-3 bottom-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
} 