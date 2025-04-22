import { useLocalStore } from 'src/shared/hooks/hooks';
import { useModule } from '../../../shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { Paper } from '@mantine/core';
import { renderPvs } from './utils.jsx';
import { renderLine } from './utils';
import classes from '../css/move.module.css';

export function Moves() {
  return (
    <Paper
      className={classes.move}
      padding="sm"
      shadow="xl"
      radius=""
      withBorder>
      <Pvs />
      <Line />
    </Paper>
  );
}

const Pvs = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);
  const multipv = useLocalStore((state) => state.multipv);

  return (
    <>
      {snap.ceval.enabled &&
        !snap.game.currentMove.outcome &&
        renderPvs(snap.evaluation, multipv)}
    </>
  );
};

const Line = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);

  return <>{renderLine(snap.game.line)}</>;
};
