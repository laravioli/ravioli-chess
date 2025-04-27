import { useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import classes from '../css/eval.module.css';

export const Depth = observer(() => {
  const { analyseStore } = useStore();
  const evaluation = analyseStore.evaluation;
  let depth = '';

  if (analyseStore.game.currentMove.outcome) depth = 'Game Over';
  else if (evaluation && !evaluation.outcome && !evaluation.mate)
    depth = `depth : ${analyseStore.evaluation?.depth}`;
  return <span className={classes.evalinfo}>{depth}</span>;
});
