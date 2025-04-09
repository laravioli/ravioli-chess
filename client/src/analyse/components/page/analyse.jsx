import { EvalBar } from '../eval/bar';
import { Board } from 'src/shared/components/board/board';
import { FenInput } from 'src/shared/components/fen/feninput';
import { EvalTool } from '../eval/tool';
import { EvalBox } from '../eval/box';
import { Controls } from 'src/shared/components/toolbar/controls';
import { Position } from 'src/shared/components/toolbar/position';
import { Navigate } from 'src/shared/components/toolbar/navigate';
import { StartButton } from 'src/shared/components/toolbar/start';
import { FlipButton } from 'src/shared/components/toolbar/flip';
import { TestButton } from 'src/shared/components/toolbar/test';
import { History } from '../history';

export function Analyse() {
  return (
    <div className="main-wrap">
      <EvalBar />
      <Board />
      <FenInput />
      <div className="toolbar">
        <Position />
        <EvalTool />
        <div className="fen-controls">
          <EvalBox />
        </div>
        <History />
        <Controls>
          <StartButton />
          <FlipButton />
          <TestButton />
          <Navigate path="/editor" />
        </Controls>
      </div>
    </div>
  );
}
