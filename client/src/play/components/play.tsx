import { PageStoreProvider } from 'src/main/context/provider';
import { Board } from 'src/common/components/board/board';
import { Tools } from './tools/tools';
import clsx from 'clsx';
import layout from '../css/layout.module.css';
import variables from '../css/variables.module.css';

const Play = () => {
  return (
    <PageStoreProvider>
      <div className={clsx(layout.play, variables.play)}>
        <Board />
        <Tools />
      </div>
    </PageStoreProvider>
  );
};

export default Play;
