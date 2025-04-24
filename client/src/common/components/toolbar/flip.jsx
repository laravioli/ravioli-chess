import { Action } from './action';
import { IconRepeat } from '@tabler/icons-react';
import { useModule } from '../../hooks/hooks';

export const FlipButton = () => {
  const module = useModule();
  const onFlip = () => {
    module.board.flip();
  };

  return (
    <Action label="flip board" onClick={onFlip}>
      <IconRepeat size={40} stroke={1.2} />
    </Action>
  );
};
