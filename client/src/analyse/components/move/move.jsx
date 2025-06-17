import { useLocalStorage, usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Paper } from '@mantine/core';
import { renderPvs } from './utils.jsx';
import { renderLine } from './utils';
import classes from './move.module.css';

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
  const pageStore = usePageStore();
  const multipv = useLocalStorage().evalStorage.multipv;
  return (
    <>
      {pageStore.ceval.enabled &&
        !pageStore.game.currentMove.outcome &&
        renderPvs(pageStore.evaluation, multipv)}
    </>
  );
});

const Line = observer(() => {
  const pageStore = usePageStore();

  return <>{renderLine(pageStore.game.line)}</>;
});
