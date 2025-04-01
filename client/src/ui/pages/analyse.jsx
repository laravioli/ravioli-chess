import { Board } from '../components/board/board';
import { FenInput } from '../components/fen/feninput';
import { TurnToPlay } from '../components/fen/turn';
import { CastlingBoxes } from '../components/fen/castlings';
import {
  Position,
  Navigate,
  Buttons,
  StartButton,
  FlipButton,
} from '../components/toolbar/actions';
import { History } from '../components/toolbar/history';
import { EvalBar } from '../components/eval/bar';
import { EvalTool } from '../components/eval/tool';

export function Analyse() {
  return (
    <div className="main-wrap">
      <EvalBar />
      <Board />
      <FenInput />
      <div className="toolbar">
        <EvalTool />
        <div className="fen-controls">
          <TurnToPlay />
          <CastlingBoxes />
        </div>
        <Position />
        <Navigate path="/editor" />
        <Buttons>
          <StartButton />
          <FlipButton />
        </Buttons>
        <History />
      </div>
    </div>
  );
}
