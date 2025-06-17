import { useEffect, useCallback } from 'react';
import { usePageStore, useLocalStorage } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import classes from './eval.module.css';

export const EvalToggle = observer(() => {
  const pageStore = usePageStore();
  const { evalStorage } = useLocalStorage();

  const onClick = useCallback(() => {
    pageStore.toggleCeval();
  }, []);

  useEffect(() => {
    return autorun(() => {
      if (pageStore.ceval.enabled && !evalStorage.isTab) onClick();
    });
  }, []);

  return (
    <Switch
      classNames={{ track: classes.toggle }}
      checked={pageStore.ceval.enabled}
      onClick={onClick}
      color="teal"
      size="md"
      thumbIcon={
        pageStore.ceval.enabled ? (
          <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
        ) : (
          <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
        )
      }
    />
  );
});
