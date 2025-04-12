import { useMainStore } from 'src/shared/hooks/hooks';
import { Text, Paper } from '@mantine/core';
import { renderPvs } from './utils.jsx';
import classes from '../css/move.module.css';

export function Moves() {
  const evaluation = useMainStore((state) => state.analyse.evaluation);
  const enabled = useMainStore((state) => state.eval.enabled);
  const outcome = useMainStore((state) => state.game.outcome());

  return (
    <Paper
      className={classes.move}
      padding="sm"
      shadow="xl"
      radius=""
      withBorder>
      {enabled && !outcome && renderPvs(evaluation)}
      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>

      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>
      <Text>Use it to createeaezaezaez</Text>
    </Paper>
  );
}
