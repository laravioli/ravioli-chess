import { Link, type To } from 'react-router';
import { Drawer, Divider, UnstyledButton, Stack, Group, Button } from '@mantine/core';
import { INITIAL_FEN } from 'chessops/fen';

import { LobbySetup } from '@/lib/lobby/components/setup';
import type { Opponent } from '@/lib/lobby/interface';

import classes from '@/shell//css/header.module.css';
import { PlayMenu } from './menu/play';

const defaultState = { fen: INITIAL_FEN, orientation: 'white' };

export const Navigation: React.FC = () => {
  return (
    <>
      <PlayMenu />
      <SimpleLink label="Analyse" to="/analysis" state={defaultState} />
      <SimpleLink label="Edit" to="/editor" state={defaultState} />
    </>
  );
};

interface SimpleLinkProps {
  label: string;
  to: To;
  state: any;
  onClick?: () => void;
}

const SimpleLink: React.FC<SimpleLinkProps> = ({ label, to, state, onClick }) => {
  return (
    <Link
      to={to}
      className={classes.link}
      state={state}
      replace
      {...(onClick ? { onClick: () => setTimeout(onClick, 50) } : {})}
    >
      {label}
    </Link>
  );
};

interface DrawerStackReturnType<T extends string> {
  state: Record<T, boolean>;
  open: (id: T) => void;
  close: (id: T) => void;
  toggle: (id: T) => void;
  closeAll: () => void;
  register: (id: T) => { opened: boolean; onClose: () => void; stackId: T };
}

type LobbyId = 'play-random' | 'play-friend' | 'play-ai';

interface NavDrawerProps {
  stack: DrawerStackReturnType<'nav' | LobbyId>;
}

interface LobbyDrawer {
  key: LobbyId;
  opponent: Opponent;
  label: string;
}

const lobbies: LobbyDrawer[] = [
  {
    key: 'play-random',
    opponent: 'random player',
    label: ' Play vs a player',
  },
  { key: 'play-friend', opponent: 'friend', label: ' Play with a friend' },
  { key: 'play-ai', opponent: 'computer', label: 'Play against a computer' },
];

export const NavDrawer: React.FC<NavDrawerProps> = ({ stack }) => {
  return (
    <Drawer.Stack>
      <Drawer
        {...stack.register('nav')}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
      >
        <Divider my="sm" />
        {lobbies.map((lobby) => (
          <UnstyledButton
            key={lobby.key}
            className={classes.link}
            onClick={() => stack.open(lobby.key)}
          >
            {lobby.label}
          </UnstyledButton>
        ))}

        <SimpleLink label="Analyse" to="/analysis" state={defaultState} onClick={stack.closeAll} />
        <SimpleLink label="Edit" to="/editor" state={defaultState} onClick={stack.closeAll} />
      </Drawer>

      {lobbies.map((lobby) => (
        <Drawer
          key={lobby.key}
          {...stack.register(lobby.key)}
          size="100%"
          padding="md"
          title="Create a Lobby"
          hiddenFrom="sm"
          closeButtonProps={{ onClick: () => stack.closeAll() }}
        >
          <Stack>
            <LobbySetup opponent={lobby.opponent} />
            <Group justify="center" pt={10}>
              <Button component={Link} onClick={() => stack.closeAll()} to="/play">
                Play
              </Button>
            </Group>
          </Stack>
        </Drawer>
      ))}
    </Drawer.Stack>
  );
};
