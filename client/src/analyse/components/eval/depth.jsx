import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import classes from './eval.module.css';

export const Depth = observer(() => {
  const pageStore = usePageStore();
  const evaluation = pageStore.evaluation;
  let depth = '';

  if (pageStore.game.currentMove.outcome) depth = 'Game Over';
  else if (evaluation && !evaluation.outcome && !evaluation.mate)
    depth = `depth : ${pageStore.evaluation?.depth}`;
  return <span className={classes.evalinfo}>{depth}</span>;
});
