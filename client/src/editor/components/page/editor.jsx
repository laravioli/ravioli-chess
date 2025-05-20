import { useStore } from 'src/main/hooks/hooks';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export default function Editor() {
  const { editorStore } = useStore();
  return (
    <div className="main-wrap">
      <Board board={editorStore.board} config={editorStore.makeBoardCfg()} />
      <FenInput store={editorStore} />
      <Tools />
    </div>
  );
}
