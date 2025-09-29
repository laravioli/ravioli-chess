import { useInitStore } from '../store/init';
import { PageStoreProvider } from 'src/main/context/provider';
import { EvalBar } from './tools/eval/bar';
import { Board } from 'src/common/components/board';
import { FenInput } from './underboard/feninput';
import { Tools } from './tools/tools';
import { Controls } from './controls/controls';
import clsx from 'clsx';
import layout from '../css/layout.module.css';
import variables from '../css/variables.module.css';

const Side = () => (
  <div className={clsx(layout.side, 'mantine-visible-from-sm')}>
    <Tools />
    <Controls />
  </div>
);

const Analyse = () => {
  const makeStore = useInitStore();
  return (
    <PageStoreProvider factory={makeStore}>
      <div className={clsx(layout.analyse, variables.analyse)}>
        <EvalBar />
        <Board />
        <Side />
        <div className={layout.copyables}>
          <FenInput />
        </div>
      </div>
    </PageStoreProvider>
  );
};

export default Analyse;
