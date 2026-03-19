import clsx from 'clsx';

import { PageStoreProvider } from '@/core/context/provider';
import { Board } from '@/common/components/board';

import { useInitStore } from '@/analyse/store/init';
import layout from '@/analyse/css/layout.module.css';
import variables from '@/analyse/css/variables.module.css';
import { Controls } from './controls/controls';
import { Tools } from './tools/tools';
import { MaybeEvalBar } from './tools/eval/bar';
import { FenInput } from './underboard/feninput';

const Analyse: React.FC = () => {
  const makeStore = useInitStore();
  return (
    <PageStoreProvider factory={makeStore}>
      <div className={clsx(layout.analyse, variables.analyse)}>
        <MaybeEvalBar />
        <Board />
        <div className={clsx(layout.side)}>
          <Tools />
          <Controls />
        </div>
        <div className={layout.copyables}>
          <FenInput />
        </div>
      </div>
    </PageStoreProvider>
  );
};

export default Analyse;
