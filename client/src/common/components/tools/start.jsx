import { usePageStore } from 'src/main/hooks/hooks';
import { DEFAULT_POSITION } from 'chess.js';
import { Action } from './action';
import { IconReload } from '@tabler/icons-react';

export const StartButton = () => {
  const store = usePageStore();

  const onStart = () => {
    store.newGame?.(DEFAULT_POSITION);
    store.board.start();
    store.fen.reset(true);
  };

  return (
    <Action label="reset board" onClick={onStart}>
      <IconReload size={40} stroke={1.2} />
    </Action>
  );
};
