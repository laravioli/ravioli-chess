import clsx from 'clsx';
import { EvalTool } from './eval/tool';
import { Moves } from './move/move';
import { Controls } from './controls/controls';

export const Tools = () => {
  return (
    <div className={clsx('toolbar', 'mantine-visible-from-sm')}>
      <EvalTool />
      <Moves />
      <Controls />
    </div>
  );
};
