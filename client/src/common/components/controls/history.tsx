import { IconChevronsLeft, IconChevronLeft, IconChevronRight, IconChevronsRight } from '@tabler/icons-react';
import { UnstyledButton } from '@mantine/core';
import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import type { AnalyseStore } from 'src/analyse/store/analyse';
import classes from '../../css/action.module.css';

export const History = observer(() => {
  const pageStore = usePageStore<AnalyseStore>();
  const actions = [
    {
      icon: IconChevronsLeft,
      action: () => pageStore.jumpFirst(),
      key: 'start',
    },
    { icon: IconChevronLeft, action: () => pageStore.jumpPrev(), key: 'undo' },
    { icon: IconChevronRight, action: () => pageStore.jumpNext(), key: 'redo' },
    { icon: IconChevronsRight, action: () => pageStore.jumpLast(), key: 'end' },
  ];

  return (
    <>
      {actions.map(({ icon: Icon, action, key }) => (
        <UnstyledButton key={key} className={classes.button} onClick={action}>
          <Icon size="100%" stroke={1.2} style={{ maxWidth: 60, maxHeight: 60 }} />
        </UnstyledButton>
      ))}
    </>
  );
});
