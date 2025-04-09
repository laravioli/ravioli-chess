import { EvalTool } from '../eval/tool';
import { AnalyseBox } from '../eval/box';
import { AnalyseControls } from '../controls/controls';

export function Tools() {
  return (
    <div className="toolbar">
      <EvalTool />
      <AnalyseBox />
      <AnalyseControls />
    </div>
  );
}
