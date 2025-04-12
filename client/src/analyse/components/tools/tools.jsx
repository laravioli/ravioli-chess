import { EvalTool } from '../eval/tool';
import { Moves } from '../move/move';
import { Controls } from '../controls/controls';

export const Tools = () => {
  return (
    <div className="toolbar">
      <EvalTool />
      <Moves />
      <Controls />
    </div>
  );
};
