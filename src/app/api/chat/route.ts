import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/contexts/DashboardContext'; // Assuming Message type is exported from DashboardContext

export const dynamic = 'force-dynamic';

const LLM_BASE_URL = process.env.LLM_BASE_URL;
const LLM_MODEL_NAME = process.env.LLM_MODEL_NAME;
const LLM_API_KEY = process.env.LLM_API_KEY; // Can be undefined if not needed

interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{ // For models that support tool calling (OpenAI style)
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string; // For tool responses
}

// Helper to transform our Message interface to LLMMessage interface
function transformMessagesForLLM(messages: Message[]): LLMMessage[] {
  console.log("[API /chat] transformMessagesForLLM: Input client messages:", messages);
  const llmMessages: LLMMessage[] = [];
  // You might want a system message if your LLM supports/requires it
  // llmMessages.push({ role: "system", content: "You are a helpful assistant." }); 

  messages.forEach(msg => {
    if (msg.sender === 'user') {
      llmMessages.push({ role: 'user', content: msg.text });
    } else if (msg.sender === 'agent' && msg.replyContent) {
      llmMessages.push({ role: 'assistant', content: msg.replyContent });
    } else if (msg.sender === 'agent' && !msg.replyContent && msg.text) {
      // Fallback for older agent messages that might only have `text` populated after streaming
      // but before full finalization if `replyContent` wasn't the primary field during streaming.
      // This might be less relevant with the new streaming logic that populates replyContent directly.
      llmMessages.push({ role: 'assistant', content: msg.text }); 
    }
    // Add handling for tool calls and tool responses if your Message type includes them
  });
  console.log("[API /chat] transformMessagesForLLM: Output LLM messages:", llmMessages);
  return llmMessages;
}

