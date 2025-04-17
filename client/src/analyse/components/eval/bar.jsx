import { useModule } from '../../../shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { povChances } from 'src/lib/eval/util';
import classes from '../css/eval.module.css';

export const EvalBar = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);

  console.log(snap.outcome);

  if (!snap.enabled || snap.outcome) return null;

  const progress = snap.evaluation ? povChances('white', snap.evaluation) : 0.0;

  return (
    <div className={[classes.bar, classes.barblack].join(' ')}>
      <div
        className={classes.barwhite}
        style={{ height: `${(progress + 1) * 50}%` }}></div>
    </div>
  );
};
