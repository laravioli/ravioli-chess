import {
  Anchor,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { AuthenticationForm } from './authentification.jsx';
import { ToggleColorScheme } from './colorscheme.jsx';
import { useDisclosure } from '@mantine/hooks';
import classes from './header.module.css';

export function Header() {
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  return (
    <Box pb={10}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          Raviolichess
          <Group h="100%" gap={0} visibleFrom="sm">
            <a href="/play" className={classes.link}>
              Play
            </a>

            <a href="/analysis" className={classes.link}>
              Analyse
            </a>
            <a href="/editor" className={classes.link}>
              Edit
            </a>
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
        <AuthenticationForm />
      </Drawer>
    </Box>
  );
}
