import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'src/main/hooks/hooks';
import { useCallback, useMemo, memo, type ComponentType } from 'react';
import { FocusTrap, Stack, Group, Button, NativeSelect, Slider, Text, ActionIcon } from '@mantine/core';
import { Link } from 'react-router';
import type { ContextModalProps } from '@mantine/modals';
import type { Opponent, TimeMode, LobbySide } from 'src/lib/lobby/interface';
import classes from '../../css/modals.module.css';

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
      <Group justify="center" pt={10}>
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

interface SideOption {
  key: string;
  side: LobbySide;
}

const Side = observer(() => {
  const { lobbyStorage } = useLocalStorage();
  const sides: SideOption[] = useMemo(
    () => [
      { key: 'w', side: 'white' },
      { key: 'r', side: 'random' },
      { key: 'b', side: 'black' },
    ],
    [],
  );

  const onClick = (side: LobbySide) => {
    lobbyStorage.setSide(side);
  };

  return (
    <Group justify="center">
      {sides.map(side => (
        <ActionIcon
          key={side.key}
          classNames={{ root: classes.lobbysideroot }}
          onClick={() => onClick(side.side)}
          disabled={side.side === lobbyStorage.side}
        >
          <IconChessKnightSharp side={side.side} />
        </ActionIcon>
      ))}
    </Group>
  );
});

const IconChessKnightSharp = memo(({ side }: { side: LobbySide }) => {
  const fill = side === 'random' ? 'url(#sharpBlackWhite)' : side === 'white' ? '#FFFDE7' : 'black';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 45 45">
      <defs>
        <linearGradient id="sharpBlackWhite" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="50%" stopColor="#FFFDE7" />
          <stop offset="50%" stopColor="black" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
      </defs>
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill={fill}
        stroke="var(--mantine-color-dark-4)"
        strokeWidth="0.2"
        strokeLinecap="round"
      />
    </svg>
  );
});
