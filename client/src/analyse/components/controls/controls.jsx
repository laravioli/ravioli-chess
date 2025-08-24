import { Group } from "@mantine/core";
import { History } from "src/common/components/controls/history.jsx";
import { Actions } from "./actions";
import classes from "./controls.module.css";
import clsx from "clsx";

export const Controls = () => {
  return (
    <div className={clsx("controls", classes.controls)}>
      <Group className={classes.history} justify="space-evenly">
        <History size="xxl" />
      </Group>
      <Actions />
    </div>
  );
};
