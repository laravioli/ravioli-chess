import { useModule } from 'src/shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { getEval } from '../move/utils';
import classes from '../css/eval.module.css';

export const EvalScore = () => {
  const analyse = useModule();
  const snap = useSnapshot(analyse);

  let score = '';
  const evaluation = snap.evaluation;

  if (evaluation) {
    if (evaluation.mate) {
      score = '#' + evaluation.mate;
    } else {
      score = getEval(evaluation);
    }
  }

  if (snap.game.outcome) {
    score = '-';
  }

  return <span className={classes.evalscore}>{score}</span>;
};
