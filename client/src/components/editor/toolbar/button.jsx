import { Button } from '@mantine/core';
import { useState } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

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
  const boardApi = useBoundStore((state) => state.boardApi);
  const resetGame = useBoundStore((state) => state.resetGame);

  const onStart = () => {
    boardApi.startBoard();
    resetGame();
  };

  return <EditorButton label="starting position" onClick={onStart} />;
};

export const ClearButton = () => {
  const currentMode = useBoundStore((state) => state.currentMode);
  const boardApi = useBoundStore((state) => state.boardApi);
  const isDisabled = currentMode === mode.editor ? false : true;

  const onClear = () => {
    boardApi.clearBoard();
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
  const boardApi = useBoundStore((state) => state.boardApi);

  const onFlip = () => boardApi.flipBoard();

  return <EditorButton label="flip board" onClick={onFlip} />;
};

export const ContinueEditButton = () => {
  //add a test that check if the position is valid to continue
  const [isEdit, setIsEdit] = useState(false);
  const isValidFen = useBoundStore((state) => state.isValidFen);
  const dispatchConf = useBoundStore((state) => state.dispatchConf);
  const dispatchGame = useBoundStore((state) => state.dispatchGame);

  const label = isEdit ? 'continue from here' : 'edit position';

  const onClick = () => {
    dispatchConf({ mode: isEdit ? mode.continue : mode.editor });
    dispatchGame({ mode: isEdit ? mode.continue : mode.editor });

    setIsEdit(!isEdit);
  };

  return (
    <EditorButton
      label={label}
      onClick={onClick}
      isDisabled={isEdit && !isValidFen}
    />
  );
};

export const TestButton = ({ label, onTest }) => {
  return <EditorButton label={label} onClick={onTest} />;
};
