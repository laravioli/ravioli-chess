import { localStore } from 'src/main/store';
import { useEffect, useCallback } from 'react';
import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import classes from './eval.module.css';

export const EvalToggle = observer(() => {
  const pageStore = usePageStore();

  const isTab = useCallback(() => {
    const { sri } = localStore.getState();
    return window.site.sri == sri;
  }, []);

  const onClick = useCallback(() => {
    pageStore.toggleCeval();
  }, []);

  useEffect(() => {
    const unsub = localStore.subscribe(
      (state) => state.disable,
      () => {
        if (pageStore.ceval.enabled && !isTab()) {
          onClick();
        }
      }
    );
    return unsub;
  }, [isTab, onClick]);

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
