import clsx from 'clsx';

import { PageStoreProvider } from '@/core/context/provider';
import { Board } from '@/common/components/board';

import layout from '@/play/css/layout.module.css';
import variables from '@/play/css/variables.module.css';
import { useInitStore } from '@/play/store/init';
import { Tools } from './tools/tools';

const Play: React.FC = () => {
  const makeStore = useInitStore();
  return (
    <PageStoreProvider factory={makeStore}>
      <div className={clsx(layout.play, variables.play)}>
        <Board />
        <Tools />
      </div>
    </PageStoreProvider>
  );
};

export default Play;
