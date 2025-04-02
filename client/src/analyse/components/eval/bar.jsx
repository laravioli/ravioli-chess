import styles from '../css/eval.module.css';
import { useMainStore } from 'src/shared/hooks/hooks';
import { povChances } from 'src/lib/eval/util';

export const EvalBar = () => {
  const enabled = useMainStore((state) => state.evalEnabled);
  const outcome = useMainStore((state) => state.outcome);
  const evaluation = useMainStore((state) => state.evaluation);

  if (!enabled || outcome) return null;

  const progress = evaluation ? povChances('white', evaluation) : 0.0;

  return (
    <div className={[styles.bar, styles.barblack].join(' ')}>
      <div
        className={styles.barwhite}
        style={{ height: `${(progress + 1) * 50}%` }}></div>
    </div>
  );
};
