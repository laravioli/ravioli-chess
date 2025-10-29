import { Stack, Group, Button } from '@mantine/core';
import { UserStatus } from './user';
import { History } from 'src/common/components/controls/history';
import clsx from 'clsx';
import classes from '../../css/tools.module.css';

export const Tools = () => {
  return (
    <Stack gap={0} className={clsx(classes.tools)}>
      <UserStatus />
      <Group className={classes.history} justify="space-evenly">
        <div className="space" />
        <History className={classes.historyButton} />
      </Group>
      <Button className={classes.button}>Rematch</Button>
      <Button className={classes.button}>New Opponent</Button>
      <UserStatus />
    </Stack>
  );
};
