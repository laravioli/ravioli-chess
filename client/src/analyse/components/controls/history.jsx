import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon, Group } from '@mantine/core';
import { useModule } from 'src/shared/hooks/hooks';
import classes from '../css/controls.module.css';

export const History = () => {
  const module = useModule();
  const actions = [
    { icon: IconChevronsLeft, action: 'start' },
    { icon: IconChevronLeft, action: 'undo' },
    { icon: IconChevronRight, action: 'redo' },
    { icon: IconChevronsRight, action: 'end' },
  ];

  return (
    <Group className={classes.history} justify="space-evenly">
      {actions.map(({ icon: Icon, action }) => (
        <ActionIcon
          key={action}
          variant="default"
          size="xl"
          onClick={() => module.jump(action)}
          styles={{
            root: { border: 0 },
          }}>
          <Icon size={50} stroke={1.5} />
        </ActionIcon>
      ))}
    </Group>
  );
};
