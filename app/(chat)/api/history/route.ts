import { auth } from '@/app/(auth)/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized!', { status: 401 });
  }

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', session.user.id);

  if (error) {
    return new Response('Failed to fetch chats', { status: 500 });
  }

  return Response.json(data);
}
