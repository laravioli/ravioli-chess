import { EvalToggle } from './toggle';
import { EvalScore } from './score';
import styles from '../css/eval.module.css';

export const EvalTool = () => {
  return (
    <div className={styles.evaltool}>
      <EvalToggle />
      <EvalScore />
      <span className={styles.evalname}>SF 16</span>
    </div>
  );
};
