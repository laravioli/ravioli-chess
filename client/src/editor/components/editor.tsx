import { useInitStore } from '../store/init';
import { PageStoreProvider } from 'src/main/context/provider';
import { Board } from 'src/common/components/board';
import { FenInput } from './fen/feninput';
import { Controls } from './controls/controls';
import { Actions } from './controls/actions';
import { SparePieces } from './spare/spare';
import clsx from 'clsx';
import layout from '../css/layout.module.css';
import variables from '../css/variables.module.css';
import classes from '../css/side.module.css';

const Side = () => (
  <div className={clsx(layout.side, classes.side, 'mantine-visible-from-sm')}>
    <div className={classes.spacer}></div>
    <div>
      <SparePieces side="top" />
      <Controls />
      <SparePieces side="bottom" />
    </div>
    <div className={classes.spacer}></div>
    <Actions />
  </div>
);

const Copyables = () => {
  return (
    <div className={layout.copyables}>
      <FenInput />
    </div>
  );
};

const Editor = () => {
  const makeStore = useInitStore();
  return (
    <PageStoreProvider factory={makeStore}>
      <div className={clsx(layout.editor, variables.editor)}>
        <Board />
        <Side />
        <Copyables />
      </div>
    </PageStoreProvider>
  );
};

export default Editor;
