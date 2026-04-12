import { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ActionIcon, Popover, Slider, Stack, Text, Group } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

import { usePageStore } from '@/core/hooks';
import { getRecommendedThreads } from '@/lib/eval/engines';

import classes from '@/analyse/css/eval.module.css';
import type { AnalyseStore } from '@/analyse/store/analyse';

export const Settings: React.FC = () => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" shadow="md" width={250}>
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

const SearchTimeSettings: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const searchms = analyseStore.ceval.settings.searchms;

  const setSearchTime = useCallback(
    (value: number) => {
      if (value != searchms / 1000) {
        analyseStore.ceval.settings.setSearchMs(value * 1000);
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
  const multipv = analyseStore.ceval.settings.multipv;

  const setMultiPv = useCallback(
    (value: number) => {
      if (value !== multipv) {
        analyseStore.ceval.settings.setMultiPv(value);
        analyseStore.clearEvals();
      }
    },
    [multipv],
  );

  return (
    <Slider value={multipv} min={1} max={5} step={1} onChange={setMultiPv} style={{ flex: 1 }} />
  );
});

const ThreadsSettings: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const settings = analyseStore.ceval.settings;

  const setThreads = useCallback(
    (value: number) => {
      if (value != settings.threads) {
        settings.setThreads(value);
        analyseStore.restartCeval();
      }
    },
    [settings.threads],
  );
  return (
    <Slider
      value={settings.threads}
      min={2}
      max={24}
      marks={[
        {
          value: analyseStore.engineInfo ? getRecommendedThreads(analyseStore.engineInfo) : 0,
        },
      ]}
      step={1}
      onChange={setThreads}
      style={{ flex: 1 }}
    />
  );
});
