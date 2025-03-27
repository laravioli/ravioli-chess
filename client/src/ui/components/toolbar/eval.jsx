import { getModule } from 'src/logic';
import { evalStore } from 'src/stores';
import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export const ToggleEval = () => {
  const [checked, setChecked] = useState(getModule().ceval.enabled());

  const isTab = useCallback(() => {
    const sri = evalStore.getState().sri;
    return window.site.sri == sri;
  }, []);

  const onClick = () => {
    getModule().toggleCeval?.();
    setChecked(getModule().ceval.enabled());
  };

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
  }, [checked, isTab]);

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
