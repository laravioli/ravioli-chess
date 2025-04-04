import { mainStore } from 'src/main/store';
import { useModule } from 'src/shared/hooks/hooks';
import { CButton } from './button';
import { useMainStore } from 'src/shared/hooks/hooks';

const test = (module, testfunction) => {
  console.log('board ' + module.getBoard().fen());
  console.log('chess ' + module.getGame?.().fen());
  console.log('fen ' + mainStore.getState().fen());
  console.log('current move', module.getGame?.().currentMove);
  testfunction();
  console.log(mainStore.getState().test);
};

export const TestButton = ({ label, style = {} }) => {
  const testa = useMainStore((state) => state.test.a);

  const setTestb = useMainStore((state) => state.setTestb);

  console.log(testa);
  const module = useModule();
  return (
    <CButton
      label={label}
      onClick={() => test(module, setTestb)}
      style={style}
    />
  );
};
