import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'; // Adjust path if needed

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated or error fetching user.' }, { status: 401 });
  }

  try {
    const { data: threads, error } = await supabase
      .from('threads')
      .select('*')
      .eq('user_id', user.id)
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(threads);
  } catch (e: any) {
    console.error('Unexpected error fetching threads:', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated or error fetching user.' }, { status: 401 });
  }

  try {
    const { title } = await request.json();

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required and must be a non-empty string.' }, { status: 400 });
    }

    const { data: newThread, error } = await supabase
      .from('threads')
      .insert([{ user_id: user.id, title: title.trim() }])
      .select()
      .single(); // .single() to get the inserted row back

    if (error) {
      console.error('Error creating thread:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newThread, { status: 201 });
  } catch (e: any) {
    console.error('Unexpected error creating thread:', e);
     // Check for JSON parsing errors specifically
    if (e instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
