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

  const test = () => {
    console.log('board ' + boardApi.getBoardFen());
    console.log('chess ' + chess.fen());
    console.log('fen ' + useBoundStore.getState().fen);
  };
  //endtest

  return (
    <Button.Group orientation="vertical">
      <StartButton />
      <ClearButton />
      <FlipButton />
      <ContinueEditButton />
      <TestButton label="position" onTest={test} />
    </Button.Group>
  );
}
