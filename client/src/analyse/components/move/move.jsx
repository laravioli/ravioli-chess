import { useMainStore, useLocalStore } from 'src/shared/hooks/hooks';
import { Paper } from '@mantine/core';
import { Line } from './line.jsx';
import { renderPvs } from './utils.jsx';
import classes from '../css/move.module.css';

export function Moves() {
  const evaluation = useMainStore((state) => state.analyse.evaluation);
  const enabled = useMainStore((state) => state.eval.enabled);
  const outcome = useMainStore((state) => state.game.outcome());
  const multipv = useLocalStore((state) => state.multipv);

  return (
    <Paper
      className={classes.move}
      padding="sm"
      shadow="xl"
      radius=""
      withBorder>
      {enabled && !outcome && renderPvs(evaluation, multipv)}
      <Line />
    </Paper>
  );
}
