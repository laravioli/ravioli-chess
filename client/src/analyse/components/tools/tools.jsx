import clsx from "clsx";
import { EvalTool } from "./eval/tool";
import { DisplayArea } from "./move/display";

export const Tools = () => {
  return (
    <div className={clsx("toolbar", "mantine-visible-from-sm")}>
      <EvalTool />
      <DisplayArea />
    </div>
  );
};
