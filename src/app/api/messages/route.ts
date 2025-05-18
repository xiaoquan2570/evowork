import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'; // Adjust path if needed
import type { Message } from '@/contexts/DashboardContext'; // Assuming your Message type is here

// Helper function to get user and validate thread ownership (optional, but good practice)
async function getUserAndThread(supabase: any, threadId: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw { message: 'User not authenticated.', status: 401 };
  }

  // Optional: Verify the user owns the thread before fetching/inserting messages
  // This adds an extra layer of security if RLS on messages table only checks messages.user_id
  // and not necessarily the thread's user_id directly for all operations.
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('id, user_id')
    .eq('id', threadId)
    .eq('user_id', user.id) // Ensure the thread belongs to the current user
    .single();

  if (threadError || !thread) {
    throw { message: 'Thread not found or user does not have access.', status: 404 };
  }
  
  return { user, thread };
}


export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('threadId');

  if (!threadId) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
  }

  try {
    const { user } = await getUserAndThread(supabase, threadId); // Validates user and thread access

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      // .eq('user_id', user.id) // This is implicitly handled by RLS if messages.user_id is set correctly
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(messages);
  } catch (e: any) {
    console.error(`Error in GET /api/messages (threadId: ${threadId}):`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: e.status || 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  
  try {
    const messageData = await request.json() as Partial<Message & { thread_id: string }>;

    if (!messageData.thread_id) {
      return NextResponse.json({ error: 'thread_id is required in the message payload.' }, { status: 400 });
    }
    if (!messageData.sender) {
      return NextResponse.json({ error: 'sender is required in the message payload.' }, { status: 400 });
    }
     if (!messageData.timestamp) { // Ensure timestamp is provided
      return NextResponse.json({ error: 'timestamp is required in the message payload.' }, { status: 400 });
    }


    const { user } = await getUserAndThread(supabase, messageData.thread_id); // Validates user and thread access

    // Prepare data for insertion, ensuring user_id is set for RLS
    const messageToInsert = {
      thread_id: messageData.thread_id,
      user_id: user.id, // Crucial for RLS on messages table
      sender: messageData.sender,
      timestamp: new Date(messageData.timestamp).toISOString(), // Ensure ISO string format for timestamptz
      text: messageData.text || null,
      think_content: messageData.thinkContent || null,
      reply_content: messageData.replyContent || null,
      think_duration: messageData.thinkDuration || null,
    };

    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert([messageToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update the 'last_updated' field of the parent thread
    const { error: threadUpdateError } = await supabase
      .from('threads')
      .update({ last_updated: new Date().toISOString() })
      .eq('id', messageData.thread_id)
      .eq('user_id', user.id); // Ensure we only update the user's thread

    if (threadUpdateError) {
      console.error('Error updating thread last_updated:', threadUpdateError);
      // Non-critical, so we don't fail the whole request, but log it
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (e: any) {
    console.error('Error in POST /api/messages:', e);
    if (e instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: e.status || 500 });
  }
}
