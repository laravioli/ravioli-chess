import { useMainStore } from 'src/shared/hooks/hooks';
import { Text, Paper, Divider } from '@mantine/core';

export function EvalBox() {
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
    <Paper padding="sm" shadow="xl" radius="md" withBorder>
      {pvsSection}
      <Text>Use it to create cards ezaoiheoazhazuhdaz</Text>
    </Paper>
  );
}
