import { localStore } from 'src/main/store';
import { useModule, useLocalStore } from 'src/common/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { useState, useCallback } from 'react';
import { ActionIcon, Popover, Slider, Stack, Text, Group } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { recommendedThreads } from 'src/lib/eval/engine';

export const Settings = observer(() => {
  const analyse = useModule();
  const multipv = useLocalStore((state) => state.multipv);
  const threads = useLocalStore((state) => state.threads);
  const [opened, setOpened] = useState(false);

  const setMultipv = useCallback(
    (value) => {
      if (value !== multipv) {
        localStore.setState({ multipv: value });
        analyse.clearEvals();
        analyse.restartCeval();
      }
    },
    [analyse, multipv]
  );

  const setThreads = useCallback(
    (value) => {
      if (value != threads) {
        localStore.setState({ threads: value });
        analyse.restartCeval();
      }
    },
    [analyse, threads]
  );

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      shadow="md"
      width={250}>
      <Popover.Target>
        <ActionIcon
          onClick={() => setOpened((o) => !o)}
          variant={'default'}
          bd={0}>
          <IconSettings size={18} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="sm">
          <Group align="center" justify="space-between">
            <Text size="sm" w={60}>
              Lines
            </Text>
            <Slider
              value={multipv}
              min={1}
              max={5}
              step={1}
              onChange={setMultipv}
              style={{ flex: 1 }}
            />
          </Group>
          <Group align="center" justify="space-between">
            <Text size="sm" w={60}>
              Threads
            </Text>
            <Slider
              value={threads}
              min={2}
              max={24}
              marks={[
                {
                  value: recommendedThreads(),
                },
              ]}
              step={1}
              onChange={setThreads}
              style={{ flex: 1 }}
            />
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
});
