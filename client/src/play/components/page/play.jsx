import { PageStoreProvider } from 'src/main/context/provider';
import { Board } from 'src/common/components/board/board';

export default function Play() {
  return (
    <PageStoreProvider>
      <div className={'page-play'}>
        <Board />
      </div>
    </PageStoreProvider>
  );
}
