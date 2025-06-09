import clsx from 'clsx';
import { PageContext } from 'src/main/context/context';
import { useStore } from 'src/main/hooks/hooks';
import { Board } from 'src/common/components/board/board';

export default function Play() {
  const { playStore } = useStore();
  return (
    <PageContext.Provider value={playStore}>
      <div className={clsx('main-wrap', 'page-play')}>
        <Board />
      </div>
    </PageContext.Provider>
  );
}
