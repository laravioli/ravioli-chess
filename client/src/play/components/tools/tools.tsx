import clsx from 'clsx';
import { Stack, Group, Button } from '@mantine/core';

import { History } from '@/common/components/controls/history';

import classes from '@/play/css/tools.module.css';
import { UserStatus } from './user';

export const Tools = () => {
  return (
    <Stack
      gap={0}
      className={clsx(classes.tools)}
    >
      <UserStatus />
      <Group
        className={classes.history}
        justify="space-evenly"
      >
        <div className="space" />
        <History className={classes.historyButton} />
      </Group>
      <Button className={classes.button}>Rematch</Button>
      <Button className={classes.button}>New Opponent</Button>
      <UserStatus />
    </Stack>
  );
};
