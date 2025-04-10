import { Board } from 'src/shared/components/board/board';
import { FenInput } from 'src/shared/components/fen/feninput';
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
