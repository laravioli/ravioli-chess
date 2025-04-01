import styles from './bar.module.css';
import { useMainStore } from 'src/stores';

export const EvalBar = () => {
  const enabled = useMainStore((state) => state.evalEnabled);
  const evaluation = useMainStore((state) => state.evalScore);
  console.log(evaluation);

  if (!enabled) return null;

  return (
    <div className={[styles.bar, styles.barblack].join(' ')}>
      <div
        className={styles.barwhite}
        style={{ height: `${100 - (evaluation + 1) * 50}%` }}></div>
    </div>
  );
};
