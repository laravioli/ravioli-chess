import { usePageStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";
import classes from "./eval.module.css";

export const Depth = observer(() => {
  const analyseStore = usePageStore();
  const evaluation = analyseStore.node.ceval;
  let depth = "";

  if (analyseStore.node.outcome) depth = "Game Over";
  else if (evaluation && !evaluation.mate)
    depth = `depth : ${evaluation.depth}`;
  return <span className={classes.evalinfo}>{depth}</span>;
});
