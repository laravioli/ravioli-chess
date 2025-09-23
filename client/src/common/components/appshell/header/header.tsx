import { Box, Drawer, Group } from '@mantine/core';
import { AuthenticationForm, UserConnection } from './authentification';
import { PlayModal } from './modal';
import { SearchUsers } from './search';
import { Link } from 'react-router';
import { ToggleColorScheme } from './colorscheme';
import { useDisclosure } from '@mantine/hooks';
import classes from '../../../css/header.module.css';

export const Header = () => {
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
            <SearchUsers />
            <UserConnection openDrawer={openDrawer} />
            <ToggleColorScheme />
          </Group>
        </Group>
      </header>

      <Drawer position="right" opened={openedDrawer} onClose={closeDrawer} title="Authentication">
        <AuthenticationForm close={closeDrawer} />
      </Drawer>
    </Box>
  );
};
