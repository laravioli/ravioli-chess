import { Group } from '@mantine/core';
import { StartButton } from 'src/common/components/toolbar/start';
import { FlipButton } from 'src/common/components/toolbar/flip';
import { Positions } from './positions';
import { TestButton } from 'src/common/components/toolbar/test';
import { Navigate } from 'src/common/components/toolbar/navigate';

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
