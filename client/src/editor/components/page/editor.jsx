import { Board } from 'src/shared/components/board/board';
import { FenInput } from 'src/shared/components/fen/feninput';
import { TurnToPlay } from '../controls/turn';
import { CastlingBoxes } from '../controls/castlings';
import { Position } from 'src/shared/components/toolbar/position';
import { Navigate } from 'src/shared/components/toolbar/navigate';
import { Controls } from 'src/shared/components/toolbar/controls';
import { StartButton } from 'src/shared/components/toolbar/start';
import { ClearButton } from '../controls/clear';
import { FlipButton } from 'src/shared/components/toolbar/flip';
import { TestButton } from 'src/shared/components/toolbar/test';

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
        <Controls>
          <StartButton />
          <ClearButton />
          <FlipButton />
          <TestButton />
          <Navigate path="/analysis" />
        </Controls>
      </div>
    </div>
  );
}
