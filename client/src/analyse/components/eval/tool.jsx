import { EvalToggle } from './toggle';
import { EvalScore } from './score';
import { Depth } from './depth';
import { Settings } from './settings';
import classes from './eval.module.css';
import { useEffect } from 'react';

export const EvalTool = () => {
  console.log('start rendering eval');
  useEffect(() => {
    console.log('eval mounted finish');
    return () => console.log('eval unmoutned finish');
  });
  return (
    <div className={classes.evaltool}>
      <EvalToggle />
      <EvalScore />
      <span className={classes.evalinfo}>SF 16</span>
      <Depth />
      <Settings />
    </div>
  );
};
