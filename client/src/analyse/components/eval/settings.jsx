import { usePageStore, useLocalStorage } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { useState, useCallback } from 'react';
import { ActionIcon, Popover, Slider, Stack, Text, Group } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { getRecommendedThreads } from 'src/lib/eval/engine';
import classes from './eval.module.css';

export const Settings = () => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      className={classes.settings}
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
            <SearchTimeSettings />
          </Group>
          <Group align="center" justify="space-between">
            <Text size="sm" w={60}>
              Lines
            </Text>
            <MultiPvSettings />
          </Group>
          <Group align="center" justify="space-between">
            <Text size="sm" w={60}>
              Threads
            </Text>
            <ThreadsSettings />
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

const SearchTimeSettings = observer(() => {
  const analyseStore = usePageStore();
  const { evalStorage } = useLocalStorage();
  const searchms = evalStorage.searchms;

  const setSearchTime = useCallback(
    (value) => {
      if (value != searchms / 1000) {
        evalStorage.setSearchMs(value * 1000);
        analyseStore.restartCeval();
      }
    },
    [searchms]
  );

  return (
    <Slider
      value={searchms / 1000}
      min={1}
      max={10}
      step={1}
      onChange={setSearchTime}
      style={{ flex: 1 }}
    />
  );
});

const MultiPvSettings = observer(() => {
  const analyseStore = usePageStore();
  const { evalStorage } = useLocalStorage();
  const multipv = evalStorage.multipv;

  const setMultiPv = useCallback(
    (value) => {
      if (value !== multipv) {
        evalStorage.setMultiPv(value);
        analyseStore.clearEvals();
        analyseStore.restartCeval();
      }
    },
    [multipv]
  );

  return (
    <Slider
      value={multipv}
      min={1}
      max={5}
      step={1}
      onChange={setMultiPv}
      style={{ flex: 1 }}
    />
  );
});

const ThreadsSettings = observer(() => {
  const analyseStore = usePageStore();
  const { evalStorage } = useLocalStorage();
  const threads = evalStorage.threads;

  const setThreads = useCallback(
    (value) => {
      if (value != threads) {
        evalStorage.setThreads(value);
        analyseStore.restartCeval();
      }
    },
    [threads]
  );
  return (
    <Slider
      value={threads}
      min={2}
      max={24}
      marks={[
        {
          value: getRecommendedThreads(),
        },
      ]}
      step={1}
      onChange={setThreads}
      style={{ flex: 1 }}
    />
  );
});
