import { PageStoreProvider } from 'src/main/context/provider';
import { Board } from 'src/common/components/board/board';

const Play = () => {
  return (
    <PageStoreProvider>
      <div className={'page-play'}>
        <Board />
      </div>
    </PageStoreProvider>
  );
};

export default Play;
