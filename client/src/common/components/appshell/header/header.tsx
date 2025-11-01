import { Box, Group, Flex, Burger, useDrawersStack } from '@mantine/core';
import { Navigation, NavDrawer } from './navigation';
import { AuthDrawer, LoginButton } from './authentification';
import { UserMenu } from './menu/user';
import { SearchUsers } from './search';
import { useDisclosure } from '@mantine/hooks';
import classes from '../../../css/header.module.css';

export const Header = () => {
  const [openedAuth, { open: openAuth, close: closeAuth }] = useDisclosure(false);
  const stack = useDrawersStack(['nav', 'play-random', 'play-friend', 'play-ai']);
  return (
    <Box pb={6}>
      <header className={classes.header}>
        <Flex justify="space-between" h="100%" maw={1800} m="0 auto">
          <Group h="100%" gap="md">
            <Burger opened={stack.state['nav']} onClick={() => stack.open('nav')} hiddenFrom="sm" />
            <Box mr="xl" visibleFrom="xs">
              Raviolichess
            </Box>
            <Group h="100%" gap={0} visibleFrom="sm">
              <Navigation />
            </Group>
          </Group>
          <Group h="100%" wrap="nowrap">
            <SearchUsers />
            <LoginButton onClick={openAuth} />
            <UserMenu />
          </Group>
        </Flex>
      </header>

      <AuthDrawer opened={openedAuth} onClose={closeAuth} />
      <NavDrawer stack={stack} />
    </Box>
  );
};
