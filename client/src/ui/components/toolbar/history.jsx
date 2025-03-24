import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon, Group } from '@mantine/core';
import { controller } from 'src/logic';

export const History = () => {
  return (
    <Group justify="center">
      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => controller.jump('start')}>
        <IconChevronsLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => controller.jump('undo')}>
        <IconChevronLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => controller.jump('redo')}>
        <IconChevronRight size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => controller.jump('end')}>
        <IconChevronsRight size={40} stroke={1.5} />
      </ActionIcon>
    </Group>
  );
};
