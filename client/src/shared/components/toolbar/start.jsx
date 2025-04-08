import { DEFAULT_POSITION } from 'chess.js';
import { useModule } from 'src/shared/hooks/hooks';
import { CButton } from './button';

export const StartButton = () => {
  const module = useModule();

  const onStart = () => {
    module.newGame?.(DEFAULT_POSITION);
    module.getBoard().start();
    module.fen.resetFen(true);
  };

  return <CButton label="starting position" onClick={onStart} />;
};
