import { Box, Drawer, Group, Flex } from '@mantine/core';
import { AuthenticationForm, UserConnection } from './authentification';
import { IsAuth } from 'src/user/component/isauth';
import { HeaderPlay } from './play';
import { HeaderFriends } from './friends';
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
        <Flex justify="space-between" align="center" h="100%">
          <Group h="100%" gap="md">
            <Box mr="xl">Raviolichess</Box>

            <Group h="100%" gap={0} visibleFrom="sm">
              <HeaderPlay />
              <IsAuth>
                <HeaderFriends />
              </IsAuth>
              <Link to="/analysis" className={classes.link} replace>
                Analyse
              </Link>
              <Link to="/editor" className={classes.link} replace>
                Edit
              </Link>
            </Group>
          </Group>
          <Group>
            <SearchUsers />
            <UserConnection openDrawer={openDrawer} />
            <ToggleColorScheme />
          </Group>
        </Flex>
      </header>

      <Drawer position="right" opened={openedDrawer} onClose={closeDrawer} title="Authentication">
        <AuthenticationForm close={closeDrawer} />
      </Drawer>
    </Box>
  );
};
