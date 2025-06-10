import clsx from 'clsx';
import { TurnToPlay } from '../controls/turn';
import { CastlingBoxes } from '../controls/castlings';
import { Positions } from '../controls/positions';
import { EditorActions } from '../controls/actions';
import classes from './tools.module.css';

export const Tools = () => {
  return (
    <div
      className={clsx(['toolbar', classes.tools, 'mantine-visible-from-sm'])}>
      <TurnToPlay />
      <CastlingBoxes />
      <Positions />
      <EditorActions />
    </div>
  );
};
