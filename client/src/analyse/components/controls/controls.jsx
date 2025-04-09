import { History } from './history';
import { AnalyseActions } from './actions';
import classes from '../css/controls.module.css';

export const AnalyseControls = () => {
  return (
    <div className={classes.controls}>
      <History />
      <AnalyseActions />
    </div>
  );
};
