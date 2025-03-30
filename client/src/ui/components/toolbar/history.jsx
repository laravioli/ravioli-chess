import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon, Group } from '@mantine/core';
import { useModule } from 'src/ui/context/hooks.js';

export const History = () => {
  const module = useModule();
  const actions = [
    { icon: IconChevronsLeft, action: 'start' },
    { icon: IconChevronLeft, action: 'undo' },
    { icon: IconChevronRight, action: 'redo' },
    { icon: IconChevronsRight, action: 'end' },
  ];

  return (
    <Group justify="center">
      {actions.map(({ icon: Icon, action }) => (
        <ActionIcon
          key={action}
          variant="default"
          size="lg"
          onClick={() => module.jump(action)}>
          <Icon size={40} stroke={1.5} />
        </ActionIcon>
      ))}
    </Group>
  );
};
