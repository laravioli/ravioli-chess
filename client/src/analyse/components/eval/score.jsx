import { useMainStore } from 'src/shared/hooks/hooks';
import styles from '../css/eval.module.css';
import { renderEval } from 'src/lib/eval/util';

export const EvalScore = () => {
  const evaluation = useMainStore((state) => state.analyse.evaluation);
  const outcome = useMainStore((state) => state.game.outcome());
  let score = '';
  console.log(outcome);

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

  return <span className={styles.evalscore}>{score}</span>;
};
