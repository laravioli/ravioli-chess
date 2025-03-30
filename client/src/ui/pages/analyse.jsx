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
import { ToggleEval } from '../components/toolbar/eval';
import { History } from '../components/toolbar/history';

export function Analyse() {
  return (
    <div className="main-wrap">
      <Board />
      <FenInput />
      <div className="toolbar">
        <ToggleEval />
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
