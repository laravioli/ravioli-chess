import { localStore } from 'src/main/store';
import { useEffect, useCallback } from 'react';
import { useModule } from 'src/common/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export const EvalToggle = observer(() => {
  const analyse = useModule();

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
        if (analyse.ceval.enabled && !isTab()) {
          onClick();
        }
      }
    );
    return unsub;
  }, [analyse, isTab, onClick]);

  return (
    <Switch
      checked={analyse.ceval.enabled}
      onClick={onClick}
      color="teal"
      size="md"
      thumbIcon={
        analyse.ceval.enabled ? (
          <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
        ) : (
          <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
        )
      }
    />
  );
});
