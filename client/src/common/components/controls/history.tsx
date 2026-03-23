import { observer } from 'mobx-react-lite';
import { ActionIcon } from '@mantine/core';
import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from '@tabler/icons-react';

import { usePageStore } from '@/core/hooks/hooks';

import type { AnalyseStore } from '@/analyse/store/analyse';

export const History: React.FC<{ className: string }> = observer(({ className }) => {
  const pageStore = usePageStore<AnalyseStore>();
  const actions = [
    {
      icon: IconChevronsLeft,
      action: () => pageStore.jumpFirst(),
      key: 'start',
    },
    {
      icon: IconChevronLeft,
      action: () => pageStore.jumpPrev(),
      key: 'undo',
    },
    {
      icon: IconChevronRight,
      action: () => pageStore.jumpNext(),
      key: 'redo',
    },
    {
      icon: IconChevronsRight,
      action: () => pageStore.jumpLast(),
      key: 'end',
    },
  ];

  return (
    <>
      {actions.map(({ icon: Icon, action, key }) => (
        <ActionIcon key={key} className={className} onClick={action}>
          <Icon size="100%" stroke={1.2} style={{ maxWidth: 60, maxHeight: 60 }} />
        </ActionIcon>
      ))}
    </>
  );
});
