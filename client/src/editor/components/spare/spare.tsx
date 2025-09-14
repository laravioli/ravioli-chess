import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePageStore } from 'src/main/hooks/hooks';
import { dragNewPiece } from '@lichess-org/chessground/drag';
import clsx from 'clsx';
import classes from '../../css/spare.module.css';

export const SparePieces = observer(({ side }) => {
  const editor = usePageStore();
  const orientation = editor.orientation;
  const color = side === 'bottom' ? orientation : opposite(orientation);
  const pieces = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].map(role => [color, role]);
  return (
    <div className={getClasses(side, color)}>
      {pieces.map(p => (
        <React.Fragment key={p[1]}>
          <div
            className={classes.spare}
            onMouseDown={e => dragNewPiece(editor.board.state, { color: p[0], role: p[1] }, e, true)}
          >
            <div>
              <div className={clsx(classes.piece, classes[`${p[1]}`])}></div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
});

const opposite = color => (color === 'white' ? 'black' : 'white');
const getClasses = (side, color) => clsx(classes[`spare-${side}`], classes[`spare-${color}`]);
