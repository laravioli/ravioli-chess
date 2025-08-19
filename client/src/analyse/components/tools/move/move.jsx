import { useLocalStorage, usePageStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";
import { Paper } from "@mantine/core";
import { Pvs } from "../eval/pvs.jsx";
import { renderLine } from "./utils.jsx";
import classes from "./move.module.css";

export const Moves = () => {
  return (
    <Paper className={classes.moves}>
      <Pvs />
      <Line />
    </Paper>
  );
};

const Line = observer(() => {
  const analyseStore = usePageStore();
  const handlers = {
    click: (event) => {
      if (event.target.dataset.p !== undefined) {
        analyseStore.jump(event.target.dataset.p);
      }
    },
  };

  return <>{renderLine(analyseStore.mainline, handlers)}</>;
});
