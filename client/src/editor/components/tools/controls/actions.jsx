import { Group } from '@mantine/core';
import { FlipButton } from 'src/common/components/tools/flip';
import { StartButton } from 'src/common/components/tools/start';
import { ClearButton } from './clear';
import { TestButton } from 'src/common/components/tools/test';
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
