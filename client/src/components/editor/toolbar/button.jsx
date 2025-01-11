import { Button } from '@mantine/core';
import { useState } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/configboardstore';
import { DEFAULT_POSITION } from 'chess.js';

const EditorButton = ({ label, onClick = () => {}, isDisabled = false }) => {
  return (
    <Button
      variant="filled"
      color="rgba(56, 56, 56, 0.85)"
      size="md"
      radius="xs"
      onClick={onClick}
      disabled={isDisabled}>
      {label}
    </Button>
  );
};

export const StartButton = () => {
  const startBoard = useBoundStore((state) => state.startBoard);
  const newGame = useBoundStore((state) => state.newGame);

  const onStart = () => {
    startBoard();
    newGame(DEFAULT_POSITION);
  };

  return <EditorButton label="starting position" onClick={onStart} />;
};

export const ClearButton = () => {
  const currentMode = useBoundStore((state) => state.mode);
  const clearBoard = useBoundStore((state) => state.clearBoard);
  const clearGame = useBoundStore((state) => state.clearGame);
  const isDisabled = currentMode === mode.editor ? false : true;

  const onClear = () => {
    clearBoard();
    clearGame();
  };

  return (
    <EditorButton
      label="clear board"
      onClick={onClear}
      isDisabled={isDisabled}
    />
  );
};

export const FlipButton = () => {
  const flipBoard = useBoundStore((state) => state.flipBoard);

  const onFlip = () => flipBoard();

  return <EditorButton label="flip board" onClick={onFlip} />;
};

export const ContinueEditButton = () => {
  const [isEdit, setIsEdit] = useState(false);
  const dispatch = useBoundStore((state) => state.dispatchConf);
  const label = isEdit ? 'continue from here' : 'edit position';

  const onClick = () => {
    dispatch({ mode: isEdit ? mode.continue : mode.editor });
    setIsEdit(!isEdit);
  };

  return <EditorButton label={label} onClick={onClick} />;
};

export const TestButton = ({ label, onTest }) => {
  return <EditorButton label={label} onClick={onTest} />;
};
