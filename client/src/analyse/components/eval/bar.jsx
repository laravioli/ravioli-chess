import { useStore, usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { povChances } from 'src/lib/eval/util';
import classes from './eval.module.css';

export const EvalBar = observer(() => {
  const { uiStore } = useStore();
  const pageStore = usePageStore();

  if (!pageStore.ceval.enabled || pageStore.game.currentMove.outcome)
    return null;

  const progress = pageStore.evaluation
    ? povChances('white', pageStore.evaluation)
    : 0.0;

  return (
    <div
      className={[classes.bar, classes.barblack].join(' ')}
      style={{
        transform: uiStore.orientation === 'black' ? 'rotate(180deg)' : '',
      }}>
      <div
        className={classes.barwhite}
        style={{
          height: `${(progress + 1) * 50}%`,
        }}></div>
    </div>
  );
});
