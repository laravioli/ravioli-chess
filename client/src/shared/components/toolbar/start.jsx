import { DEFAULT_POSITION } from 'chess.js';
import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { CButton } from './button';

export const StartButton = () => {
  const module = useModule();
  const resetFen = useMainStore((state) => state.resetFen);

  const onStart = () => {
    module.newGame?.(DEFAULT_POSITION);
    module.getBoard().start();
    resetFen(true);
  };

  return <CButton label="starting position" onClick={onStart} />;
};
