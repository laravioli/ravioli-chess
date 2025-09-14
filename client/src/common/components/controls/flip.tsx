import { usePageStore } from 'src/main/hooks/hooks';
import { Action } from './action';
import { IconRepeat } from '@tabler/icons-react';
import type { FloatingPosition } from '@mantine/core';

export const FlipButton = ({ ttposition }: { ttposition: FloatingPosition }) => {
  const store = usePageStore();
  const onFlip = () => {
    store.flip();
  };

  return (
    <Action label="flip board" onClick={onFlip} ttposition={ttposition}>
      <IconRepeat size={40} stroke={1.2} />
    </Action>
  );
};
