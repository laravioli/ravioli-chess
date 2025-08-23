import { Group } from "@mantine/core";
import { History } from "src/common/components/tools/history.jsx";
import { Actions } from "./actions";
import classes from "./controls.module.css";

export const Controls = () => {
  return (
    <div className={classes.controls}>
      <Group className={classes.history} justify="space-evenly">
        <History size="xxl" />
      </Group>
      <Actions />
    </div>
  );
};
