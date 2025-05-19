import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure your environment variables are correctly set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.");
  // Optionally, throw an error or handle it as appropriate for your application startup
}
if (!supabaseServiceRoleKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
  // Optionally, throw an error or handle it as appropriate for your application startup
}

// Create a Supabase client with service_role permissions for admin tasks
// This client bypasses RLS and should be used with extreme caution and only in secure server-side environments.
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

export async function DELETE(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;

  if (!supabaseAdmin) {
    console.error("[API DELETE /threads/:threadId] Supabase admin client is not initialized. Check environment variables.");
    return NextResponse.json(
      { message: 'Server configuration error: Supabase admin client not initialized.' }, 
      { status: 500 }
    );
  }

  if (!threadId) {
    return NextResponse.json(
      { message: 'Thread ID is required' },
      { status: 400 }
    );
  }

  console.log(`[API] Attempting to delete thread with ID: ${threadId} using Supabase Client SDK`);

  try {
    // 1. Delete all messages associated with the thread
    // Ensure 'messages' is your table name and 'thread_id' is the foreign key column
    const { error: messagesError } = await supabaseAdmin
      .from('messages') 
      .delete()
      .eq('thread_id', threadId);

    if (messagesError) {
      console.error(`[API] Supabase error deleting messages for thread ${threadId}:`, messagesError);
      throw new Error(`Failed to delete messages: ${messagesError.message}`);
    }
    console.log(`[API] Successfully deleted messages for thread ${threadId}`);

    // 2. Delete the thread itself
    // Ensure 'threads' is your table name
    const { error: threadError, data: deletedThreadData } = await supabaseAdmin
      .from('threads')
      .delete()
      .eq('id', threadId)
      .select(); // Using .select() to check if a row was actually deleted, useful for 404 if not found

    if (threadError) {
      console.error(`[API] Supabase error deleting thread ${threadId}:`, threadError);
      // Check for specific Supabase/PostgREST errors if needed, e.g., foreign key violations if messages weren't deleted
      throw new Error(`Failed to delete thread: ${threadError.message}`);
    }

    if (!deletedThreadData || deletedThreadData.length === 0) {
        console.log(`[API] Thread with ID ${threadId} not found for deletion.`);
        return NextResponse.json(
            { message: 'Thread not found' },
            { status: 404 }
        );
    }

    console.log(`[API] Successfully deleted thread: ${threadId}, Data:`, deletedThreadData);
    return NextResponse.json(
      { message: 'Thread and associated messages deleted successfully', thread: deletedThreadData[0] },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`[API] Overall error deleting thread ${threadId}:`, error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete thread.', details: error.stack || JSON.stringify(error) },
      { status: 500 }
    );
  }
}

// Optional: GET handler if you need to fetch a single thread by ID
export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;
  if (!supabaseAdmin) {
    console.error("[API GET /threads/:threadId] Supabase admin client is not initialized. Check environment variables.");
    return NextResponse.json(
      { message: 'Server configuration error: Supabase admin client not initialized.' }, 
      { status: 500 }
    );
  }
  if (!threadId) {
    return NextResponse.json({ message: 'Thread ID is required' }, { status: 400 });
  }
  try {
    const { data: thread, error } = await supabaseAdmin
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single(); // Use .single() if you expect one or zero rows

    if (error && error.code !== 'PGRST116') { // PGRST116: Row not found (handled by !thread)
        throw error;
    }
    if (!thread) {
      return NextResponse.json({ message: 'Thread not found' }, { status: 404 });
    }
    return NextResponse.json(thread, { status: 200 });
  } catch (error: any) {
    console.error(`[API] Error fetching thread ${threadId}:`, error);
    return NextResponse.json({ message: 'Failed to fetch thread' , details: error.message }, { status: 500 });
  }
} 