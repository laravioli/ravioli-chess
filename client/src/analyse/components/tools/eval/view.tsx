import classes from '@/analyse/css/eval.module.css';
import { EvalToggle, EvalScore, Depth } from './info';
import { Settings } from './settings';

export const Eval: React.FC = () => {
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
