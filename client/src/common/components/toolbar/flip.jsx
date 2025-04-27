import { useStore } from 'src/main/hooks/hooks';
import { Action } from './action';
import { IconRepeat } from '@tabler/icons-react';

export const FlipButton = ({ store }) => {
  const { uiStore } = useStore();
  const onFlip = () => {
    uiStore.toggleOrientation(store.board);
  };

  return (
    <Action label="flip board" onClick={onFlip}>
      <IconRepeat size={40} stroke={1.2} />
    </Action>
  );
};
