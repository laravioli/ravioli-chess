import { useLocalStore } from 'src/shared/hooks/hooks';
import { useModule } from '../../../shared/hooks/hooks';
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
  const analyse = useModule();
  const multipv = useLocalStore((state) => state.multipv);

  return (
    <>
      {analyse.ceval.enabled &&
        !analyse.game.currentMove.outcome &&
        renderPvs(analyse.evaluation, multipv)}
    </>
  );
});

const Line = observer(() => {
  const analyse = useModule();

  return <>{renderLine(analyse.game.line)}</>;
});
