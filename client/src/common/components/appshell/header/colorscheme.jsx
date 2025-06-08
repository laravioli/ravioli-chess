import {
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import classes from './header.module.css';

export function ToggleColorScheme() {
  const { toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() => toggleColorScheme()}
      variant="default"
      style={{ border: 0 }}
      size="lg"
      aria-label="Toggle color scheme">
      {computedColorScheme === 'dark' ? (
        <IconSun stroke={1.5} />
      ) : (
        <IconMoon stroke={1.5} />
      )}
    </ActionIcon>
  );
}
