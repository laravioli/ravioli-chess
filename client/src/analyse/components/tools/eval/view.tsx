import { EvalToggle, EvalScore, Depth } from "./info";
import { Settings } from "./settings";
import classes from "../../../css/eval.module.css";

export const Eval = () => {
  return (
    <div className={classes.eval}>
      <EvalToggle />
      <EvalScore />
      <span className={classes.info}>SF 16</span>
      <Depth />
      <Settings />
    </div>
  );
};
