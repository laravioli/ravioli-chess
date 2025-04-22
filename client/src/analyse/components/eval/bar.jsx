import { useModule } from '../../../shared/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { povChances } from 'src/lib/eval/util';
import classes from '../css/eval.module.css';

export const EvalBar = observer(() => {
  const analyse = useModule();

  if (!analyse.ceval.enabled || analyse.game.currentMove.outcome) return null;

  const progress = analyse.evaluation
    ? povChances('white', analyse.evaluation)
    : 0.0;

  return (
    <div className={[classes.bar, classes.barblack].join(' ')}>
      <div
        className={classes.barwhite}
        style={{ height: `${(progress + 1) * 50}%` }}></div>
    </div>
  );
});
