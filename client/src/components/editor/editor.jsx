import { Board } from '../board/board';
import { EditorToolBar } from './toolbar/editortoolbar';
import { FenInput } from './fen/feninput';

export function Editor() {
  return (
    <div className="editor">
      <Board />
      <FenInput />
      <EditorToolBar />
    </div>
  );
}
