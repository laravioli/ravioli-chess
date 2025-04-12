import { Group } from '@mantine/core';
import { StartButton } from 'src/shared/components/toolbar/start';
import { FlipButton } from 'src/shared/components/toolbar/flip';
import { Positions } from './positions';
import { TestButton } from 'src/shared/components/toolbar/test';
import { Navigate } from 'src/shared/components/toolbar/navigate';

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
