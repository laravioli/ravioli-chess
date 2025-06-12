import { PageStoreProvider } from 'src/main/context/provider';
import { EvalBar } from '../eval/bar';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export default function Analyse() {
  return (
    <PageStoreProvider>
      <div className={'page-analyse'}>
        <EvalBar />
        <Board />
        <FenInput />
        <Tools />
      </div>
    </PageStoreProvider>
  );
}
