import { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ActionIcon, Popover, Slider, Stack, Text, Group } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

import { usePageStore, useLocalStorage } from '@/core/hooks/hooks';
import { getRecommendedThreads } from '@/lib/eval/engine';

import classes from '@/analyse/css/eval.module.css';
import type { AnalyseStore } from '@/analyse/store/analyse';

export const Settings: React.FC = () => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      shadow="md"
      width={250}
    >
      <Popover.Target>
        <ActionIcon
          className={classes.settings}
          onClick={() => setOpened((o) => !o)}
          variant={'default'}
          bd={0}
        >
          <IconSettings size={18} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="sm">
          <Group
            align="center"
            justify="space-between"
          >
            <Text
              size="sm"
              w={60}
            >
              Search time
            </Text>
            <SearchTimeSettings />
          </Group>
          <Group
            align="center"
            justify="space-between"
          >
            <Text
              size="sm"
              w={60}
            >
              Lines
            </Text>
            <MultiPvSettings />
          </Group>
          <Group
            align="center"
            justify="space-between"
          >
            <Text
              size="sm"
              w={60}
            >
              Threads
            </Text>
            <ThreadsSettings />
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

const SearchTimeSettings: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const { evalStorage } = useLocalStorage();
  const searchms = evalStorage.searchms;

  const setSearchTime = useCallback(
    (value) => {
      if (value != searchms / 1000) {
        evalStorage.setSearchMs(value * 1000);
        analyseStore.restartCeval();
      }
    },
    [searchms],
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

const MultiPvSettings: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const { evalStorage } = useLocalStorage();
  const multipv = evalStorage.multipv;

  const setMultiPv = useCallback(
    (value: number) => {
      if (value !== multipv) {
        evalStorage.setMultiPv(value);
        analyseStore.clearEvals();
      }
    },
    [multipv],
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

const ThreadsSettings: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const { evalStorage } = useLocalStorage();
  const threads = evalStorage.threads;

  const setThreads = useCallback(
    (value) => {
      if (value != threads) {
        evalStorage.setThreads(value);
        analyseStore.restartCeval();
      }
    },
    [threads],
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
