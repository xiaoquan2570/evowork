import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Message } from '@/contexts/DashboardContext'; // Assuming Message type is accessible

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
  try {
    const { messages: chatHistory } = (await req.json()) as AgentRequestBody;

    const apiKey = process.env.LLM_API_KEY;
    const baseURL = process.env.LLM_BASE_URL;
    const modelName = process.env.LLM_MODEL_NAME;

    if (!apiKey || !baseURL || !modelName) {
      return NextResponse.json(
        { success: false, error: 'LLM service not configured. Missing API key, base URL, or model name.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    // Transform our Message[] to OpenAI's format { role, content }
    // and prepend the system prompt.
    const llmMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
      ...chatHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam)),
    ];

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: llmMessages,
      stream: true, // ENABLE STREAMING
    });

    // Create a ReadableStream to send back to the client
    const readableWebStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const part of completion) {
          const textChunk = part.choices[0]?.delta?.content || "";
          if (textChunk) {
            controller.enqueue(encoder.encode(textChunk));
          }
          // Check if the stream is finished (optional, part.choices[0]?.finish_reason)
          if (part.choices[0]?.finish_reason) {
            // console.log("Stream finished with reason:", part.choices[0].finish_reason);
            controller.close(); // Close the stream when the LLM indicates completion
            return;
          }
        }
        // Fallback close if the loop finishes without a finish_reason (should ideally not happen with well-behaved LLMs)
        controller.close(); 
      },
      cancel() {
        // This is called if the client aborts the request (e.g., closes the tab)
        // console.log("Stream cancelled by client.");
        // You might want to add logic here to signal the OpenAI stream to cancel if possible,
        // though OpenAI.Chat.Completions.ChatCompletionดูแลเรื่องนี้ภายในตัวมันเองเมื่อ for-await loop ถูกยกเลิก
      }
    });

    return new Response(readableWebStream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff', // Mitigate MIME type sniffing security risks
        'Cache-Control': 'no-cache', // Ensure no caching of the stream
       },
    });

  } catch (error: any) {
    console.error('[API/CHAT/AGENT] Error:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error.response) {
      errorMessage = `LLM API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 