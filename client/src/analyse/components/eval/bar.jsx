import styles from '../css/eval.module.css';
import { useMainStore } from 'src/shared/hooks/hooks';
import { povChances } from 'src/lib/eval/util';

export const EvalBar = () => {
  const enabled = useMainStore((state) => state.eval.enabled);
  const outcome = useMainStore((state) => state.game.outcome());
  const evaluation = useMainStore((state) => state.analyse.evaluation);
  const side = useMainStore((state) => state.analyse.side);

  if (!enabled || outcome) return null;

  const progress = evaluation ? povChances('white', evaluation) : 0.0;

  return (
    <div
      className={[styles.bar, styles.barblack].join(' ')}
      style={side === 'black' ? { transform: 'rotate(180deg)' } : {}}>
      <div
        className={styles.barwhite}
        style={{ height: `${(progress + 1) * 50}%` }}></div>
    </div>
  );
};
