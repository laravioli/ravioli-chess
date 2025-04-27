import { Action } from './action';
import { IconRepeat } from '@tabler/icons-react';

export const FlipButton = ({ store }) => {
  const onFlip = () => {
    store.board.flip();
  };

  return (
    <Action label="flip board" onClick={onFlip}>
      <IconRepeat size={40} stroke={1.2} />
    </Action>
  );
};
