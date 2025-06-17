import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon, Group } from '@mantine/core';
import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import classes from './controls.module.css';

export const History = observer(() => {
  const analyseStore = usePageStore();
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
          className={classes.icon}
          size="xl"
          onClick={() => {
            analyseStore.jump(action);
          }}
          styles={{
            root: { border: 0 },
          }}>
          <Icon size={50} stroke={1.5} />
        </ActionIcon>
      ))}
    </Group>
  );
});
