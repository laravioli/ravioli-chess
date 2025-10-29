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

const Editor = () => {
  const makeStore = useInitStore();
  return (
    <PageStoreProvider factory={makeStore}>
      <div className={clsx(layout.editor, variables.editor)}>
        <Board />
        <div className={clsx(layout.side, classes.side)}>
          <SparePieces side="top" />
          <Controls />
          <SparePieces side="bottom" />
          <Actions />
        </div>
        <div className={layout.copyables}>
          <FenInput />
        </div>{' '}
      </div>
    </PageStoreProvider>
  );
};

export default Editor;
