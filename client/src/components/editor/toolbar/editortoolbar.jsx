import { TurnToPlay } from '../fen/turn';
import { CastlingBoxes } from '../fen/fencontrols';
import { EditorActions } from './actions';

export function EditorToolBar() {
  return (
    <div className="editor-toolbar">
      <div className="fen-controls">
        <TurnToPlay />
        <CastlingBoxes />
      </div>
      <EditorActions />
    </div>
  );
}
