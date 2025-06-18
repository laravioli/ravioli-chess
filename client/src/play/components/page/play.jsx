import { PageStoreProvider } from 'src/main/context/provider';
import { Board } from 'src/common/components/board/board';
import { Tools } from '../tools/tools';

const Play = () => {
  return (
    <PageStoreProvider>
      <div className={'page-play'}>
        <Board />
        <Tools />
      </div>
    </PageStoreProvider>
  );
};

export default Play;
