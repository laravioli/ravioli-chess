import { Group } from '@mantine/core';
import { Navigate } from 'src/shared/components/toolbar/navigate';
import { StartButton } from 'src/shared/components/toolbar/start';
import { FlipButton } from 'src/shared/components/toolbar/flip';
import { TestButton } from 'src/shared/components/toolbar/test';

export const AnalyseActions = () => {
  return (
    <Group justify="center">
      <StartButton />
      <FlipButton />
      <TestButton />
      <Navigate path="/editor" />
    </Group>
  );
};
