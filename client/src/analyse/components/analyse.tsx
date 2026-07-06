import clsx from 'clsx';

import { Board } from '@/common/components/board';
import { PageStoreProvider } from '@/core/context/provider';

import layout from '@/analyse/css/layout.module.css';
import variables from '@/analyse/css/variables.module.css';
import { useInitStore } from '@/analyse/store/init';
import { Controls } from './controls/controls';
import { MaybeEvalBar } from './tools/eval/bar';
import { Tools } from './tools/tools';
import { FenInput } from './underboard/feninput';

const Analyse: React.FC = () => {
  const makeStore = useInitStore();
  return (
    <PageStoreProvider factory={makeStore}>
      <div className={clsx(layout.analyse, variables.analyse)}>
        <MaybeEvalBar />
        <Board />
        <aside className={clsx(layout.side)}>
          <Tools />
          <Controls />
        </aside>
        <div className={layout.copyables}>
          <FenInput />
        </div>
      </div>
    </PageStoreProvider>
  );
};

export default Analyse;
