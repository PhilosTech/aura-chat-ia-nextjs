import { createDataStreamResponse, streamText, smoothStream } from 'ai';
import { supabase } from '@/lib/supabase';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { generateUUID } from '@/lib/utils';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { id, messages, selectedChatModel } = await request.json();

  // auth from supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = messages[messages.length - 1]; // Последнее сообщение от пользователя
  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // get chat
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .single();

  if (chatError && chatError.message !== 'No rows found') {
    return new Response('Failed to fetch chat', { status: 500 });
  }

  // create chat if not exists
  if (!chat) {
    const title = `Chat with ${userMessage.content.slice(0, 20)}...`;
    const { error: saveChatError } = await supabase
      .from('chats')
      .insert([{ id, user_id: user.id, title }]);
    if (saveChatError) {
      return new Response('Failed to save chat', { status: 500 });
    }
  }

  // save messages
  const { error: saveMessagesError } = await supabase
    .from('messages')
    .insert([
      {
        id: generateUUID(),
        chat_id: id,
        role: userMessage.role,
        content: userMessage.content,
        created_at: new Date(),
      },
    ]);
  if (saveMessagesError) {
    return new Response('Failed to save messages', { status: 500 });
  }

  // create stream
  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ selectedChatModel }),
        messages,
        experimental_activeTools: ['createDocument', 'updateDocument'],
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        onFinish: async ({ response }) => {
          const sanitizedMessages = response.messages.map((message) => ({
            id: message.id,
            chat_id: id,
            role: message.role,
            content: message.content,
            created_at: new Date(),
          }));

          const { error: saveFinalMessagesError } = await supabase
            .from('messages')
            .insert(sanitizedMessages);
          if (saveFinalMessagesError) {
            console.error('Failed to save final messages:', saveFinalMessagesError);
          }
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return 'Oops, an error occurred!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { error: deleteChatError } = await supabase
    .from('chats')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteChatError) {
    return new Response('Failed to delete chat', { status: 500 });
  }

  return new Response('Chat deleted', { status: 200 });
}