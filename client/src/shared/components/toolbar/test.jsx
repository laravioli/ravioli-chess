import { mainStore } from 'src/main/store';
import { useModule } from 'src/shared/hooks/hooks';
import { Action } from './action';
import { IconTestPipe } from '@tabler/icons-react';

const test = (module) => {
  console.log('board ' + module.getBoard().fen());
  console.log('chess ' + module.getGame?.().fen());
  console.log('fen ' + mainStore.getState().fen.current());
  console.log('fen from module' + module.fen.current());
  console.log('current move', module.getGame?.().currentMove);
};

export const TestButton = () => {
  const module = useModule();
  return (
    <Action label="test" onClick={() => test(module)}>
      <IconTestPipe size={40} stroke={1.2} />
    </Action>
  );
};
