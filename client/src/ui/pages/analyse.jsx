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
import { EvalToggle } from '../components/eval/toggle';
import { History } from '../components/toolbar/history';
import { EvalBar } from '../components/eval/bar';

//todo : find a way to not render all analyse (either eval component or zustand state or storage)

export function Analyse() {
  return (
    <div className="main-wrap">
      <EvalBar />
      <Board />
      <FenInput />
      <div className="toolbar">
        <EvalToggle />
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
