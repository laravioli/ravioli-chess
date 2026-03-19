import { Menu } from '@mantine/core';
import { modals } from '@mantine/modals';

import { LobbySetup } from '@/lib/lobby/components/setup';
import type { Opponent } from '@/lib/lobby/interface';

import classes from '@/shell/css/header.module.css';

interface MenuPlayData {
  label?: string;
  title: string;
  opponent: Opponent;
}

const items: MenuPlayData[] = [
  {
    label: 'vs a player',
    title: 'Create a lobby',
    opponent: 'random player',
  },
  { label: 'with a friend', title: 'Create a lobby', opponent: 'friend' },
  {
    label: 'against a computer',
    title: 'Create a lobby',
    opponent: 'computer',
  },
];

export const PlayMenu: React.FC = () => {
  return (
    <>
      <Menu
        trigger="click-hover"
        position="bottom-start"
        offset={0}
        radius={2}
        withinPortal={false}
        withArrow
      >
        <Menu.Target>
          <div
            className={classes.link}
            onClick={(event) => event.preventDefault()}
          >
            Play
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          {items.map((item) => (
            <Menu.Item
              key={item.label}
              onClick={() => {
                modals.openContextModal({
                  modal: 'play',
                  title: 'Create a lobby',
                  innerProps: {
                    modalBody: LobbySetup,
                    modalBodyProps: { opponent: item.opponent },
                  },
                });
              }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
