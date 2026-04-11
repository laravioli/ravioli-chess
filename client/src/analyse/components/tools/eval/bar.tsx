import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useMediaQuery } from '@mantine/hooks';

import { usePageStore } from '@/core/hooks';
import { povChances } from '@/lib/eval/utils';

import classes from '@/analyse/css/eval.module.css';
import type { AnalyseStore } from '@/analyse/store/analyse';

export const MaybeEvalBar: React.FC = () => {
  const isSmallScreen = useMediaQuery('(max-width: 765px)');
  return isSmallScreen ? null : <EvalBar />;
};

const EvalBar: React.FC = observer(() => {
  const store = usePageStore<AnalyseStore>();
  const progress = useRef(0);
  const ev = store.node.ceval;

  if (!store.cenabled || store.node.outcome) return null;

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
