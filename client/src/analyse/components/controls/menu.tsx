import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { INITIAL_FEN } from 'chessops/fen';
import { ActionIcon, Menu } from '@mantine/core';
import {
  IconEdit,
  IconReload,
  IconRepeat,
  IconChessRook,
  IconChevronRight,
  IconChevronLeft,
  IconMenu,
} from '@tabler/icons-react';

import { chessPositionsOptions } from '@/lib/api/@tanstack/react-query.gen';
import { usePageStore, useHTMLData } from '@/core/hooks/hooks';
import { useMenu, type MenuViewFC } from '@/common/hooks/hooks';

import type { AnalyseStore } from '@/analyse/store/analyse';
import type { AnalyseOpts } from '@/analyse/store/interface';
import classes from '@/analyse/css/controls.module.css';

export const ControlsMenu: React.FC = () => {
  const { currentMenu, navigate } = useMenu({
    main: MainMenu,
    positions: PositionsMenu,
  });

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

const MainMenu: MenuViewFC = ({ navigate }) => {
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

const PositionsMenu: MenuViewFC = ({ navigate }) => {
  const analyseStore = usePageStore<AnalyseStore>();
  const htmlData = useHTMLData();
  const { data: positions = [] } = useQuery({
    ...chessPositionsOptions(),
    initialData: htmlData?.positions,
  });

  const options = useMemo(
    () =>
      positions.map((item) => (
        <Menu.Item
          key={item.fen}
          onClick={() => analyseStore.reload(item.fen)}
          closeMenuOnClick={false}
        >
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

const Navigate: React.FC = () => {
  const store = usePageStore<AnalyseStore>();
  const navigate = useNavigate();
  const getState = (): AnalyseOpts => ({
    fen: store.node.fen,
    orientation: store.board!.state.orientation,
  });
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
