import { useStore, usePageStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";
import { povChances } from "src/lib/eval/utils";
import classes from "./eval.module.css";

export const EvalBar = observer(() => {
  const { uiStore } = useStore();
  const analyseStore = usePageStore();

  if (!analyseStore.ceval.enabled || analyseStore.node.outcome) return null;

  const progress = analyseStore.node.ceval
    ? povChances("white", analyseStore.node.ceval)
    : 0.0;

  return (
    <div
      className={[classes.bar, classes.barblack].join(" ")}
      style={{
        transform: uiStore.orientation === "black" ? "rotate(180deg)" : "",
      }}
    >
      <div
        className={classes.barwhite}
        style={{
          height: `${(progress + 1) * 50}%`,
        }}
      ></div>
    </div>
  );
});
