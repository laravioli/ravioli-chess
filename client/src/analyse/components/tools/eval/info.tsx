import { useEffect } from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { usePageStore, useLocalStorage } from '@/core/hooks/hooks';
import { getEval } from '@/lib/eval/utils';

import classes from '@/analyse/css/eval.module.css';
import type { AnalyseStore } from '@/analyse/store/analyse';

export const EvalToggle: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const { evalStorage } = useLocalStorage();

  useEffect(() => {
    const unsub = reaction(
      () => evalStorage.disable,
      () => {
        if (analyseStore.ceval.enabled && !evalStorage.isTab) analyseStore.toggleCeval();
      },
    );
    return unsub;
  }, []);

  return (
    <Switch
      classNames={{ track: classes.toggle }}
      checked={analyseStore.ceval.enabled}
      onClick={analyseStore.toggleCeval}
      color="teal"
      size="md"
      thumbIcon={
        analyseStore.ceval.enabled ? (
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
  let score = '';

  if (evaluation) {
    score = getEval(evaluation);
  }

  if (analyseStore.node.outcome && analyseStore.ceval.enabled) {
    score = '-';
  }

  return <span className={classes.score}>{score}</span>;
});

export const Depth = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const evaluation = analyseStore.node.ceval;
  let depth = '';

  if (analyseStore.node.outcome) depth = 'Game Over';
  else if (evaluation && !evaluation.mate) depth = `depth : ${evaluation.depth}`;
  return <span className={classes.info}>{depth}</span>;
});
