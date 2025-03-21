'use client';
import type { Attachment, Message } from 'ai';

interface Vote {
  id: string;
  chat_id: string;
  user_id: string;
  vote: number;
}
import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { generateUUID } from '@/lib/utils';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      supabase.from('history').select('*').then(({ data, error }) => {
        if (error) {
          console.error('Failed to refresh history:', error);
        } else {
          console.log('History refreshed:', data);
        }
      });
    },
    onError: (error) => {
      toast.error('An error occurred, please try again!');
    },
  });

  const [votes, setVotes] = useState<Array<Vote>>([]);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Загрузка голосов через Supabase
  useEffect(() => {
    const fetchVotes = async () => {
      const { data: votesData, error } = await supabase
        .from('votes') // Название таблицы в Supabase
        .select('*')
        .eq('chat_id', id); // Фильтр по ID чата

      if (error) {
        console.error('Failed to fetch votes:', error);
        return;
      }

      setVotes(votesData || []);
    };

    fetchVotes();
  }, [id]); // reload votes when id changes

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />
        <Messages
          chatId={id}
          isLoading={isLoading}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>
    </>
  );
}