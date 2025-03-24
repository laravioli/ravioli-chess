import { Board } from '../components/board/board';
import { FenInput } from '../components/fen/feninput';
import { TurnToPlay } from '../components/fen/turn';
import { CastlingBoxes } from '../components/fen/fencontrols';
import {
  Position,
  Navigate,
  Buttons,
  StartButton,
  FlipButton,
  ToggleEval,
} from '../components/toolbar/actions';
import { History } from '../components/toolbar/history';

export function Analyse() {
  return (
    <div className="main-wrap">
      <Board />
      <FenInput />
      <div className="toolbar">
        <div className="fen-controls">
          <TurnToPlay />
          <CastlingBoxes />
        </div>
        <Position />
        <Navigate path="/editor" />
        <Buttons>
          <StartButton />
          <FlipButton />
          <ToggleEval />
        </Buttons>
        <History />
      </div>
    </div>
  );
}
