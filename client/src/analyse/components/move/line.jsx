import { useModule } from 'src/shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { renderLine } from './utils';

export const Line = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);

  console.log(snap.line, analyse.line);

  return <>{renderLine(snap.line.slice(1))}</>;
};
