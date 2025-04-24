import { EvalBar } from '../eval/bar';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export function Analyse() {
  return (
    <div className="main-wrap">
      <EvalBar />
      <Board />
      <FenInput />
      <Tools />
    </div>
  );
}
