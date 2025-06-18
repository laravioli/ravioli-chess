import { usePageStore } from 'src/main/hooks/hooks';
import { Action } from './action';
import { IconTestPipe } from '@tabler/icons-react';

export const TestButton = () => {
  const store = usePageStore();
  const test = async () => {
    console.log('board ' + store.board.fen());
    console.log('chess ' + store.game?.fen());
    console.log('fen from module' + store.fen.current);
    console.log('current move', store.game?.currentMove);
    console.log('bestEval', store.getBestEval?.(store.game?.currentMove));
  };
  return (
    <Action label="test" onClick={() => test()}>
      <IconTestPipe size={40} stroke={1.2} />
    </Action>
  );
};
