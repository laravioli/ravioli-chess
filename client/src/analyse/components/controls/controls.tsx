import { History } from 'src/common/components/controls/history';
import { ControlsMenu } from './menu';
import clsx from 'clsx';
import layout from '../../css/layout.module.css';
import classes from '../../css/controls.module.css';

export const Controls = () => {
  return (
    <div className={clsx(layout.controls, classes.controls)}>
      <History />
      <ControlsMenu />
    </div>
  );
};
