import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';
import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';

export const History = observer(({ size }) => {
  const pageStore = usePageStore();
  const actions = [
    { icon: IconChevronsLeft, action: 'start' },
    { icon: IconChevronLeft, action: 'undo' },
    { icon: IconChevronRight, action: 'redo' },
    { icon: IconChevronsRight, action: 'end' },
  ];

  return (
    <>
      {actions.map(({ icon: Icon, action }) => (
        <ActionIcon
          key={action}
          className="icon"
          size={size}
          onClick={() => {
            pageStore.jump(action);
          }}>
          <Icon size={50} stroke={1.5} />
        </ActionIcon>
      ))}
    </>
  );
});
