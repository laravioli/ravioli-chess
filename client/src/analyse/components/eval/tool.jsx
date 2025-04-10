import { EvalToggle } from './toggle';
import { EvalScore } from './score';
import classes from '../css/eval.module.css';

export const EvalTool = () => {
  return (
    <div className={classes.evaltool}>
      <EvalToggle />
      <EvalScore />
      <span className={classes.evalname}>SF 16</span>
    </div>
  );
};
