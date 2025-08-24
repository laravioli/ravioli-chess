import clsx from "clsx";
import { Stack, Group, Button } from "@mantine/core";
import { UserStatus } from "./user";
import { History } from "src/common/components/controls/history.jsx";
import classes from "./tools.module.css";

export const Tools = () => {
  return (
    <Stack gap={0} className={clsx(["toolbar", classes.tools])}>
      <UserStatus />
      <Group className={classes.history} justify="space-evenly">
        <div className="space" />
        <History size="xl" />
      </Group>
      <Button className={classes.button}>Rematch</Button>
      <Button className={classes.button}>New Opponent</Button>
      <UserStatus />
    </Stack>
  );
};
