import { observer } from 'mobx-react-lite';
import { useGlobalStore } from 'src/main/hooks/hooks';
import { useState, useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounceLoading } from 'src/lib/common';
import { friendsListQueryKey, friendsListOptions } from 'src/lib/api/@tanstack/react-query.gen';
import { userLogout } from 'src/lib/api';
import { ActionIcon, Loader, Menu, MenuItem, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { PlayModalBody } from '../../../modals/play';
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconSettingsFilled,
  IconBrandGooglePlay,
} from '@tabler/icons-react';
import type { UserStore } from 'src/user/store/userstore';
import classes from 'src/common/css/header.module.css';

export const UserMenu = observer(() => {
  const { userStore } = useGlobalStore();

  const menus = useMemo(() => {
    if (userStore.logged) return { main: MainMenu, theme: ThemeMenu, friends: FriendsMenu };
    return { main: MainMenuPref, theme: ThemeMenu };
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

type MenuViewFC = React.FC<{
  navigate: Dispatch<SetStateAction<MenuViewKey>>;
}>;

type MenuViewKey = 'main' | ('theme' & 'friends');

const useMenu = (menuViews: Record<MenuViewKey, MenuViewFC>) => {
  const [view, setView] = useState<MenuViewKey>('main');

  const CurrentView = menuViews[view];

  return {
    currentMenu: <CurrentView navigate={setView} />,
    navigate: setView,
  };
};

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

  const logout = useCallback(async () => {
    try {
      const { data } = await userLogout();
      userStore.logout();
      queryClient.invalidateQueries({ queryKey: friendsListQueryKey() });
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
const FriendsMenu = ({ navigate }) => {
  const { isFetching, data } = useQuery({
    ...friendsListOptions(),
  });

  const debouncedLoading = useDebounceLoading(isFetching, 150);

  return (
    <>
      <MenuItem
        leftSection={<IconChevronLeft size={16} stroke={1.5} />}
        rightSection={debouncedLoading && <Loader color="gray" size={22} />}
        onClick={() => navigate('main')}
        closeMenuOnClick={false}
      >
        Friends
      </MenuItem>
      <Menu.Divider />

      {!debouncedLoading &&
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
                      modalBody: PlayModalBody,
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
