import styles from './eval.module.css';
import { EvalToggle } from './toggle';
import { EvalScore } from './score';

export const EvalTool = () => {
  return (
    <div className={styles.evaltool}>
      <EvalToggle />
      <EvalScore />
      <span className={styles.evalname}>SF 16</span>
    </div>
  );
};
