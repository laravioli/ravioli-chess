import clsx from 'clsx';
import { Stack, Group } from '@mantine/core';
import { History } from 'src/common/components/tools/history.jsx';
import classes from './tools.module.css';

export const Tools = () => {
  return (
    <Stack className={clsx(['toolbar', classes.tools])}>
      <Group className={classes.history} justify="space-evenly">
        <div className="space" />
        <History size="xl" />
      </Group>
    </Stack>
  );
};
