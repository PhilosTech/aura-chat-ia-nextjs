'use server'

import { generateText, Message } from 'ai'
import { cookies } from 'next/headers'
import { VisibilityType } from '@/components/visibility-selector'
import { myProvider } from '@/lib/ai/models'
import { supabase } from '@/lib/supabase'

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies()
  cookieStore.set('chat-model', model)
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  })

  return title
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const { data: message, error } = await supabase
    .from('messages')
    .select('chatId, createdAt')
    .eq('id', id)
    .single()

  if (error || !message) {
    console.error('Failed to fetch message:', error)
    return
  }

  await supabase
    .from('messages')
    .delete()
    .eq('chatId', message.chatId)
    .gt('createdAt', message.createdAt)
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string
  visibility: VisibilityType
}) {
  const { error } = await supabase
    .from('chats')
    .update({ visibility })
    .eq('id', chatId)

  if (error) {
    console.error('Failed to update chat visibility:', error)
  }
}
