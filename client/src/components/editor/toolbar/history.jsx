import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon, Group } from '@mantine/core';
import { useBoundStore } from '../../../stores/hooks/useboundstore';

export const History = () => {
  const history = useBoundStore((state) => state.gameApi.history);
  const mode = useBoundStore((state) => state.mode);
  const isDisabled = mode == 'editor';

  return (
    <Group justify="center">
      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history('start')}
        disabled={isDisabled}>
        <IconChevronsLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history('undo')}
        disabled={isDisabled}>
        <IconChevronLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history('redo')}
        disabled={isDisabled}>
        <IconChevronRight size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history('end')}
        disabled={isDisabled}>
        <IconChevronsRight size={40} stroke={1.5} />
      </ActionIcon>
    </Group>
  );
};
