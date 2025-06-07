import clsx from 'clsx';
import { useStore } from 'src/main/hooks/hooks';
import { EvalBar } from '../eval/bar';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export default function Analyse() {
  const { analyseStore } = useStore();
  return (
    <div className={clsx('main-wrap', 'page-analyse')}>
      <EvalBar />
      <Board board={analyseStore.board} config={analyseStore.makeBoardCfg()} />
      <FenInput store={analyseStore} />
      <Tools />
    </div>
  );
}
