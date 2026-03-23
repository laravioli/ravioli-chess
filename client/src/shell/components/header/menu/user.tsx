import { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  ActionIcon,
  Loader,
  Menu,
  MenuItem,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconSettingsFilled,
  IconBrandGooglePlay,
} from '@tabler/icons-react';

import { useGlobalStore } from '@/core/hooks/hooks';
import { useMenu, type MenuViewFC } from '@/common/hooks/hooks';
import { listMyFriendsQueryKey, listMyFriendsOptions } from '@/lib/api/@tanstack/react-query.gen';
import { Preferences, Auth } from '@/lib/api';
import { LobbySetup } from '@/lib/lobby/components/setup';
import type { UserStore } from '@/user/store/userstore';
import { setBoardColor, setPieceSet, setPreference } from '@/user/store/utils';

import classes from '@/shell/css/header.module.css';

export const UserMenu: React.FC = observer(() => {
  const { userStore } = useGlobalStore();

  const menus = useMemo(() => {
    if (userStore.logged)
      return {
        main: MainMenu,
        friends: FriendsMenu,
        ...MainMenuPref.subMenus,
      };
    return { main: MainMenuPref, ...MainMenuPref.subMenus };
  }, [userStore.logged]);

  const { currentMenu, navigate } = useMenu(menus);

  return (
    <>
      <Menu
        trigger="click"
        position="bottom-start"
        width={300}
        offset={0}
        radius={2}
        onExitTransitionEnd={() => navigate('main')}
        withinPortal
      >
        <Menu.Target>
          <UserMenuTarget user={userStore} />
        </Menu.Target>
        <Menu.Dropdown>{currentMenu}</Menu.Dropdown>
      </Menu>
    </>
  );
});

type UserMenuTargetProps = {
  user: UserStore;
  ref?: React.Ref<HTMLButtonElement>;
} & React.ComponentPropsWithoutRef<'button'>;

const UserMenuTarget: React.FC<UserMenuTargetProps> = observer(({ user, ref, ...rest }) => {
  return user.logged ? (
    <UnstyledButton ref={ref} {...rest} className={classes.link}>
      {user.username}
    </UnstyledButton>
  ) : (
    <ActionIcon ref={ref} {...rest} h="100%" bg="inherit">
      <IconSettingsFilled color="gray" size={22} />
    </ActionIcon>
  );
});

