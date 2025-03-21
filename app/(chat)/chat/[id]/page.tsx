import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Chat } from '@/components/chat';
import { convertToUIMessages } from '@/lib/utils';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .single();

  if (chatError || !chat) {
    return notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (chat.visibility === 'private') {
    if (!user || user.id !== chat.user_id) {
      return notFound();
    }
  }

  const { data: messagesFromDb, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Failed to fetch messages:', messagesError);
    return notFound();
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie?.value || DEFAULT_CHAT_MODEL}
        selectedVisibilityType={chat.visibility}
        isReadonly={!user || user.id !== chat.user_id}
      />
    </>
  );
}