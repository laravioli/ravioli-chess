import clsx from 'clsx';

import { PageStoreProvider } from '@/core/context/provider';
import { Board } from '@/common/components/board';

import { useInitStore } from '@/editor/store/init';
import layout from '@/editor/css/layout.module.css';
import variables from '@/editor/css/variables.module.css';
import classes from '@/editor/css/side.module.css';
import { FenInput } from './fen/feninput';
import { Controls } from './controls/controls';
import { Actions } from './controls/actions';
import { SparePieces } from './spare/spare';

const Editor: React.FC = () => {
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
