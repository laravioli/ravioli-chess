import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'src/main/hooks/hooks';
import { useCallback, useMemo } from 'react';
import { FocusTrap, Stack, Group, Button, NativeSelect, Slider, Text } from '@mantine/core';
import { Link } from 'react-router';
import type { ContextModalProps } from '@mantine/modals';
import type { ComponentType } from 'react';
import type { Opponent } from 'src/lib/lobby/interface';

interface PlayModalBodyProps {
  opponent: Opponent;
}

interface ModalProps {
  modalBody: ComponentType<PlayModalBodyProps>;
  modalBodyProps: PlayModalBodyProps;
}

export const PlayModal = ({ context, id, innerProps }: ContextModalProps<ModalProps>) => (
  <>
    <FocusTrap.InitialFocus />
    <Stack>
      <innerProps.modalBody {...innerProps.modalBodyProps} />
      <Group justify="center">
        <Button component={Link} onClick={() => context.closeModal(id)} to="/play">
          Play
        </Button>
      </Group>
    </Stack>
  </>
);

export const PlayModalBody = ({ opponent }: PlayModalBodyProps) => {
  return (
    <>
      {opponent === 'computer' && <AiLevel />}
      <TimeMode />
      <GameClock />
      <Side />
    </>
  );
};

const AiLevel = observer(() => {
  const { lobbyStorage } = useLocalStorage();

  const marks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        label: String(i + 1),
        value: i * 14,
      })),
    [],
  );

  return (
    <>
      <Text size="sm">
        ai level : <b>{lobbyStorage.aiLevel}</b>
      </Text>
      <Slider
        pb="1.5rem"
        value={(lobbyStorage.aiLevel - 1) * 14}
        onChange={event => lobbyStorage.setAiLevel(event / 14 + 1)}
        step={Math.round(100 / 7)}
        label={null}
        marks={marks}
      />
    </>
  );
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
      onChange={event => lobbyStorage.setTimeMode(event.currentTarget.value as any)}
    />
  );
});

const GameClock = observer(() => {
  const { lobbyStorage } = useLocalStorage();

  const scale = useCallback(x => {
    if (x <= 20) return x;
    if (x <= 25) return 20 + (x - 20) * 5;
    return 45 + (x - 25) * 15;
  }, []);

  const inverseScale = useCallback(y => {
    if (y <= 20) return y;
    if (y <= 45) return (y + 80) / 5;
    return (y + 330) / 15;
  }, []);

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
        onChange={event => {
          lobbyStorage.setTime(scale(event));
        }}
        scale={scale}
        disabled={lobbyStorage.timeMode !== 'realTime'}
      />
      <Text size="sm">
        Increment in secondes : <b>{lobbyStorage.increment}</b>
      </Text>
      <Slider
        value={inverseScale(lobbyStorage.increment)}
        min={0}
        max={34}
        onChange={event => {
          lobbyStorage.setIncrement(scale(event));
        }}
        label={null}
        scale={scale}
        disabled={lobbyStorage.timeMode !== 'realTime'}
      />
    </>
  );
});

const Side = observer(() => {
  const { lobbyStorage } = useLocalStorage();

  return (
    <NativeSelect
      value={lobbyStorage.side}
      label="side"
      onChange={event => lobbyStorage.setSide(event.currentTarget.value as any)}
      data={['white', 'black', 'random']}
    />
  );
});
