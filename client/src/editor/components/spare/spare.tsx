import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePageStore } from 'src/main/hooks/hooks';
import { dragNewPiece } from '@lichess-org/chessground/drag';
import clsx from 'clsx';
import layout from '../../css/layout.module.css';
import classes from '../../css/spare.module.css';
import type { EditorStore } from 'src/editor/store/editor';

type Selected = [Color, Role];

export const SparePieces = observer(({ side }: { side: 'top' | 'bottom' }) => {
  const editor = usePageStore<EditorStore>();
  const orientation = editor.orientation;
  const color: Color = side === 'bottom' ? orientation : opposite(orientation);
  const pieces = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].map(role => [color, role]);
  return (
    <div className={getClasses(side, color)}>
      {(pieces as Selected[]).map(([color, role]) => (
        <React.Fragment key={role}>
          <div
            className={classes.spare}
            onMouseDown={e =>
              dragNewPiece(editor.board!.state, { color: color, role: role }, e.nativeEvent, true)
            }
          >
            <div>
              <div className={clsx(classes.piece, classes[`${role}`])}></div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
});

const opposite = (color: Color): Color => (color === 'white' ? 'black' : 'white');
const getClasses = (side: 'top' | 'bottom', color: Color) =>
  clsx(layout[`spare-${side}`], classes[`spare-${side}`], classes[`spare-${color}`]);
