import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { getEval } from '../move/utils';
import classes from './eval.module.css';

export const EvalScore = observer(() => {
  console.log('i render too much');
  const store = usePageStore();

  const evaluation = store.evaluation;
  let score = '';

  if (evaluation) {
    if (evaluation.mate) {
      score = '#' + evaluation.mate;
    } else {
      score = getEval(evaluation);
    }
  }

  if (store.game.currentMove.outcome && store.ceval.enabled) {
    score = '-';
  }

  return <span className={classes.evalscore}>{score}</span>;
});
