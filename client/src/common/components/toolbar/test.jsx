import { useModule } from 'src/common/hooks/hooks';
import { Action } from './action';
import { IconTestPipe } from '@tabler/icons-react';

const test = (module) => {
  console.log('board ' + module.board.fen());
  console.log('chess ' + module.game?.fen());
  console.log('fen from module' + module.fen.current);
  console.log('current move', module.game?.currentMove);
};

export const TestButton = () => {
  const module = useModule();
  return (
    <Action label="test" onClick={() => test(module)}>
      <IconTestPipe size={40} stroke={1.2} />
    </Action>
  );
};
