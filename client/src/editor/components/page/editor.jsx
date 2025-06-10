import { PageContext } from 'src/main/context/context';
import { useStore } from 'src/main/hooks/hooks';
import { Board } from 'src/common/components/board/board';
import { FenInput } from 'src/common/components/fen/feninput';
import { Tools } from '../tools/tools';
import { useEffect } from 'react';
import { match } from 'src/main/boot';
import { useLocation } from 'react-router';

export default function Editor() {
  const statea = useLocation().state;
  const { editorStore } = useStore();
  console.log('start mounting editor');
  useEffect(() => {
    const lastStore = match(statea.lastPath);
    lastStore.onUnLoad();
    console.log('editor mounted finish');
    return () => console.log('editor unmoutned finish');
  });
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
