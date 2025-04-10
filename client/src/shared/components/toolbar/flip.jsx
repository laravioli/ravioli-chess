import { Action } from './action';
import { IconRepeat } from '@tabler/icons-react';
import { useMainStore } from 'src/shared/hooks/hooks';

export const FlipButton = () => {
  const changeSide = useMainStore((state) => state.changeSide);

  const onFlip = () => {
    changeSide();
  };

  return (
    <Action label="flip board" onClick={onFlip}>
      <IconRepeat size={40} stroke={1.2} />
    </Action>
  );
};
