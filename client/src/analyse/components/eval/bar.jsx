import { useModule } from '../../../shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { povChances } from 'src/lib/eval/util';
import classes from '../css/eval.module.css';

export const EvalBar = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);

  if (!snap.ceval.enabled || snap.game.currentMove.outcome) return null;

  const progress = snap.evaluation ? povChances('white', snap.evaluation) : 0.0;

  return (
    <div className={[classes.bar, classes.barblack].join(' ')}>
      <div
        className={classes.barwhite}
        style={{ height: `${(progress + 1) * 50}%` }}></div>
    </div>
  );
};
