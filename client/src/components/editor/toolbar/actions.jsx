import { Button } from '@mantine/core';
import {
  StartButton,
  ClearButton,
  FlipButton,
  ContinueEditButton,
  TestButton,
} from './button';
import { chess } from '../../../stores/gamestore';
import { useBoundStore } from '../../../stores/hooks/useboundstore';

export function EditorActions() {
  //test purpose
  const boardApi = useBoundStore((state) => state.boardApi);
  const gameHistory = useBoundStore((state) => state.gameHistory);

  const test = () => {
    console.log('board ' + boardApi.getBoardFen());
    console.log('chess ' + chess.fen());
    console.log('fen ' + useBoundStore.getState().fen());
    console.log(chess.history());
  };

  const undo = () => {
    gameHistory.next('undo');
  };

  const redo = () => {
    gameHistory.next('redo');
  };
  //endtest

  return (
    <Button.Group orientation="vertical">
      <StartButton />
      <ClearButton />
      <FlipButton />
      <ContinueEditButton />
      <TestButton label="position" onTest={test} />
      <TestButton label="undo" onTest={undo} />
      <TestButton label="redo" onTest={redo} />
    </Button.Group>
  );
}
