import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { povChances } from 'src/lib/eval/utils';
import classes from '../../../css/eval.module.css';
import type { AnalyseStore } from 'src/analyse/store/analyse';
import { useRef } from 'react';

export const EvalBar = observer(() => {
  const store = usePageStore<AnalyseStore>();
  const progress = useRef(0);
  const ev = store.node.ceval;

  if (!store.ceval.enabled || store.node.outcome) return null;

  if (ev) {
    progress.current = povChances('white', ev);
  }

  return (
    <div
      className={[classes.bar, classes.barblack].join(' ')}
      style={{
        transform: store.orientation === 'black' ? 'rotate(180deg)' : '',
      }}
    >
      <div
        className={classes.barwhite}
        style={{
          height: `${(progress.current + 1) * 50}%`,
        }}
      ></div>
    </div>
  );
});
