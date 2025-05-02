import { useStore } from 'src/main/hooks/hooks';
import { EvalBar } from '../eval/bar';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export function Analyse() {
  const { analyseStore } = useStore();
  return (
    <div className="main-wrap">
      <EvalBar />
      <Board board={analyseStore.board} config={analyseStore.makeBoardCfg()} />
      <FenInput store={analyseStore} />
      <Tools />
    </div>
  );
}
