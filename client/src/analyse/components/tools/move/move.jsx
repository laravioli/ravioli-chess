import { useLocalStorage, usePageStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";
import { Paper } from "@mantine/core";
import { renderPvs, renderLine } from "./utils.jsx";
import classes from "./move.module.css";

export const Moves = () => {
  return (
    <Paper
      className={classes.moves}
      padding="sm"
      shadow="xl"
      radius=""
      withBorder
    >
      <Pvs />
      <Line />
    </Paper>
  );
};

const Pvs = observer(() => {
  const analyseStore = usePageStore();
  const multipv = useLocalStorage().evalStorage.multipv;
  return (
    <>
      {analyseStore.ceval.enabled &&
        !analyseStore.node.outcome &&
        renderPvs(analyseStore.node.ceval, multipv)}
    </>
  );
});

const Line = observer(() => {
  const analyseStore = usePageStore();

  return <>{renderLine(analyseStore.mainline)}</>;
});
