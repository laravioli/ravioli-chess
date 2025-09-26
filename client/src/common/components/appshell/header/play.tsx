import { useDisclosure } from '@mantine/hooks';
import { useLocalStorage } from 'src/main/hooks/hooks';
import { useCallback, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal, NativeSelect, FocusTrap, Slider, Text, Button, Group, Stack, Menu } from '@mantine/core';
import { Link } from 'react-router';
import classes from '../../../css/header.module.css';

type Opponent = 'friend' | 'random player' | 'computer';

interface PlayModalProps {
  label?: string;
  title: string;
  opponent: Opponent;
}

const items: PlayModalProps[] = [
  { label: 'vs a player', title: 'Create a lobby', opponent: 'random player' },
  { label: 'with a friend', title: 'Create a lobby', opponent: 'friend' },
  { label: 'against a computer', title: 'Create a lobby', opponent: 'computer' },
];

export const HeaderPlay = () => {
  const [modalProps, setModalProps] = useState<PlayModalProps>(items[0]);
  const [opened, { open, close }] = useDisclosure(false);

  const openModalWithProps = (props: PlayModalProps) => {
    setModalProps(props);
    open();
  };

  return (
    <>
      <Menu
        trigger="hover"
        position="bottom-start"
        offset={0}
        radius={2}
        transitionProps={{ exitDuration: 0 }}
        withinPortal
      >
        <Menu.Target>
          <div className={classes.link} onClick={event => event.preventDefault()}>
            Play
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          {items.map(item => (
            <Menu.Item key={item.label} onClick={() => openModalWithProps(item)}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <Modal opened={opened} onClose={close} title={modalProps.title} centered>
        <FocusTrap.InitialFocus />
        <Stack>
          {modalProps.opponent === 'computer' && <AiLevel />}
          <TimeMode />
          <GameClock />
          <Side />
          <Group justify="center">
            <Button component={Link} onClick={close} to="/play">
              Play
            </Button>
          </Group>
        </Stack>
      </Modal>
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
        classNames={{ mark: classes.mark }}
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
