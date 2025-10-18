import { Box, Drawer, Group, Flex, Button } from '@mantine/core';
import { AuthenticationForm } from './authentification';
import { IsAuth } from 'src/user/component/isauth';
import { PlayMenu } from './menu/play';
import { UserMenu } from './menu/user';
import { SearchUsers } from './search';
import { Link } from 'react-router';
import { useDisclosure } from '@mantine/hooks';
import { INITIAL_FEN } from 'chessops/fen';
import classes from '../../../css/header.module.css';

export const Header = () => {
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  return (
    <Box pb={6}>
      <header className={classes.header}>
        <Flex justify="space-between" h="100%" maw={1800} m="0 auto">
          <Group h="100%" gap="md">
            <Box mr="xl">Raviolichess</Box>

            <Group h="100%" gap={0} visibleFrom="sm">
              <PlayMenu />
              <Link
                to="/analysis"
                className={classes.link}
                state={{ fen: INITIAL_FEN, orientation: 'white' }}
                replace
              >
                Analyse
              </Link>
              <Link
                to="/editor"
                className={classes.link}
                state={{ fen: INITIAL_FEN, orientation: 'white' }}
                replace
              >
                Edit
              </Link>
            </Group>
          </Group>
          <Group h="100%" visibleFrom="sm">
            <SearchUsers />
            <IsAuth showIf={false}>
              <Button onClick={openDrawer}>Log in</Button>
            </IsAuth>
            <UserMenu />
          </Group>
        </Flex>
      </header>

      <Drawer position="right" opened={openedDrawer} onClose={closeDrawer} title="Authentication">
        <AuthenticationForm close={closeDrawer} />
      </Drawer>
    </Box>
  );
};
