import { useModule } from 'src/ui/context/hooks.js';
import { evalStore } from 'src/stores';
import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export const ToggleEval = () => {
  const analyse = useModule();
  const [checked, setChecked] = useState(analyse.ceval.enabled());

  const isTab = useCallback(() => {
    const sri = evalStore.getState().sri;
    return window.site.sri == sri;
  }, []);

  const onClick = useCallback(() => {
    analyse.toggleCeval?.();
    setChecked(analyse.ceval.enabled());
  }, [analyse]);

  useEffect(() => {
    const unsub = evalStore.subscribe(
      (state) => state.disable,
      () => {
        if (checked && !isTab()) {
          onClick();
        }
      }
    );
    return unsub;
  }, [checked, isTab, onClick]);

  return (
    <Switch
      checked={checked}
      onClick={onClick}
      color="teal"
      size="md"
      label="Stockfish 16"
      thumbIcon={
        checked ? (
          <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
        ) : (
          <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
        )
      }
    />
  );
};
