import { mainStore } from 'src/main/store';
import { useModule } from 'src/shared/hooks/hooks';
import { CButton } from './button';

const test = (module) => {
  console.log('board ' + module.getBoard().fen());
  console.log('chess ' + module.getGame?.().fen());
  console.log('fen ' + mainStore.getState().fen.current());
  console.log('fen from module' + module.fen.current());
  console.log('current move', module.getGame?.().currentMove);
};

export const TestButton = ({ label, style = {} }) => {
  const module = useModule();
  return <CButton label={label} onClick={() => test(module)} style={style} />;
};
