import { PageContext } from 'src/main/context/context';
import { useStore } from 'src/main/hooks/hooks';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export default function Editor() {
  const { editorStore } = useStore();

  return (
    <PageContext.Provider value={editorStore}>
      <div className={'page-editor'}>
        <Board />
        <FenInput />
        <Tools />
      </div>
    </PageContext.Provider>
  );
}
