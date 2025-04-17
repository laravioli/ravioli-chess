import { useLocalStore } from 'src/shared/hooks/hooks';
import { useModule } from '../../../shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { Paper } from '@mantine/core';
import { Line } from './line.jsx';
import { renderPvs } from './utils.jsx';
import classes from '../css/move.module.css';

export function Moves() {
  const analyse = useModule();
  const snap = useSnapshot(analyse);
  const multipv = useLocalStore((state) => state.multipv);

  return (
    <Paper
      className={classes.move}
      padding="sm"
      shadow="xl"
      radius=""
      withBorder>
      {snap.enabled &&
        !snap.game.outcome &&
        renderPvs(snap.evaluation, multipv)}
      <Line />
    </Paper>
  );
}
