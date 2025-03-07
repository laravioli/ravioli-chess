import { Board } from '../board/board';
import { FenInput } from './fen/feninput';
import { EditorToolBar } from './toolbar/editortoolbar';

export function Editor() {
  return (
    <div className="editor">
      <Board />
      <FenInput />
      <EditorToolBar />
    </div>
  );
}
