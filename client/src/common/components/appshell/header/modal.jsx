import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
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
  const [opponent, setOpponent] = useState('friend');
  const [isTimer, setIsTimer] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Play a game" centered>
        <FocusTrap.InitialFocus />
        <Stack>
          <NativeSelect
            label="with"
            data={['friend', 'random player', 'computer']}
            onChange={(event) => setOpponent(event.currentTarget.value)}
          />
          {opponent === 'computer' && <AiLevel />}
          <NativeSelect
            label="time control"
            data={['Real Time', 'Unlimited']}
            onChange={(event) =>
              setIsTimer(event.currentTarget.value === 'Real Time')
            }
          />
          {isTimer && <GameClock />}
          <NativeSelect label="side" data={['white', 'black', 'random']} />
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

const marks = Array.from({ length: 8 }, (_, i) => ({
  value: i * Math.round(100 / 7),
  label: String(i + 1),
}));

const AiLevel = () => {
  return (
    <>
      <Text size="sm">ai level</Text>
      <Slider
        pb="1.5rem"
        defaultValue={0}
        step={Math.round(100 / 7)}
        label={null}
        marks={marks}
        classNames={{ mark: classes.mark }}
      />
    </>
  );
};

const scale = (value) => {
  if (value <= 20) return value;
  if (value <= 25) return 20 + (value - 20) * 5;
  return 45 + (value - 25) * 15;
};

const GameClock = () => {
  const [minutes, setMinutes] = useState(5);
  const [secondes, setSecondes] = useState(0);
  return (
    <>
      <Text size="sm">
        Minutes per sides : <b>{minutes}</b>
      </Text>
      <Slider
        defaultValue={5}
        min={1}
        max={34}
        label={null}
        onChange={(event) => {
          setMinutes(scale(event));
        }}
        scale={scale}
      />
      <Text size="sm">
        Increment in secondes : <b>{secondes}</b>
      </Text>
      <Slider
        defaultValue={0}
        min={0}
        max={34}
        onChange={(event) => setSecondes(scale(event))}
        label={null}
        scale={scale}
      />
    </>
  );
};
