import { History } from 'src/common/components/controls/history';
import { Actions } from './actions';
import clsx from 'clsx';
import layout from '../../css/layout.module.css';
import styles from '../../css/controls.module.css';
import icon from 'src/common/css/icon.module.css';

export const Controls = () => {
  return (
    <div className={clsx(layout.controls, styles.controls)}>
      <div className={styles.history}>
        <History className={icon.icon} size="xxl" />
      </div>
      <Actions />
    </div>
  );
};
