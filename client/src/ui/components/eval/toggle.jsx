import { useModule } from 'src/ui/context/hooks.js';
import { evalStore, useMainStore } from 'src/stores';
import { useEffect, useCallback } from 'react';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export const EvalToggle = () => {
  const analyse = useModule();
  const enabled = useMainStore((state) => state.evalEnabled);

  const isTab = useCallback(() => {
    const sri = evalStore.getState().sri;
    return window.site.sri == sri;
  }, []);

  const onClick = useCallback(() => {
    analyse.toggleCeval?.();
  }, [analyse]);

  useEffect(() => {
    const unsub = evalStore.subscribe(
      (state) => state.disable,
      () => {
        if (analyse.ceval.enabled() && !isTab()) {
          onClick();
        }
      }
    );
    return unsub;
  }, [analyse, isTab, onClick]);

  return (
    <Switch
      checked={enabled}
      onClick={onClick}
      color="teal"
      size="md"
      label="Stockfish 16"
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
