import { Board } from '../board/board';
import { EditorToolBar } from './toolbar/editortoolbar';

export function Editor() {
  return (
    <div className="editor">
      <Board />
      <EditorToolBar />
    </div>
  );
}
