import { usePageStore, useHTMLData } from 'src/main/hooks/hooks';
import { useMenu } from 'src/common/hooks/hooks';
import { useNavigate } from 'react-router';
import { useMemo } from 'react';
import { ActionIcon, Menu } from '@mantine/core';
import { INITIAL_FEN } from 'chessops/fen';
import type { AnalyseStore } from 'src/analyse/store/analyse';
import type { AnalyseOpts } from 'src/analyse/store/interface';
import {
  IconEdit,
  IconReload,
  IconRepeat,
  IconChessRook,
  IconChevronRight,
  IconChevronLeft,
  IconMenu,
} from '@tabler/icons-react';
import classes from '../../css/controls.module.css';

export const ControlsMenu = () => {
  const { currentMenu, navigate } = useMenu({ main: MainMenu, positions: PositionsMenu });

  return (
    <div className={classes.controlsMenu}>
      <Menu
        trigger="click"
        position="left-end"
        offset={0}
        radius={2}
        onExitTransitionEnd={() => navigate('main')}
        withinPortal
        withArrow
      >
        <Menu.Target>
          <ActionIcon className={classes.button}>
            <IconMenu size="100%" stroke={1.5} style={{ maxWidth: 30, maxHeight: 30 }} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>{currentMenu}</Menu.Dropdown>
      </Menu>
    </div>
  );
};

const MainMenu = ({ navigate }) => {
  const store = usePageStore<AnalyseStore>();

  return (
    <>
      <Menu.Item
        leftSection={<IconRepeat size={22} stroke={1.8} />}
        onClick={() => store.flip()}
        closeMenuOnClick={false}
      >
        flip board
      </Menu.Item>
      <Menu.Item
        leftSection={<IconReload size={22} stroke={1.8} />}
        onClick={() => store.reload(INITIAL_FEN)}
        closeMenuOnClick={false}
      >
        reset board
      </Menu.Item>
      <Menu.Item
        leftSection={<IconChessRook stroke={1.2}></IconChessRook>}
        rightSection={<IconChevronRight size={16} stroke={1.5} />}
        onClick={() => navigate('positions')}
        closeMenuOnClick={false}
      >
        positions
      </Menu.Item>
      <Navigate />
    </>
  );
};

const PositionsMenu = ({ navigate }) => {
  const analyseStore = usePageStore<AnalyseStore>();
  const { positions } = useHTMLData();

  const options = useMemo(
    () =>
      positions.map(item => (
        <Menu.Item key={item.fen} onClick={() => analyseStore.reload(item.fen)} closeMenuOnClick={false}>
          {[item.eco, item.name].join(' ')}
        </Menu.Item>
      )),
    [positions],
  );

  return (
    <>
      <Menu.Item
        leftSection={<IconChevronLeft size={16} stroke={1.5} />}
        onClick={() => navigate('main')}
        closeMenuOnClick={false}
      >
        Positions
      </Menu.Item>
      <Menu.Divider />
      {options}
    </>
  );
};

const Navigate = () => {
  const store = usePageStore<AnalyseStore>();
  const navigate = useNavigate();
  const getState = (): AnalyseOpts => ({ fen: store.node.fen, orientation: store.board!.state.orientation });
  return (
    <Menu.Item
      leftSection={<IconEdit size={22} stroke={1.5} />}
      onClick={() => navigate('/editor', { replace: true, state: getState() })}
      closeMenuOnClick={false}
    >
      edit board
    </Menu.Item>
  );
};
