import { Box, Button, Drawer, Group } from '@mantine/core';
import { AuthenticationForm } from './authentification.jsx';
import { PlayModal } from './modal.jsx';
import { Link } from 'react-router';
import { ToggleColorScheme } from './colorscheme.jsx';
import { useDisclosure } from '@mantine/hooks';
import classes from './header.module.css';

export function Header() {
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
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
          <Group visibleFrom="sm">
            <Button onClick={openDrawer}>Log in</Button>
            <ToggleColorScheme />
          </Group>
        </Group>
      </header>

      <Drawer
        position="right"
        opened={openedDrawer}
        onClose={closeDrawer}
        title="Authentication">
        <AuthenticationForm close={closeDrawer} />
      </Drawer>
    </Box>
  );
}
