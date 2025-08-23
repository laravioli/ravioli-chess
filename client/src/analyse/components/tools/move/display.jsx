import { Paper } from "@mantine/core";
import { Pvs } from "../eval/pvs.jsx";
import { TView } from "./tview.jsx";
import classes from "./move.module.css";

export const DisplayArea = () => {
  return (
    <Paper className={classes.displayarea}>
      <Pvs />
      <TView />
    </Paper>
  );
};
