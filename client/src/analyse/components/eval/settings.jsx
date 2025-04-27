import { localStore } from 'src/main/store';
import { useStore, useLocalStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { useState, useCallback } from 'react';
import { ActionIcon, Popover, Slider, Stack, Text, Group } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { recommendedThreads } from 'src/lib/eval/engine';

export const Settings = observer(() => {
  const { analyseStore } = useStore();
  const searchms = useLocalStore((state) => state.searchms);
  const multipv = useLocalStore((state) => state.multipv);
  const threads = useLocalStore((state) => state.threads);
  const [opened, setOpened] = useState(false);

  const setSearchTime = useCallback(
    (value) => {
      if (value != searchms / 1000) {
        localStore.setState({ searchms: value * 1000 });
        analyseStore.restartCeval();
      }
    },
    [searchms]
  );

  const setMultipv = useCallback(
    (value) => {
      if (value !== multipv) {
        localStore.setState({ multipv: value });
        analyseStore.clearEvals();
        analyseStore.restartCeval();
      }
    },
    [multipv]
  );

  const setThreads = useCallback(
    (value) => {
      if (value != threads) {
        localStore.setState({ threads: value });
        analyseStore.restartCeval();
      }
    },
    [threads]
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
              Search time
            </Text>
            <Slider
              value={searchms / 1000}
              min={1}
              max={10}
              step={1}
              onChange={setSearchTime}
              style={{ flex: 1 }}
            />
          </Group>
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
