import { useDisclosure } from '@mantine/hooks';
import { useLocalStorage } from 'src/main/hooks/hooks';
import { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Modal,
  NativeSelect,
  FocusTrap,
  Slider,
  Text,
  Button,
  Group,
  Stack,
} from '@mantine/core';
import classes from './header.module.css';

export const PlayModal = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Play a game" centered>
        <FocusTrap.InitialFocus />
        <Stack>
          <AnonSelect />
          <AiLevel />
          <TimeMode />
          <GameClock />
          <Side />
          <Group justify="center">
            <Button>Play</Button>
          </Group>
        </Stack>
      </Modal>

      <div className={classes.link} onClick={open}>
        Play
      </div>
    </>
  );
};

const AnonSelect = observer(() => {
  const { lobbyStorage } = useLocalStorage();
  return (
    <NativeSelect
      value={lobbyStorage.anon}
      label="with"
      data={['friend', 'random player', 'computer']}
      onChange={(event) => lobbyStorage.setAnon(event.currentTarget.value)}
    />
  );
});

const AiLevel = observer(() => {
  const { lobbyStorage } = useLocalStorage();

  const marks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        label: String(i + 1),
        value: i * 14,
      })),
    []
  );

  if (lobbyStorage.anon === 'computer')
    return (
      <>
        <Text size="sm">
          ai level : <b>{lobbyStorage.aiLevel}</b>
        </Text>
        <Slider
          pb="1.5rem"
          value={(lobbyStorage.aiLevel - 1) * 14}
          onChange={(event) => lobbyStorage.setAiLevel(event / 14 + 1)}
          step={Math.round(100 / 7)}
          label={null}
          marks={marks}
          classNames={{ mark: classes.mark }}
        />
      </>
    );
  return null;
});

const TimeMode = observer(() => {
  const { lobbyStorage } = useLocalStorage();
  return (
    <NativeSelect
      value={lobbyStorage.timeMode}
      label="time control"
      data={[
        { label: 'Real Time', value: 'realTime' },
        { label: 'Unlimited', value: 'unlimited' },
      ]}
      onChange={(event) => lobbyStorage.setTimeMode(event.currentTarget.value)}
    />
  );
});

const GameClock = observer(() => {
  const { lobbyStorage } = useLocalStorage();

  const scale = useCallback((x) => {
    if (x <= 20) return x;
    if (x <= 25) return 20 + (x - 20) * 5;
    return 45 + (x - 25) * 15;
  }, []);

  const inverseScale = useCallback((y) => {
    if (y <= 20) return y;
    if (y <= 45) return (y + 80) / 5;
    return (y + 330) / 15;
  }, []);

  if (lobbyStorage.timeMode === 'realTime')
    return (
      <>
        <Text size="sm">
          Minutes per sides : <b>{lobbyStorage.time}</b>
        </Text>
        <Slider
          value={inverseScale(lobbyStorage.time)}
          min={1}
          max={34}
          label={null}
          onChange={(event) => {
            lobbyStorage.setTime(scale(event));
          }}
          scale={scale}
        />
        <Text size="sm">
          Increment in secondes : <b>{lobbyStorage.increment}</b>
        </Text>
        <Slider
          value={inverseScale(lobbyStorage.increment)}
          min={0}
          max={34}
          onChange={(event) => {
            lobbyStorage.setIncrement(scale(event));
          }}
          label={null}
          scale={scale}
        />
      </>
    );
  return null;
});

const Side = observer(() => {
  const { lobbyStorage } = useLocalStorage();

  return (
    <NativeSelect
      value={lobbyStorage.side}
      label="side"
      onChange={(event) => lobbyStorage.setSide(event.currentTarget.value)}
      data={['white', 'black', 'random']}
    />
  );
});
