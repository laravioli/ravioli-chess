import { useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { getEval } from '../move/utils';
import classes from '../css/eval.module.css';

export const EvalScore = observer(() => {
  const { analyseStore } = useStore();

  let score = '';
  const evaluation = analyseStore.evaluation;

  if (evaluation) {
    if (evaluation.mate) {
      score = '#' + evaluation.mate;
    } else {
      score = getEval(evaluation);
    }
  }

  if (analyseStore.game.currentMove.outcome && analyseStore.ceval.enabled) {
    score = '-';
  }

  return <span className={classes.evalscore}>{score}</span>;
});