export async function POST(req: NextRequest) {
  console.log("[API /chat] Received POST request.");
  console.log(`[API /chat] Environment variables: LLM_BASE_URL=${LLM_BASE_URL}, LLM_MODEL_NAME=${LLM_MODEL_NAME}, LLM_API_KEY_PRESENT=${!!LLM_API_KEY}`);

  if (!LLM_BASE_URL || !LLM_MODEL_NAME) {
    console.error("[API /chat] Critical Error: LLM_BASE_URL or LLM_MODEL_NAME is not configured in environment variables.");
    return NextResponse.json(
      { error: "Server configuration error: LLM endpoint or model not configured." }, 
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    console.log("[API /chat] Request body parsed:", body);
    const clientMessages: Message[] = body.messages || [];
    
    if (!clientMessages || clientMessages.length === 0) {
      console.warn("[API /chat] No messages provided in request body.");
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const llmMessages = transformMessagesForLLM(clientMessages);

    const llmPayload = {
      model: LLM_MODEL_NAME,
      messages: llmMessages,
      stream: true,
      // temperature: 0.7, // Example: uncomment and set if needed
      // tools: [/* your tool definitions */] // Example: uncomment and set if needed
    };

    console.log("[API /chat] Sending this payload to LLM:", JSON.stringify(llmPayload, null, 2));

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LLM_API_KEY && { 'Authorization': `Bearer ${LLM_API_KEY}` }),
      },
      body: JSON.stringify(llmPayload),
    };
    
    console.log(`[API /chat] Attempting to fetch LLM from URL: ${LLM_BASE_URL}/chat/completions`);
    const llmResponse = await fetch(`${LLM_BASE_URL}/chat/completions`, fetchOptions);
    console.log(`[API /chat] LLM response status: ${llmResponse.status}`);

    if (!llmResponse.ok) {
      const errorBody = await llmResponse.text();
      console.error(`[API /chat] LLM API request failed with status ${llmResponse.status}. Error Body:`, errorBody);
      return NextResponse.json(
        { error: `LLM API error: ${llmResponse.statusText}`, details: errorBody }, 
        { status: llmResponse.status }
      ); // Return status from LLM API if possible
    }

    if (!llmResponse.body) {
      console.error("[API /chat] LLM response has no body, though status was ok.");
      return NextResponse.json({ error: 'LLM response has no body' }, { status: 500 });
    }
    console.log("[API /chat] LLM response received, preparing to stream...");

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let accumulatedThinkContent = "";
    let thinkingPhaseDone = false;
    let hadToolCallsInStream = false; // Tracks if any tool_call was encountered

    const stream = new ReadableStream({
      async start(controller) {
        const reader = llmResponse.body!.getReader();

        function processText({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> {
          if (done) {
            console.log("[API /chat] LLM stream finished (reader.read() returned done: true).");
            if (!thinkingPhaseDone && accumulatedThinkContent && accumulatedThinkContent.trim() !== '') {
                console.log("[API /chat] Stream ended during thinking phase, sending final accumulated thinkContent.");
                controller.enqueue(encoder.encode(JSON.stringify({
                    isThinking: false, 
                    thinkContent: accumulatedThinkContent + "\n思考完成。",
                }) + '\n'));
            }
            controller.close();
            return Promise.resolve();
          }

          const chunk = decoder.decode(value, { stream: true });
          // console.log("[API /chat] Raw LLM stream chunk received:", chunk); 

          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            // console.log("[API /chat] Processing line from LLM chunk:", line);
            if (line.startsWith('data: ')) {
              const jsonData = line.substring(5).trim();
              if (jsonData === '[DONE]') {
                console.log("[API /chat] LLM stream signaled [DONE]. Finalizing.");
                 if (!thinkingPhaseDone && accumulatedThinkContent && accumulatedThinkContent.trim() !== '') {
                    console.log("[API /chat] [DONE] signaled during thinking phase, sending final accumulated thinkContent.");
                    controller.enqueue(encoder.encode(JSON.stringify({
                        isThinking: false,
                        thinkContent: accumulatedThinkContent + "\n思考完成。",
                    }) + '\n'));
                }
                controller.close();
                return Promise.resolve();
              }
              try {
                const parsed = JSON.parse(jsonData);
                // console.log("[API /chat] Parsed LLM JSON data from line:", parsed);
                
                const choice = parsed.choices && parsed.choices[0];
                if (choice && choice.delta) {
                  const delta = choice.delta;
                  
                  if (delta.tool_calls && delta.tool_calls.length > 0) {
                    console.log("[API /chat] Delta contains tool_calls:", delta.tool_calls);
                    hadToolCallsInStream = true;
                    thinkingPhaseDone = false; // Explicitly in thinking phase

                    let toolThinkChunk = "";
                    delta.tool_calls.forEach((toolCall: any) => {
                        if (toolCall.function && toolCall.function.name) {
                            toolThinkChunk += `正在尝试使用工具: ${toolCall.function.name}\n`;
                            if (toolCall.function.arguments) {
                                try {
                                    const args = JSON.parse(toolCall.function.arguments);
                                    let argString = JSON.stringify(args, null, 2);
                                    // SECURITY: Ensure no harmful tags are injected if args are displayed raw
                                    argString = argString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[removed]");
                                    toolThinkChunk += `参数: ${argString}\n`;
                                } catch (e) {
                                    let rawArgs = toolCall.function.arguments;
                                    rawArgs = rawArgs.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[removed]");
                                    toolThinkChunk += `参数 (原始): ${rawArgs}\n`;
                                }
                            }
                        }
                    });

                    if (toolThinkChunk) {
                        accumulatedThinkContent += toolThinkChunk; 
                        // console.log("[API /chat] Enqueuing tool_call based thinkContent to client:", toolThinkChunk);
                        controller.enqueue(encoder.encode(JSON.stringify({ 
                            isThinking: true, // Tool calls mean we are thinking
                            thinkContent: toolThinkChunk 
                        }) + '\n'));
                        // Also send the structured tool_calls data
                        controller.enqueue(encoder.encode(JSON.stringify({
                            toolCallsData: delta.tool_calls // Send the raw tool_calls array from LLM
                        }) + '\n'));

                        hadToolCallsInStream = true; 
                        thinkingPhaseDone = false; // Reset thinkingPhaseDone as we are actively producing thoughts
                    }
                  } else if (typeof delta.content === 'string') { // Ensure delta.content exists and is a string
                    let rawContent = delta.content;
                    let thinkForThisChunk = "";
                    let replyForThisChunk = "";
                
                    const thinkTagStart = "<think>";
                    const thinkTagEnd = "</think>";
                    let contentCursor = 0;
                
                    while(contentCursor < rawContent.length) {
                        const nextThinkStart = rawContent.indexOf(thinkTagStart, contentCursor);
                        if (nextThinkStart !== -1) {
                            // Content before <think> is reply
                            replyForThisChunk += rawContent.substring(contentCursor, nextThinkStart);
                            const nextThinkEnd = rawContent.indexOf(thinkTagEnd, nextThinkStart + thinkTagStart.length);
                            if (nextThinkEnd !== -1) {
                                // Content inside <think>...</think> is think
                                thinkForThisChunk += rawContent.substring(nextThinkStart + thinkTagStart.length, nextThinkEnd);
                                contentCursor = nextThinkEnd + thinkTagEnd.length;
                            } else {
                                // Unclosed <think> tag, treat the rest of the content (including the tag itself) as reply
                                replyForThisChunk += rawContent.substring(nextThinkStart);
                                contentCursor = rawContent.length;
                            }
                        } else {
                            // No more <think> tags, the rest is reply
                            replyForThisChunk += rawContent.substring(contentCursor);
                            contentCursor = rawContent.length;
                        }
                    }
                                    
                    if (thinkForThisChunk.trim() !== "") {
                        accumulatedThinkContent += thinkForThisChunk; 
                        // console.log("[API /chat] Enqueuing <think> parsed thinkContent:", thinkForThisChunk);
                        controller.enqueue(encoder.encode(JSON.stringify({
                            isThinking: true, 
                            thinkContent: thinkForThisChunk
                        }) + '\n'));
                        hadToolCallsInStream = true; // if <think> tags are used, consider it as a form of tool/thought process
                        thinkingPhaseDone = false; // Actively producing thoughts from <think> tags
                    }
                
                    if (replyForThisChunk.trim() !== "") {
                        // console.log("[API /chat] Enqueuing reply part from delta.content:", replyForThisChunk, "Current thinkingPhaseDone:", thinkingPhaseDone);
                        if (!thinkingPhaseDone) {
                            // This is the first reply content encountered (either after thoughts or as initial content)
                            // console.log("[API /chat] First reply chunk after potential thoughts, sending isThinking:false");
                            controller.enqueue(encoder.encode(JSON.stringify({ isThinking: false }) + '\n'));
                            thinkingPhaseDone = true; // Transitioned to reply phase
                        }
                        controller.enqueue(encoder.encode(JSON.stringify({
                            replyContent: replyForThisChunk
                        }) + '\n'));
                    }
                  } // End of delta.content handling
                } // End of if (choice && choice.delta)
              } catch (e) {
                console.error("[API /chat] Error parsing LLM JSON chunk from line:", jsonData, "Error:", e);
              }
            }
          }
          return reader.read().then(processText);
        }
        reader.read().then(processText).catch(err => {
            console.error("[API /chat] Error reading from LLM response stream:", err);
            controller.error(err);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("[API /chat] Overall error in POST handler:", error.message, error.stack);
    return NextResponse.json(
      { error: 'Internal server error while processing chat request', details: error.message }, 
      { status: 500 }
    );
  }
} 