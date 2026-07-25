import clsx from 'clsx';

import { History } from '@/common/components/controls/history';

import classes from '@/analyse/css/controls.module.css';
import layout from '@/analyse/css/layout.module.css';
import { ControlsMenu } from './menu';

export const Controls: React.FC = () => {
  return (
    <div className={clsx(layout.controls, classes.controls)}>
      <History className={classes.button} />
      <ControlsMenu />
    </div>
  );
};
