import { History } from './history';
import { Actions } from './actions';
import classes from './controls.module.css';

export const Controls = () => {
  return (
    <div className={classes.controls}>
      <History />
      <Actions />
    </div>
  );
};
