import { useStore } from 'src/main/hooks/hooks';
import { Action } from './action';
import { IconTestPipe } from '@tabler/icons-react';

export const TestButton = ({ store }) => {
  const { fenStore } = useStore();
  const test = async () => {
    console.log('board ' + store.board.fen());
    console.log('chess ' + store.game?.fen());
    console.log('fen from module' + fenStore.current);
    console.log('current move', store.game?.currentMove);
    console.log('bestEval', store.getBestEval?.(store.game?.currentMove));

    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('hello'); // Logs after 3 seconds
        resolve(); // Resolves the Promise (even though we're not using the result)
      }, 3000);
    });
  };
  return (
    <Action label="test" onClick={() => test()}>
      <IconTestPipe size={40} stroke={1.2} />
    </Action>
  );
};
