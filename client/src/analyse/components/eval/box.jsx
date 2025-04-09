import { useMainStore } from 'src/shared/hooks/hooks';
import { Text, Paper, Divider } from '@mantine/core';
import classes from '../css/eval.module.css';

export function AnalyseBox() {
  const evaluation = useMainStore((state) => state.analyse.evaluation);
  const enabled = useMainStore((state) => state.eval.enabled);

  const pvsData = evaluation ? evaluation.pvs[0].moves.join(' ') : '';
  const pvsSection = enabled && (
    <>
      {' '}
      <Text>{pvsData} </Text>
      <Divider my="xs" />
    </>
  );

  return (
    <Paper
      className={classes.evalbox}
      style={{ height: 'clamp(240px, 60vmin, 640px)' }}
      padding="sm"
      shadow="xl"
      radius=""
      withBorder>
      {pvsSection}
      <Text>Use it to create cards ezaoiheoazhazuhdaz</Text>
    </Paper>
  );
}
