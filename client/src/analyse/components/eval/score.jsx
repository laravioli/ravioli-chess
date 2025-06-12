import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { getEval } from '../move/utils';
import classes from './eval.module.css';

export const EvalScore = observer(() => {
  const pageStore = usePageStore();

  const evaluation = pageStore.evaluation;
  let score = '';

  if (evaluation) {
    if (evaluation.mate) {
      score = '#' + evaluation.mate;
    } else {
      score = getEval(evaluation);
    }
  }

  if (pageStore.game.currentMove.outcome && pageStore.ceval.enabled) {
    score = '-';
  }

  return <span className={classes.evalscore}>{score}</span>;
});
