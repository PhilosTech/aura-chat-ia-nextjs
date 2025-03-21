'use server';

import { supabase } from '@/lib/supabase';

export async function getSuggestions({ documentId }: { documentId: string }) {
  const { data: suggestions, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('documentId', documentId);

    if (error) {
      console.error('Failed to fetch suggestions:', error);
      return [];
    }
  return suggestions ||[];
}
