import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Message } from '@/contexts/DashboardContext'; // Assuming Message type is accessible
// Removed: import { OpenAIStream, StreamingTextResponse } from 'ai';
// Removed: import type { ChatCompletionCreateParams } from 'openai/resources/chat/completions';

// Define the expected request body structure
interface AgentRequestBody {
  messages: Message[];
  // Potentially add other parameters like activeThreadId if needed by the backend logic later
}

// System prompt to guide the LLM
const SYSTEM_PROMPT = `You are EvoWork Agent, a helpful and versatile AI assistant.
When you need to think step-by-step, or lay out a plan before providing the final answer to the user,
YOU MUST encapsulate this internal monologue or thought process within <think>...</think> tags.
For example:
User: How do I bake a cake?
Agent:
<think>
The user wants to bake a cake. I should provide a simple recipe.
1. Gather ingredients: flour, sugar, eggs, butter, baking powder, milk.
2. List steps: preheat oven, mix dry, mix wet, combine, bake.
3. Add tips: check with toothpick.
</think>
To bake a cake, you'll generally need to... (rest of the answer)

After the </think> block, provide the direct and complete answer to the user's query.
Your responses should be informative, concise, and helpful.
If you are asked to perform a task that implies using a tool (e.g., web search, data analysis) that you cannot *actually* perform, clearly state your intention or the outcome *as if* you have performed it, but ensure the user understands you are describing a hypothetical or past action if it's not a real-time capability you possess in this text-based interaction. For example, if asked to search, you can say: "If I were to search for [topic], I would expect to find..." or "Let me describe what a search for that might yield." 
Avoid claiming to perform real-time actions you cannot execute.
Maintain a professional and friendly tone.`;

export async function POST(req: NextRequest) {
  console.log('[API /api/chat/agent] Received request for yaoluu.com proxy at:', new Date().toISOString());
  try {
    const { messages: chatHistory } = (await req.json()) as AgentRequestBody;
    console.log('[API /api/chat/agent] Request body:', { chatHistory });

    const apiKey = process.env.LLM_API_KEY;
    const baseURL = process.env.LLM_BASE_URL; // Should be yaoluu.com
    const modelName = process.env.LLM_MODEL_NAME;

    if (!apiKey || !baseURL || !modelName) {
      console.error('[API /api/chat/agent] Error: LLM service not configured. Missing API key, base URL, or model name for yaoluu.com.');
      return NextResponse.json(
        { success: false, error: 'LLM service not configured. Missing API key, base URL, or model name.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    console.log(`[API /api/chat/agent] Preparing to call LLM at ${baseURL} with model ${modelName}.`);

    const llmMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
      ...chatHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text, // Assuming your message object has a 'text' property
      } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam)),
    ];

    console.log('[API /api/chat/agent] LLM request body:', JSON.stringify(llmMessages, null, 2));

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: llmMessages,
      stream: true,
    });
    console.log('[API /api/chat/agent] Successfully received stream from LLM.');

    const readableWebStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        console.log('[API /api/chat/agent] Stream: Starting to process chunks.');
        for await (const part of completion) {
          const textChunk = part.choices[0]?.delta?.content || "";
          if (textChunk) {
            // console.log('[API /api/chat/agent] Stream: Sending chunk:', textChunk); // Can be verbose
            controller.enqueue(encoder.encode(textChunk));
          }
          if (part.choices[0]?.finish_reason) {
            console.log('[API /api/chat/agent] Stream: Finished with reason:', part.choices[0].finish_reason);
            controller.close();
            return;
          }
        }
        console.log('[API /api/chat/agent] Stream: Loop finished, closing controller.');
        controller.close(); 
      },
      cancel() {
        console.log("[API /api/chat/agent] Stream: Cancelled by client.");
      }
    });

    return new Response(readableWebStream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
       },
    });

  } catch (error: any) {
    console.error('[API /api/chat/agent] Error in POST handler:', error);
    let errorMessage = 'An unexpected error occurred.';
    let errorStatus = 500;

    if (error.response) { // Error from OpenAI-like API (e.g. yaoluu.com returning an error object)
      console.error('[API /api/chat/agent] LLM API Error Response Status:', error.response.status);
      console.error('[API /api/chat/agent] LLM API Error Response Data:', error.response.data);
      errorMessage = `LLM API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`;
      errorStatus = error.response.status || 500;
    } else if (error.status) { // Error from OpenAI SDK (if it throws a status-like error)
        console.error('[API /api/chat/agent] SDK Error Status:', error.status);
        console.error('[API /api/chat/agent] SDK Error Message:', error.message);
        errorMessage = error.message;
        errorStatus = error.status;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: errorStatus }
    );
  }
} 