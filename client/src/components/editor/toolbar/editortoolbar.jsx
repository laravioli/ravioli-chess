import { CastlingBoxes } from '../fen/fencontrols';
import { EditorActions } from './actions';
import { FenInput } from '../fen/feninput';

export function EditorToolBar() {
  return (
    <div className="editor-toolbar">
      <CastlingBoxes />
      <EditorActions />
      <FenInput />
    </div>
  );
}
