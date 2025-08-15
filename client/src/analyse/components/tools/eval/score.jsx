import { usePageStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";
import { getEval } from "../move/utils";
import classes from "./eval.module.css";

export const EvalScore = observer(() => {
  const analyseStore = usePageStore();

  const evaluation = analyseStore.node.ceval;
  let score = "";

  if (evaluation) {
    if (evaluation.mate) {
      score = "#" + evaluation.mate;
    } else {
      score = getEval(evaluation);
    }
  }

  if (analyseStore.node.outcome && analyseStore.ceval.enabled) {
    score = "-";
  }

  return <span className={classes.evalscore}>{score}</span>;
});
