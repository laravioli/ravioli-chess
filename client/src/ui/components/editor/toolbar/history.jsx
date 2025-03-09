import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon, Group } from '@mantine/core';
import { useMainStore } from 'src/stores/';

export const History = () => {
  const jump = useMainStore((state) => state.gameApi.jump);
  const mode = useMainStore((state) => state.mode);
  const isDisabled = mode == 'editor';

  return (
    <Group justify="center">
      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => jump('start')}
        disabled={isDisabled}>
        <IconChevronsLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => jump('undo')}
        disabled={isDisabled}>
        <IconChevronLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => jump('redo')}
        disabled={isDisabled}>
        <IconChevronRight size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => jump('end')}
        disabled={isDisabled}>
        <IconChevronsRight size={40} stroke={1.5} />
      </ActionIcon>
    </Group>
  );
};
