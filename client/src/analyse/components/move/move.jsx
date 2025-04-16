import { useMainStore, useLocalStore } from 'src/shared/hooks/hooks';
import { Paper } from '@mantine/core';
import { Line } from './line.jsx';
import { renderPvs } from './utils.jsx';
import classes from '../css/move.module.css';

import { useProxy } from '../../../shared/hooks/hooks';
import { useSnapshot } from 'valtio';

export function Moves() {
  const state = useProxy();
  const { evaluation } = useSnapshot(state);

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
