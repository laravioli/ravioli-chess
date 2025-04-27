import { EvalToggle } from './toggle';
import { EvalScore } from './score';
import { Depth } from './depth';
import { Settings } from './settings';
import classes from '../css/eval.module.css';

export const EvalTool = () => {
  return (
    <div className={classes.evaltool}>
      <EvalToggle />
      <EvalScore />
      <span className={classes.evalinfo}>SF 16</span>
      <Depth />
      <Settings />
    </div>
  );
};
