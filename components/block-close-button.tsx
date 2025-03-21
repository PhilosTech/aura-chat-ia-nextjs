import { memo } from 'react';
import { CrossIcon } from './icons';
import { Button } from './ui/button';

function PureBlockCloseButton() {

  return (
    <Button
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const BlockCloseButton = memo(PureBlockCloseButton, () => true);
