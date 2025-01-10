import { useShallow } from 'zustand/shallow';
import { useBoardActions, useGameActions } from '../../stores/hooks/useactions';
import { useBoundStore } from '../../stores/hooks/useboundstore';
import { mode } from '../../stores/configboardstore';
import { Button } from '../button/button';
import { chess } from '../../stores/gamestore';

export function EditorActions() {
  //probably better to use ref here, tbd
  const { startBoard, clearBoard, flipBoard, boardPosition } =
    useBoardActions();
  const { newGame, clearGame } = useGameActions();
  const [confMode, dispatch] = useBoundStore(
    useShallow((state) => [state.mode, state.dispatchConf])
  );

  const onStartingPosition = () => {
    startBoard();
    newGame(boardPosition() + ' w KQkq - 0 1');
  };

  const onClearBoard = () => {
    clearBoard();
    clearGame();
  };

  const onFlipBoard = () => {
    flipBoard();
  };

  //move logic into button

  const onContinue = () => {
    dispatch({ mode: confMode === mode.editor ? mode.continue : mode.editor });
  };

  const test = () => {
    console.log('board ' + boardPosition());
    console.log('chess ' + chess.fen());
  };

  return (
    <div className="actions">
      <Button label="starting position" onClick={onStartingPosition} />
      <Button label="clear board" onClick={onClearBoard} />
      <Button label="flip board" onClick={onFlipBoard} />
      <Button label="continue from here" onClick={onContinue} />
      <Button label="position" onClick={test} />
    </div>
  );
}
