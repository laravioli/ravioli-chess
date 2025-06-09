import { Group } from '@mantine/core';
import { FlipButton } from 'src/common/components/toolbar/flip';
import { StartButton } from 'src/common/components/toolbar/start';
import { ClearButton } from './clear';
import { TestButton } from 'src/common/components/toolbar/test';
import { Navigate } from 'src/common/components/navigation/navigate';

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
