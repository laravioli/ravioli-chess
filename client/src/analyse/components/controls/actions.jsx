import { Group } from '@mantine/core';
import { FlipButton } from 'src/common/components/toolbar/flip';
import { StartButton } from 'src/common/components/toolbar/start';
import { Positions } from './positions';
import { TestButton } from 'src/common/components/toolbar/test';
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
