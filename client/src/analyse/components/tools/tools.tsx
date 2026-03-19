import clsx from 'clsx';
import { Paper } from '@mantine/core';

import layout from '@/analyse/css/layout.module.css';
import classes from '@/analyse/css/tools.module.css';
import { Eval } from './eval/view';
import { Pvs } from './eval/pvs';
import { TView } from './tview';

export const Tools: React.FC = () => {
  return (
    <div className={clsx(layout.tools, classes.tools)}>
      <Eval />
      <Paper className={classes.paper}>
        <Pvs />
        <TView />
      </Paper>
    </div>
  );
};
