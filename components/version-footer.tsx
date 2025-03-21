'use client';
import { isAfter } from 'date-fns';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { LoaderIcon } from './icons';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  created_at: string;
  content: string;
}

interface VersionFooterProps {
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  documents: Array<Document> | undefined;
  currentVersionIndex: number;
  documentId: string;
}

export const VersionFooter = ({
  handleVersionChange,
  documents,
  currentVersionIndex,
  documentId,
}: VersionFooterProps) => {
  const [isMutating, setIsMutating] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  if (!documents) return null;

  const handleRestore = async () => {
    setIsMutating(true);

    // Получаем timestamp текущей версии
    const timestamp = documents[currentVersionIndex]?.created_at;

    // Обновляем документ через Supabase
    const { error } = await supabase
      .from('documents')
      .update({ created_at: timestamp })
      .eq('id', documentId);

    if (error) {
      console.error('Failed to restore document version:', error);
      setIsMutating(false);
      return;
    }

    setIsMutating(false);
  };

  return (
    <motion.div
      className="absolute flex flex-col gap-4 lg:flex-row bottom-0 bg-background p-4 w-full border-t z-50 justify-between"
      initial={{ y: isMobile ? 200 : 77 }}
      animate={{ y: 0 }}
      exit={{ y: isMobile ? 200 : 77 }}
      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
    >
      <div>
        <div>You are viewing a previous version</div>
        <div className="text-muted-foreground text-sm">
          Restore this version to make edits
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button disabled={isMutating} onClick={handleRestore}>
          <div>Restore this version</div>
          {isMutating && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            handleVersionChange('latest');
          }}
        >
          Back to latest version
        </Button>
      </div>
    </motion.div>
  );
};