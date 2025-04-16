import { useMainStore } from 'src/shared/hooks/hooks';
import { getEval } from '../move/utils';
import classes from '../css/eval.module.css';

import { useProxy } from '../../../shared/hooks/hooks';
import { useSnapshot } from 'valtio';

export const EvalScore = () => {
  const state = useProxy();
  console.log(state);
  const { evaluation } = useSnapshot(state);

  const outcome = useMainStore((state) => state.game.outcome());
  let score = '';

  if (evaluation) {
    if (evaluation.mate) {
      score = '#' + evaluation.mate;
    } else {
      score = getEval(evaluation);
    }
  }

  if (outcome) {
    score = '-';
  }

  return <span className={classes.evalscore}>{score}</span>;
};
