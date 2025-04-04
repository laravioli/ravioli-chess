import { localStore } from 'src/main/store';
import { useEffect, useCallback } from 'react';
import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export const EvalToggle = () => {
  const analyse = useModule();
  const enabled = useMainStore((state) => state.evalEnabled);

  console.log(enabled, 'jean mich');

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
        if (enabled && !isTab()) {
          onClick();
        }
      }
    );
    return unsub;
  }, [enabled, isTab, onClick]);

  return (
    <Switch
      checked={enabled}
      onClick={onClick}
      color="teal"
      size="md"
      thumbIcon={
        enabled ? (
          <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
        ) : (
          <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
        )
      }
    />
  );
};
