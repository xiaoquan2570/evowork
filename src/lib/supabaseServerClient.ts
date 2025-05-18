import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'; // Make sure you're on Next.js 13 App Router or newer

// It's good practice to define your Database types for better type safety if you have them
// e.g., import type { Database } from './database.types'; // Create this file based on your schema

export function createSupabaseServerClient() { // You can keep this name or rename to e.g. getSupabaseRouteHandlerClient
  // For a typed client (if you have Database types):
  // const supabase = createRouteHandlerClient<Database>({ cookies });
  // For a non-typed client:
  const supabase = createRouteHandlerClient({ cookies });
  return supabase;
}
