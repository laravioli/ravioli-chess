import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon, Group } from '@mantine/core';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

export const History = () => {
  const history = useBoundStore((state) => state.gameActions.history);
  const currentMode = useBoundStore((state) => state.currentMode);
  const isDisabled = currentMode == mode.editor;

  return (
    <Group justify="center">
      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history.next('start')}
        disabled={isDisabled}>
        <IconChevronsLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history.next('undo')}
        disabled={isDisabled}>
        <IconChevronLeft size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history.next('redo')}
        disabled={isDisabled}>
        <IconChevronRight size={40} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        variant="default"
        size="lg"
        onClick={() => history.next('end')}
        disabled={isDisabled}>
        <IconChevronsRight size={40} stroke={1.5} />
      </ActionIcon>
    </Group>
  );
};
