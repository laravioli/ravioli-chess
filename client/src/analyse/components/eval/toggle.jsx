import { localStore } from 'src/main/store';
import { useEffect, useCallback } from 'react';
import { useModule } from 'src/shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

//todo : find out this bug with useSnapshot dont update

export const EvalToggle = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);

  const isTab = useCallback(() => {
    const { sri } = localStore.getState();
    return window.site.sri == sri;
  }, []);

  const onClick = useCallback(() => {
    analyse.toggleCeval?.();
  }, [analyse]);

  useEffect(() => {
    const unsub = localStore.subscribe(
      (state) => state.disable,
      () => {
        if (analyse.enabled && !isTab()) {
          onClick();
        }
      }
    );
    return unsub;
  }, [analyse, isTab, onClick]);

  return (
    <Switch
      checked={snap.enabled}
      onClick={onClick}
      color="teal"
      size="md"
      thumbIcon={
        snap.enabled ? (
          <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
        ) : (
          <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
        )
      }
    />
  );
};
