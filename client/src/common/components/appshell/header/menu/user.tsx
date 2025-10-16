import { observer } from 'mobx-react-lite';
import { useGlobalStore } from 'src/main/hooks/hooks';
import { useState, useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import { userLogout } from 'src/lib/api';
import { notifications } from '@mantine/notifications';
import { IsAuth } from 'src/user/component/isauth';
import { ActionIcon, Menu, MenuItem, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconLogout, IconSettingsFilled } from '@tabler/icons-react';
import type { UserStore } from 'src/user/store/userstore';
import classes from 'src/common/css/header.module.css';

const MainMenuAuth = ({ setView }) => {
  const { userStore } = useGlobalStore();

  const logout = useCallback(async () => {
    try {
      const { data } = await userLogout();
      userStore.logout();
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
      <Menu.Item>Friends</Menu.Item>
      <Menu.Label>Preferences</Menu.Label>
      <Menu.Item
        rightSection={<IconChevronRight size={16} stroke={1.5} />}
        onClick={() => setView('theme')}
        closeMenuOnClick={false}
      >
        Theme
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />} onClick={logout}>
        Logout
      </Menu.Item>
    </>
  );
};

const MainMenuAnon = ({ setView }) => {
  return (
    <>
      <Menu.Item
        rightSection={<IconChevronRight size={16} stroke={1.5} />}
        onClick={() => setView('theme')}
        closeMenuOnClick={false}
      >
        Theme
      </Menu.Item>
    </>
  );
};

const ThemeMenu = ({ setView }) => {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <>
      <MenuItem
        leftSection={<IconChevronLeft size={16} stroke={1.5} />}
        onClick={() => setView('main')}
        closeMenuOnClick={false}
      >
        Theme
      </MenuItem>
      <Menu.Divider />
      <Menu.Item onClick={() => setColorScheme('dark')}>Dark</Menu.Item>
      <Menu.Item onClick={() => setColorScheme('light')}>Light</Menu.Item>
    </>
  );
};

type MenuViewFC = React.FC<{
  setView: Dispatch<SetStateAction<MenuViewKey>>;
}>;

type MenuViewKey = 'main' | 'theme';

const useMenu = (menuViews: Record<MenuViewKey, MenuViewFC>) => {
  const [view, setView] = useState<MenuViewKey>('main');
  const CurrentView = menuViews[view];

  return {
    currentMenu: <CurrentView setView={setView} />,
    setView,
  };
};

export const UserMenuV2 = observer(() => {
  const { userStore } = useGlobalStore();
  const mainMenu = userStore.logged ? MainMenuAuth : MainMenuAnon;
  const { currentMenu, setView } = useMenu({ main: mainMenu, theme: ThemeMenu });

  return (
    <>
      <Menu
        trigger="click"
        position="bottom-start"
        width={300}
        offset={0}
        radius={2}
        onExitTransitionEnd={() => setView('main')}
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

export const UserMenu = observer(() => {
  const { userStore } = useGlobalStore();
  const { setColorScheme } = useMantineColorScheme();
  const [view, setView] = useState<'main' | 'friends' | 'theme'>('main');

  const logout = useCallback(async () => {
    try {
      const { data } = await userLogout();
      userStore.logout();
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

  const menuViews = useMemo(
    () => ({
      main: (
        <>
          <IsAuth showIf={true}>
            <Menu.Item>Profile</Menu.Item>
            <Menu.Item>Friends</Menu.Item>
            <Menu.Label>Preferences</Menu.Label>
          </IsAuth>
          <Menu.Item
            rightSection={<IconChevronRight size={16} stroke={1.5} />}
            onClick={() => setView('theme')}
            closeMenuOnClick={false}
          >
            Theme
          </Menu.Item>
          <IsAuth showIf={true}>
            <Menu.Divider />
            <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />} onClick={logout}>
              Logout
            </Menu.Item>
          </IsAuth>
        </>
      ),
      theme: (
        <>
          <MenuItem
            leftSection={<IconChevronLeft size={16} stroke={1.5} />}
            onClick={() => setView('main')}
            closeMenuOnClick={false}
          >
            Theme
          </MenuItem>
          <Menu.Divider />
          <Menu.Item onClick={() => setColorScheme('dark')}>Dark</Menu.Item>
          <Menu.Item onClick={() => setColorScheme('light')}>Light</Menu.Item>
        </>
      ),
    }),
    [],
  );

  return (
    <>
      <Menu
        trigger="click"
        position="bottom-start"
        width={300}
        offset={0}
        radius={2}
        onExitTransitionEnd={() => setView('main')}
        withinPortal
      >
        <Menu.Target>
          <UserMenuTarget user={userStore} />
        </Menu.Target>
        <Menu.Dropdown>{menuViews[view]}</Menu.Dropdown>
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
