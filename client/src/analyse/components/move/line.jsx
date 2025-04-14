import { useMainStore } from 'src/shared/hooks/hooks';
import { useShallow } from 'zustand/shallow';
import { renderLine } from './utils';

export const Line = () => {
  const line = useMainStore(useShallow((state) => state.game.line()));

  return <>{renderLine(line.slice(1))}</>;
};
