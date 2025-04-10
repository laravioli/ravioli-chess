import { Group } from '@mantine/core';
import { FlipButton } from 'src/shared/components/toolbar/flip';
import { StartButton } from 'src/shared/components/toolbar/start';
import { ClearButton } from './clear';
import { TestButton } from 'src/shared/components/toolbar/test';
import { Navigate } from 'src/shared/components/toolbar/navigate';

export const EditorActions = () => {
  return (
    <Group justify="center">
      <FlipButton />
      <StartButton />
      <ClearButton />
      <TestButton />
      <Navigate path="/analysis" />
    </Group>
  );
};
