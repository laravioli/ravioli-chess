import clsx from "clsx";
import { EvalTool } from "./eval/tool";
import { DisplayArea } from "./move/display";
import { Controls } from "./controls/controls";

export const Tools = () => {
  return (
    <div className={clsx("toolbar", "mantine-visible-from-sm")}>
      <EvalTool />
      <DisplayArea />
      <Controls />
    </div>
  );
};
