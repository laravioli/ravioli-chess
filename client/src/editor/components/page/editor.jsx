import { PageStoreProvider } from 'src/main/context/provider';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

const Editor = () => {
  return (
    <PageStoreProvider>
      <div className={'page-editor'}>
        <Board />
        <FenInput />
        <Tools />
      </div>
    </PageStoreProvider>
  );
};

export default Editor;
