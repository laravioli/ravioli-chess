import { DEFAULT_POSITION } from 'chess.js';
import { useModule } from 'src/shared/hooks/hooks';
import { Action } from './action';
import { IconReload } from '@tabler/icons-react';

export const StartButton = () => {
  const module = useModule();

  const onStart = () => {
    module.newGame?.(DEFAULT_POSITION);
    module.getBoard().start();
    module.fen.resetFen(true);
  };

  return (
    <Action label="reset board" onClick={onStart}>
      <IconReload size={40} stroke={1.5} />
    </Action>
  );
};
