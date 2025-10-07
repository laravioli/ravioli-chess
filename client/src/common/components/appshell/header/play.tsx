import { modals } from '@mantine/modals';
import { PlayModalBody } from '../../modals/play';
import { Menu } from '@mantine/core';
import type { Opponent } from 'src/lib/lobby/interface';
import classes from '../../../css/header.module.css';

interface HeaderPlayData {
  label?: string;
  title: string;
  opponent: Opponent;
}

const items: HeaderPlayData[] = [
  { label: 'vs a player', title: 'Create a lobby', opponent: 'random player' },
  { label: 'with a friend', title: 'Create a lobby', opponent: 'friend' },
  { label: 'against a computer', title: 'Create a lobby', opponent: 'computer' },
];

export const HeaderPlay = () => {
  return (
    <>
      <Menu trigger="click-hover" position="bottom-start" offset={0} radius={2} withinPortal withArrow>
        <Menu.Target>
          <div className={classes.link} onClick={event => event.preventDefault()}>
            Play
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          {items.map(item => (
            <Menu.Item
              key={item.label}
              onClick={() =>
                modals.openContextModal({
                  modal: 'play',
                  title: 'Create a lobby',
                  innerProps: {
                    modalBody: PlayModalBody,
                    modalBodyProps: { opponent: item.opponent },
                  },
                })
              }
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
