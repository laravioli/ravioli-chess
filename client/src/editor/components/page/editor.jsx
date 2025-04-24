import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';

export function Editor() {
  return (
    <div className="main-wrap">
      <Board />
      <FenInput />
      <Tools />
    </div>
  );
}
