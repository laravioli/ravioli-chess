import { useMainStore } from 'src/shared/hooks/hooks';
import { renderEval } from 'src/lib/eval/util';
import classes from '../css/eval.module.css';

export const EvalScore = () => {
  const evaluation = useMainStore((state) => state.analyse.evaluation);
  const outcome = useMainStore((state) => state.game.outcome());
  let score = '';

  if (evaluation) {
    if (evaluation.mate) {
      score = '#' + evaluation.mate;
    } else {
      score = renderEval(evaluation.cp);
    }
  }

  if (outcome) {
    score = '-';
  }

  return <span className={classes.evalscore}>{score}</span>;
};
