import { useLocalStore, useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Paper } from '@mantine/core';
import { renderPvs } from './utils.jsx';
import { renderLine } from './utils';
import classes from '../css/move.module.css';

export const Moves = () => {
  return (
    <Paper
      className={classes.move}
      padding="sm"
      shadow="xl"
      radius=""
      withBorder>
      <Pvs />
      <Line />
    </Paper>
  );
};

const Pvs = observer(() => {
  const { analyseStore } = useStore();
  const multipv = useLocalStore((state) => state.multipv);

  return (
    <>
      {analyseStore.ceval.enabled &&
        !analyseStore.game.currentMove.outcome &&
        renderPvs(analyseStore.evaluation, multipv)}
    </>
  );
});

const Line = observer(() => {
  const { analyseStore } = useStore();

  return <>{renderLine(analyseStore.game.line)}</>;
});
