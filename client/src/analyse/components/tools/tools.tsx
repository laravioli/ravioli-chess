import clsx from "clsx";
import { Eval } from "./eval/view";
import { Pvs } from "./eval/pvs";
import { TView } from "./tview";
import { Paper } from "@mantine/core";
import layout from "../../css/layout.module.css";
import classes from "../../css/tools.module.css";

export const Tools = () => {
  return (
    <div className={clsx(layout.tools, classes.tools)}>
      <Eval />
      <Paper className={classes.paper}>
        <Pvs />
        <TView />
      </Paper>
    </div>
  );
};
