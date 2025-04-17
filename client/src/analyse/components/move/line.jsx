import { useModule } from 'src/shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { renderLine } from './utils';

export const Line = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);

  return <>{renderLine(snap.line.slice(1))}</>;
};
