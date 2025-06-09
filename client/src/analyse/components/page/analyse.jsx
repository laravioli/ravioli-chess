import { PageContext } from 'src/main/context/context';
import { useStore } from 'src/main/hooks/hooks';
import { EvalBar } from '../eval/bar';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export default function Analyse() {
  const { analyseStore } = useStore();
  return (
    <PageContext.Provider value={analyseStore}>
      <div className={'page-analyse'}>
        <EvalBar />
        <Board />
        <FenInput />
        <Tools />
      </div>
    </PageContext.Provider>
  );
}
