import { useMainStore } from 'src/shared/hooks/hooks';
import { povChances } from 'src/lib/eval/util';
import classes from '../css/eval.module.css';

export const EvalBar = () => {
  const enabled = useMainStore((state) => state.eval.enabled);
  const outcome = useMainStore((state) => state.game.outcome());
  const evaluation = useMainStore((state) => state.analyse.evaluation);
  const side = useMainStore((state) => state.side);

  if (!enabled || outcome) return null;

  const progress = evaluation ? povChances('white', evaluation) : 0.0;

  return (
    <div
      className={[classes.bar, classes.barblack].join(' ')}
      style={side === 'black' ? { transform: 'rotate(180deg)' } : {}}>
      <div
        className={classes.barwhite}
        style={{ height: `${(progress + 1) * 50}%` }}></div>
    </div>
  );
};
