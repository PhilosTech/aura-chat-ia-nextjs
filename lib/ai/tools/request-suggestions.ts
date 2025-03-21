import { z } from 'zod';
import { Session } from 'next-auth';
import { DataStreamWriter, streamObject, tool } from 'ai';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/lib/utils';
import { myProvider } from '../models';

interface RequestSuggestionsProps {
  session: Session;
  dataStream: DataStreamWriter;
}

interface Suggestion {
  id: string;
  documentId: string;
  userId: string;
  originalText: string;
  suggestedText: string;
  description: string;
  isResolved: boolean;
  createdAt: Date;
  documentCreatedAt: Date;
}

export const requestSuggestions = ({ session, dataStream }: RequestSuggestionsProps) =>
  tool({
    description: 'Request suggestions for a document',
    parameters: z.object({
      documentId: z.string().describe('The ID of the document to request edits'),
    }),
    execute: async ({ documentId }) => {
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (documentError || !document || !document.content) {
        return {
          error: 'Document not found',
        };
      }

      const suggestions: Array<
        Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
      > = [];

      // Генерация предложений через AI
      const { elementStream } = streamObject({
        model: myProvider.languageModel('block-model'),
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      for await (const element of elementStream) {
        const suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        dataStream.writeData({
          type: 'suggestion',
          content: suggestion,
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        const userId = session.user.id;

        const { error: saveError } = await supabase
          .from('suggestions')
          .insert(
            suggestions.map((suggestion) => ({
              ...suggestion,
              user_id: userId,
              created_at: new Date(),
              document_created_at: document.created_at,
            }))
          );

        if (saveError) {
          console.error('Failed to save suggestions:', saveError);
        }
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
      };
    },
  });