import styles from './eval.module.css';
import { useMainStore } from '../../../stores';
import { renderEval } from 'src/logic/lib/eval/util';

export const EvalScore = () => {
  const evaluation = useMainStore((state) => state.evaluation);
  const outcome = useMainStore((state) => state.outcome);
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

  return <span className={styles.evalscore}>{score}</span>;
};
