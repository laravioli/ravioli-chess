import { TurnToPlay } from '../controls/turn';
import { CastlingBoxes } from '../controls/castlings';
import { Positions } from '../controls/positions';
import { EditorActions } from '../controls/actions';
import classes from '../css/tools.module.css';

export const Tools = () => {
  return (
    <div className={['toolbar', classes.tools].join(' ')}>
      <TurnToPlay />
      <CastlingBoxes />
      <Positions />
      <EditorActions />
    </div>
  );
};
