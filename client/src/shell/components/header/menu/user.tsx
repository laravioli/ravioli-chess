import { observer } from 'mobx-react-lite';
import { useGlobalStore } from 'src/main/hooks/hooks';
import { useMenu } from 'src/common/hooks/hooks';
import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { friendsListQueryKey, friendsListOptions } from 'src/lib/api/@tanstack/react-query.gen';
import { userLogout, profileBoardUpdate, profilePiecesetUpdate } from 'src/lib/api';
import { ActionIcon, Loader, Menu, MenuItem, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { LobbySetup } from 'src/lib/lobby/components/setup';
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconSettingsFilled,
  IconBrandGooglePlay,
} from '@tabler/icons-react';
import type { UserStore } from 'src/user/store/userstore';
import { setBoardColor, setPieceSet, setProfile, getAnonProfile } from 'src/user/store/utils';
import classes from '../../../css/header.module.css';

export const UserMenu = observer(() => {
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

const UserMenuTarget = observer((props: UserMenuTargetProps) => {
  const { user, ref, ...rest } = props;
  return user.logged ? (
    <UnstyledButton ref={ref} {...rest} className={classes.link}>
      {props.user.username}
    </UnstyledButton>
  ) : (
    <ActionIcon ref={ref} {...rest} h="100%" bg="inherit">
      <IconSettingsFilled color="gray" size={22} />
    </ActionIcon>
  );
});

const MainMenu = ({ navigate }) => {
  const { userStore } = useGlobalStore();
  const queryClient = useQueryClient();

  const { isPending, refetch } = useQuery({
    ...friendsListOptions(),
    enabled: false,
  });

  const logout = useCallback(async () => {
    try {
      const { data } = await userLogout();
      userStore.logout();
      queryClient.removeQueries({ queryKey: friendsListQueryKey() });
      setProfile(getAnonProfile());
      notifications.show({
        id: 'logout',
        position: 'bottom-right',
        message: data?.detail,
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

const MainMenuPref = ({ navigate }) => {
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

const ThemeMenu = ({ navigate }) => {
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

const BoardMenu = ({ navigate }) => {
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
      {colors.map(item => (
        <Menu.Item
          key={item.key}
          onClick={async () => {
            try {
              await profileBoardUpdate({ body: { board: item.value } });
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

const PieceSetMenu = ({ navigate }) => {
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
      {pieceSet.map(item => (
        <Menu.Item
          key={item.key}
          onClick={async () => {
            try {
              await profilePiecesetUpdate({ body: { pieceset: item.value } });
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

const FriendsMenu = ({ navigate }) => {
  const { isFetching, data } = useQuery({
    ...friendsListOptions(),
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
        data?.results.map(item => (
          <Menu.Item
            className={classes.friend}
            key={item.to_user}
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
            {item.to_user}
          </Menu.Item>
        ))}
    </>
  );
};

MainMenuPref.subMenus = { theme: ThemeMenu, board: BoardMenu, pieceset: PieceSetMenu };
