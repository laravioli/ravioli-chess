import { Group, Stack } from '@mantine/core';
import styles from '../css/toolbar.module.css';

export function Controls({ children }) {
  return (
    <>
      <Stack
        h={100}
        bg="var(--mantine-color-body)"
        align="flex-start"
        justify="flex-start"
        gap="md">
        {' '}
        {children}
      </Stack>
    </>
  );
}
