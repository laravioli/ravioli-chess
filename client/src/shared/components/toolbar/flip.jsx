import { useModule } from 'src/shared/hooks/hooks';
import { Action } from './action';
import { IconRepeat } from '@tabler/icons-react';

export const FlipButton = () => {
  const module = useModule();
  const onFlip = () => {
    module.getBoard().flip();
    if (module.side) {
      module.side = module.side === 'white' ? 'black' : 'white';
    }
  };

  return (
    <Action label="flip board" onClick={onFlip}>
      <IconRepeat size={40} stroke={1.5} />
    </Action>
  );
};
