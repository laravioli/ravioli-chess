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
  const resetFen = useBoundStore((state) => state.resetFen);
  const resetGame = useBoundStore((state) => state.resetGame);

  const onStart = () => {
    boardApi.startBoard();
    resetFen(true);
    resetGame();
  };

  return <EditorButton label="starting position" onClick={onStart} />;
};

export const ClearButton = () => {
  const currentMode = useBoundStore((state) => state.currentMode);
  const boardApi = useBoundStore((state) => state.boardApi);
  const resetFen = useBoundStore((state) => state.resetFen);

  const onClear = () => {
    boardApi.clearBoard();
    resetFen(false);
  };

  return (
    <EditorButton
      label="clear board"
      onClick={onClear}
      isDisabled={currentMode !== mode.editor}
    />
  );
};

export const FlipButton = () => {
  const boardApi = useBoundStore((state) => state.boardApi);

  const onFlip = () => boardApi.flipBoard();

  return <EditorButton label="flip board" onClick={onFlip} />;
};

export const ContinueEditButton = () => {
  const [isEdit, setIsEdit] = useState(false);
  const isLegalFen = useBoundStore((state) => state.isLegalFen);
  const setFenSliceContinue = useBoundStore(
    (state) => state.setFenSliceContinue
  );
  const dispatchConf = useBoundStore((state) => state.dispatchConf);
  const dispatchGame = useBoundStore((state) => state.dispatchGame);

  const label = isEdit ? 'continue from here' : 'edit position';

  const onClick = () => {
    if (setFenSliceContinue()) {
      dispatchConf({ mode: isEdit ? mode.continue : mode.editor });
      dispatchGame({ mode: isEdit ? mode.continue : mode.editor });
      setIsEdit(!isEdit);
    }
  };

  return (
    <EditorButton
      label={label}
      onClick={onClick}
      isDisabled={isEdit && !isLegalFen}
    />
  );
};

export const TestButton = ({ label, onTest }) => {
  return <EditorButton label={label} onClick={onTest} />;
};
