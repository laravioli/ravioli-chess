import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Switch, Loader } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { usePageStore } from '@/core/hooks';
import { getEval } from '@/lib/eval/utils';

import classes from '@/analyse/css/eval.module.css';
import type { AnalyseStore } from '@/analyse/store/analyse';

export const EvalToggle: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();

  useEffect(() => {}, []);

  return (
    <Switch
      checked={analyseStore.ceval.isActive}
      classNames={{ track: classes.toggle }}
      disabled={analyseStore.ceval.isDisabled}
      onChange={(e) => analyseStore.toggleCeval(e.target.checked)}
      color="teal"
      size="md"
      thumbIcon={
        analyseStore.ceval.isActive ? (
          <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
        ) : (
          <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
        )
      }
    />
  );
});

export const EvalScore: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();

  const evaluation = analyseStore.node.ceval;
  const isActive = analyseStore.ceval.isActive;
  let score: string | null = null;

  if (evaluation && !analyseStore.node.outcome) {
    score = getEval(evaluation);
  }

  if (analyseStore.node.outcome && isActive) {
    score = '-';
  }

  return (
    <span className={classes.score}>
      {isActive && !score ? <Loader color="gray" type="dots" /> : score}
    </span>
  );
});

export const Depth = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const evaluation = analyseStore.node.ceval;
  let depth = '';

  if (analyseStore.node.outcome) depth = 'Game Over';
  else if (evaluation && !evaluation.mate) depth = `depth : ${evaluation.depth}`;
  return <span className={classes.info}>{depth}</span>;
});
