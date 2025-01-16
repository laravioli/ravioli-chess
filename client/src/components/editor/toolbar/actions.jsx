import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { chess } from '../../../stores/gamestore';
import { Button } from '@mantine/core';
import {
  StartButton,
  ClearButton,
  FlipButton,
  ContinueEditButton,
  TestButton,
} from './button';

export function EditorActions() {
  //test purpose
  const boardApi = useBoundStore((state) => state.boardApi);
  const test = () => {
    console.log('board ' + boardApi.getBoardFen());
    console.log('chess ' + chess.fen());
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
