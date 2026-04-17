import { Box, Group, Flex, Burger, useDrawersStack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { observer } from 'mobx-react-lite';

import classes from '@/shell/css/header.module.css';
import { Navigation, NavDrawer } from './navigation';
import { SearchUsersWithCollapse } from './search';
import { Notifications } from './notif';
import { AuthDrawer, LoginButton } from './authentification';
import { UserMenu } from './menu/user';
import { useGlobalStore } from '@/core/hooks';

export const Header: React.FC = () => {
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
            <Controls openAuth={openAuth} />
          </Group>
        </Flex>
      </header>

      <AuthDrawer opened={openedAuth} onClose={closeAuth} />
      <NavDrawer stack={stack} />
    </Box>
  );
};

const Controls: React.FC<{ openAuth: () => void }> = observer(({ openAuth }) => {
  const { userStore } = useGlobalStore();
  const isSmallScreen = useMediaQuery('(max-width : 455px)');
  const [opened, { close, toggle }] = useDisclosure(false);

  return (
    <>
      <SearchUsersWithCollapse opened={opened} close={close} toggle={toggle} />
      {!(isSmallScreen && opened) && (
        <>
          {userStore.isAuth && <Notifications />}
          {!userStore.isAuth && <LoginButton onClick={openAuth} />}
          <UserMenu />
        </>
      )}
    </>
  );
});
