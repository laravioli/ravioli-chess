import { Group } from '@mantine/core';
import { StartButton } from 'src/common/components/toolbar/start';
import { FlipButton } from 'src/common/components/toolbar/flip';
import { Positions } from './positions';
import { TestButton } from 'src/common/components/toolbar/test';
import { Navigate } from 'src/common/components/toolbar/navigate';
import { useStore } from 'src/main/hooks/hooks';

export const Actions = () => {
  const { analyseStore, editorStore } = useStore();
  return (
    <Group justify="center">
      <FlipButton store={analyseStore} />
      <StartButton store={analyseStore} />
      <Positions />
      <TestButton store={analyseStore} />
      <Navigate path="/editor" prev={analyseStore} next={editorStore} />
    </Group>
  );
};
