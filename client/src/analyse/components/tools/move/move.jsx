import { Paper } from "@mantine/core";
import { Pvs } from "../eval/pvs.jsx";
import { Line } from "./line.jsx";
import classes from "./move.module.css";

export const Moves = () => {
  return (
    <Paper className={classes.moves}>
      <Pvs />
      <Line />
    </Paper>
  );
};
