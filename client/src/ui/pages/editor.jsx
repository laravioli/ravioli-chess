import { Board } from '../components/board/board';
import { FenInput } from '../components/fen/feninput';
import { TurnToPlay } from '../components/fen/turn';
import { CastlingBoxes } from '../components/fen/fencontrols';
import { EditorActions } from '../components/toolbar/actions';

export function Editor() {
  return (
    <div className="editor">
      <Board />
      <FenInput />
      <div className="editor-toolbar">
        <div className="fen-controls">
          <TurnToPlay />
          <CastlingBoxes />
        </div>
        <EditorActions path="/analysis" />
      </div>
    </div>
  );
}