const MainMenu: MenuViewFC = ({ navigate }) => {
  const { userStore } = useGlobalStore();
  const queryClient = useQueryClient();

  const { isPending, refetch } = useQuery({
    ...listMyFriendsOptions(),
    enabled: false,
  });

  const logout = useCallback(async () => {
    try {
      await Auth.logout();
      userStore.logout();
      queryClient.removeQueries({ queryKey: listMyFriendsQueryKey() });
      setPreference({ board: 'blue', pieceset: 'base' });
      notifications.show({
        id: 'logout',
        position: 'bottom-right',
        message: 'successfully logout',
        color: 'red',
        autoClose: 2000,
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <>
      <Menu.Item>Profile</Menu.Item>
      <Menu.Item
        onMouseEnter={() => isPending && refetch()}
        rightSection={<IconChevronRight size={16} stroke={1.5} />}
        onClick={() => navigate('friends')}
        closeMenuOnClick={false}
      >
        Friends
      </Menu.Item>
      <Menu.Label>Preferences</Menu.Label>
      <MainMenuPref navigate={navigate} />
      <Menu.Divider />
      <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />} onClick={logout}>
        Logout
      </Menu.Item>
    </>
  );
};

const MainMenuPref: MenuViewFC = ({ navigate }) => {
  return (
    <>
      <Menu.Item
        rightSection={<IconChevronRight size={16} stroke={1.5} />}
        onClick={() => navigate('theme')}
        closeMenuOnClick={false}
      >
        Theme
      </Menu.Item>
      <Menu.Item
        rightSection={<IconChevronRight size={16} stroke={1.5} />}
        onClick={() => navigate('board')}
        closeMenuOnClick={false}
      >
        Board
      </Menu.Item>
      <Menu.Item
        rightSection={<IconChevronRight size={16} stroke={1.5} />}
        onClick={() => navigate('pieceset')}
        closeMenuOnClick={false}
      >
        Piece set
      </Menu.Item>
    </>
  );
};

const ThemeMenu: MenuViewFC = ({ navigate }) => {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <>
      <MenuItem
        leftSection={<IconChevronLeft size={16} stroke={1.5} />}
        onClick={() => navigate('main')}
        closeMenuOnClick={false}
      >
        Theme
      </MenuItem>
      <Menu.Divider />
      <Menu.Item onClick={() => setColorScheme('dark')} closeMenuOnClick={false}>
        Dark
      </Menu.Item>
      <Menu.Item onClick={() => setColorScheme('light')} closeMenuOnClick={false}>
        Light
      </Menu.Item>
    </>
  );
};

const BoardMenu: MenuViewFC = ({ navigate }) => {
  const colors = useMemo(
    () =>
      [
        { key: 'wo', value: 'wood' },
        { key: 'bl', value: 'blue' },
        { key: 'bl2', value: 'blue2' },
        { key: 'br', value: 'brown' },
      ] as const,
    [],
  );

  return (
    <>
      <MenuItem
        leftSection={<IconChevronLeft size={16} stroke={1.5} />}
        onClick={() => navigate('main')}
        closeMenuOnClick={false}
      >
        Board
      </MenuItem>
      <Menu.Divider />
      {colors.map((item) => (
        <Menu.Item
          key={item.key}
          onClick={async () => {
            try {
              await Preferences.updatePref({ body: { board: item.value } });
              setBoardColor(item.value);
            } catch (error: any) {
              console.log(error);
            }
          }}
          closeMenuOnClick={false}
        >
          {item.value}
        </Menu.Item>
      ))}
    </>
  );
};

const PieceSetMenu: MenuViewFC = ({ navigate }) => {
  const pieceSet = useMemo(
    () =>
      [
        { key: 'ba', value: 'base' },
        { key: 'wi', value: 'wiki' },
      ] as const,
    [],
  );

  return (
    <>
      <MenuItem
        leftSection={<IconChevronLeft size={16} stroke={1.5} />}
        onClick={() => navigate('main')}
        closeMenuOnClick={false}
      >
        Piece set
      </MenuItem>
      <Menu.Divider />
      {pieceSet.map((item) => (
        <Menu.Item
          key={item.key}
          onClick={async () => {
            try {
              await Preferences.updatePref({
                body: { pieceset: item.value },
              });
              setPieceSet(item.value);
            } catch (error: any) {
              console.log(error);
            }
          }}
          closeMenuOnClick={false}
        >
          {item.value}
        </Menu.Item>
      ))}
    </>
  );
};

const FriendsMenu: MenuViewFC = ({ navigate }) => {
  const { isFetching, data } = useQuery({
    ...listMyFriendsOptions(),
  });

  return (
    <>
      <MenuItem
        leftSection={<IconChevronLeft size={16} stroke={1.5} />}
        rightSection={isFetching && <Loader color="gray" size={22} />}
        onClick={() => navigate('main')}
        closeMenuOnClick={false}
      >
        Friends
      </MenuItem>
      <Menu.Divider />

      {!isFetching &&
        data?.map((item) => (
          <Menu.Item
            className={classes.friend}
            key={item.id}
            onClick={() => {}}
            rightSection={
              <IconBrandGooglePlay
                stroke={1.2}
                size={22}
                onClick={() =>
                  modals.openContextModal({
                    modal: 'play',
                    title: 'Create a lobby',
                    innerProps: {
                      modalBody: LobbySetup,
                      modalBodyProps: { opponent: 'friend' },
                    },
                  })
                }
              />
            }
          >
            {item.username}
          </Menu.Item>
        ))}
    </>
  );
};

MainMenuPref.subMenus = {
  theme: ThemeMenu,
  board: BoardMenu,
  pieceset: PieceSetMenu,
};
