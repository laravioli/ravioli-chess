import { Stack, Group, Button } from "@mantine/core";
import { UserStatus } from "./user";
import { History } from "src/common/components/controls/history";
import clsx from "clsx";
import layout from "../../css/layout.module.css";
import classes from "../../css/tools.module.css";
import { icon } from "src/common/css/icon.module.css";

export const Tools = () => {
  return (
    <Stack gap={0} className={clsx(layout.tools, classes.tools)}>
      <UserStatus />
      <Group className={classes.history} justify="space-evenly">
        <div className="space" />
        <History className={icon} size="xl" />
      </Group>
      <Button className={classes.button}>Rematch</Button>
      <Button className={classes.button}>New Opponent</Button>
      <UserStatus />
    </Stack>
  );
};
