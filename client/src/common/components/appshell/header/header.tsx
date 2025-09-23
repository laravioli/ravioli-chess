import { Box, Button, Drawer, Group, Text } from '@mantine/core';
import { AuthenticationForm } from './authentification';
import { PlayModal } from './modal';
import { SearchUsers2 } from './search';
import { Link } from 'react-router';
import { ToggleColorScheme } from './colorscheme';
import { useGlobalStore } from 'src/main/hooks/hooks';
import { useDisclosure } from '@mantine/hooks';
import { observer } from 'mobx-react-lite';
import { userLogout } from 'src/lib/api';
import { notifications } from '@mantine/notifications';
import classes from '../../../css/header.module.css';

export const Header = observer(() => {
  const { userStore } = useGlobalStore();
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  return (
    <Box pb={6}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          Raviolichess
          <Group h="100%" gap={0} visibleFrom="sm">
            <PlayModal />
            <Link to="/analysis" className={classes.link} replace>
              Analyse
            </Link>
            <Link to="/editor" className={classes.link} replace>
              Edit
            </Link>
          </Group>
          <Group>
            <SearchUsers2 />
            {userStore.logged && <Text>{userStore.username}</Text>}
            {!userStore.logged && <Button onClick={openDrawer}>Log in</Button>}
            {userStore.logged && (
              <Button
                color="red"
                onClick={async () => {
                  const { data, error } = await userLogout();
                  if (error) {
                    return;
                  }
                  userStore.logout();
                  notifications.show({
                    id: 'logout',
                    position: 'bottom-right',
                    message: data?.detail,
                    color: 'red',
                    autoClose: 2000,
                  });
                }}
              >
                Logout
              </Button>
            )}
            <ToggleColorScheme />
          </Group>
        </Group>
      </header>

      <Drawer position="right" opened={openedDrawer} onClose={closeDrawer} title="Authentication">
        <AuthenticationForm close={closeDrawer} />
      </Drawer>
    </Box>
  );
});
