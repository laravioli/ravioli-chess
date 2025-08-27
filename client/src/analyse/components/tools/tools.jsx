import clsx from "clsx";
import { Eval } from "./eval/view.jsx";
import { Pvs } from "./eval/pvs.jsx";
import { TView } from "./moves/tview.jsx";
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
