import { Board } from '../components/board/board';
import { FenInput } from '../components/editor/fen/feninput';
import { EditorToolBar } from '../components/editor/toolbar/editortoolbar';

export function Editor() {
  return (
    <div className="editor">
      <Board />
      <FenInput />
      <EditorToolBar />
    </div>
  );
}
