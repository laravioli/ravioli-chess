import { Group } from '@mantine/core';
import { FlipButton } from 'src/common/components/tools/flip';
import { StartButton } from 'src/common/components/tools/start';
import { Positions } from './positions';
import { TestButton } from 'src/common/components/tools/test';
import { Navigate } from 'src/common/components/navigation/navigate';

export const Actions = () => {
  return (
    <Group justify="center">
      <FlipButton />
      <StartButton />
      <Positions />
      <TestButton />
      <Navigate path="/editor" />
    </Group>
  );
};
