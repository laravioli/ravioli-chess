import { EditorActions } from './actions';
import { FenInput } from './input';

export function EditorToolBar() {
  return (
    <div className="editor-toolbar">
      <EditorActions />
      <FenInput />
    </div>
  );
}
