import { useEffect, useCallback } from 'react';
import { usePageStore, useLocalStorage } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { getEval } from 'src/lib/eval/utils';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import classes from '../../../css/eval.module.css';

export const EvalToggle = observer(() => {
  const analyseStore = usePageStore();
  const { evalStorage } = useLocalStorage();

  const onClick = useCallback(() => {
    analyseStore.toggleCeval();
  }, []);

  useEffect(() => {
    const unsub = reaction(
      () => evalStorage.disable,
      () => {
        if (analyseStore.ceval.enabled && !evalStorage.isTab) onClick();
      },
    );
    return unsub;
  }, []);

  return (
    <Switch
      classNames={{ track: classes.toggle }}
      checked={analyseStore.ceval.enabled}
      onClick={onClick}
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

export const EvalScore = observer(() => {
  const analyseStore = usePageStore();

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
  const analyseStore = usePageStore();
  const evaluation = analyseStore.node.ceval;
  let depth = '';

  if (analyseStore.node.outcome) depth = 'Game Over';
  else if (evaluation && !evaluation.mate) depth = `depth : ${evaluation.depth}`;
  return <span className={classes.info}>{depth}</span>;
});
