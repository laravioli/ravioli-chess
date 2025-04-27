import { useStore } from 'src/main/hooks/hooks';
import { Group } from '@mantine/core';
import { FlipButton } from 'src/common/components/toolbar/flip';
import { StartButton } from 'src/common/components/toolbar/start';
import { ClearButton } from './clear';
import { TestButton } from 'src/common/components/toolbar/test';
import { Navigate } from 'src/common/components/toolbar/navigate';

export const EditorActions = () => {
  const { analyseStore, editorStore } = useStore();
  return (
    <Group justify="center">
      <FlipButton store={editorStore} />
      <StartButton store={editorStore} />
      <ClearButton store={editorStore} />
      <TestButton store={editorStore} />
      <Navigate path="/analysis" prev={editorStore} next={analyseStore} />
    </Group>
  );
};
