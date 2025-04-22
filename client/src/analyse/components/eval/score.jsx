import { useModule } from 'src/shared/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { getEval } from '../move/utils';
import classes from '../css/eval.module.css';

export const EvalScore = observer(() => {
  const analyse = useModule();

  let score = '';
  const evaluation = analyse.evaluation;

  if (evaluation) {
    if (evaluation.mate) {
      score = '#' + evaluation.mate;
    } else {
      score = getEval(evaluation);
    }
  }

  if (analyse.game.currentMove.outcome && analyse.ceval.enabled) {
    score = '-';
  }

  return <span className={classes.evalscore}>{score}</span>;
});
