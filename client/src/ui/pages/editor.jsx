import { Board } from '../components/board/board';
import { FenInput } from '../components/fen/feninput';
import { TurnToPlay } from '../components/fen/turn';
import { CastlingBoxes } from '../components/fen/castlings';
import {
  Position,
  Navigate,
  Buttons,
  StartButton,
  ClearButton,
  FlipButton,
} from '../components/toolbar/buttons';

export function Editor() {
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
        <Navigate path="/analysis" />
        <Buttons>
          <StartButton />
          <ClearButton />
          <FlipButton />
        </Buttons>
      </div>
    </div>
  );
}
